package com.example.engTest.config;

import com.example.engTest.dto.User;
import com.example.engTest.service.ActivityLogService;
import com.example.engTest.utils.RequestUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Map;

@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class ActivityLoggingAspect {

    private final ActivityLogService activityLogService;

    // 액션 매핑: 메서드 이름 패턴 -> 액션 이름
    private static final Map<String, String> ACTION_MAP = Map.ofEntries(
            // 로그인/로그아웃
            Map.entry("login", "LOGIN_SUCCESS"),
            Map.entry("logout", "LOGOUT"),

            // 시험
            Map.entry("startExam", "EXAM_START"),
            Map.entry("submitExam", "EXAM_COMPLETE"),
            Map.entry("submitAnswer", "EXAM_ANSWER"),
            Map.entry("submitOfflineGradedAnswers", "EXAM_COMPLETE"),

            // 회차 관리
            Map.entry("createRound", "ROUND_CREATE"),
            Map.entry("updateRound", "ROUND_UPDATE"),
            Map.entry("deleteRound", "ROUND_DELETE"),

            // 문제 생성
            Map.entry("generateQuestions", "QUESTION_GENERATE"),
            Map.entry("generateFromImages", "QUESTION_GENERATE"),

            // 파일
            Map.entry("uploadAnswerSheet", "FILE_UPLOAD"),
            Map.entry("downloadVocabulary", "FILE_DOWNLOAD"),
            Map.entry("uploadMaterial", "FILE_UPLOAD"));

    @Around("execution(* com.example.engTest.controller.*Controller.*(..))")
    public Object logActivity(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();
        String methodName = joinPoint.getSignature().getName();

        // 로그 조회 API는 로깅하지 않음 (무한 루프 방지)
        if (methodName.startsWith("getLogs") || methodName.startsWith("getLogSettings")
                || methodName.startsWith("exportLogs") || methodName.startsWith("getActions")
                || methodName.startsWith("recordLog")
                || methodName.startsWith("get") || methodName.startsWith("find")) {
            return joinPoint.proceed();
        }

        // Request 정보를 지금 (동기적으로) 추출
        HttpServletRequest request = getCurrentRequest();
        String ipAddress = RequestUtils.getClientIp(request);
        String userAgent = request != null ? request.getHeader("User-Agent") : null;
        String requestPath = request != null ? request.getRequestURI() : null;
        String httpMethod = request != null ? request.getMethod() : null;

        // ★★★ 세션에서 사용자 정보를 먼저 추출 (API 호출 전에) ★★★
        Long userId = null;
        String userName = null;

        if (request != null) {
            HttpSession session = request.getSession(false);
            if (session != null) {
                Object sessionUserId = session.getAttribute("userId");
                Object sessionUserName = session.getAttribute("userName");
                if (sessionUserId instanceof Long) {
                    userId = (Long) sessionUserId;
                } else if (sessionUserId instanceof Number) {
                    userId = ((Number) sessionUserId).longValue();
                }
                if (sessionUserName instanceof String) {
                    userName = (String) sessionUserName;
                }
            }
        }

        Object result = null;
        Integer responseStatus = 200;
        String action = null;
        String targetType = null;
        Long targetId = null;
        String details = null;

        try {
            result = joinPoint.proceed();

            // 액션 결정
            action = determineAction(methodName);

            // 액션이 null이면 로깅 안 함 (중요하지 않은 조회 등)
            if (action == null) {
                return result;
            }

            // 1. 로그인의 경우: 응답에서 사용자 정보 추출 (세션에 아직 없을 수 있음)
            if (result instanceof ResponseEntity<?> responseEntity) {
                Object body = responseEntity.getBody();
                if (body instanceof User user) {
                    userId = user.getId();
                    userName = user.getName();
                }
            }

            // 2. 파라미터에서 targetId 추출
            Object[] args = joinPoint.getArgs();
            for (Object arg : args) {
                if (arg instanceof Long longVal) {
                    if (targetId == null) {
                        targetId = longVal;
                    }
                }
                if (arg instanceof Map) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> map = (Map<String, Object>) arg;

                    // 파라미터에서 userId/userName 추출 (세션에 없을 경우)
                    if (userId == null && map.containsKey("userId")) {
                        Object userIdObj = map.get("userId");
                        if (userIdObj instanceof Number) {
                            userId = ((Number) userIdObj).longValue();
                        }
                    }
                    if (userName == null && map.containsKey("userName")) {
                        userName = (String) map.get("userName");
                    }
                    if (userName == null && map.containsKey("name")) {
                        userName = (String) map.get("name");
                    }
                }
            }

            // 타겟 타입 결정
            targetType = determineTargetType(methodName);

        } catch (Exception e) {
            responseStatus = 500;
            action = "API_ERROR";
            details = e.getMessage();
            throw e;
        } finally {
            long duration = System.currentTimeMillis() - startTime;

            if (action != null) {
                activityLogService.logAsync(action, userId, userName, targetType,
                        targetId, details, ipAddress, userAgent, requestPath, httpMethod,
                        responseStatus, duration);
                log.debug("Logged activity: {} for user {} ({})", action, userName, userId);
            }
        }

        return result;
    }

    private String determineAction(String methodName) {
        for (Map.Entry<String, String> entry : ACTION_MAP.entrySet()) {
            if (methodName.toLowerCase().contains(entry.getKey().toLowerCase())) {
                return entry.getValue();
            }
        }
        return null;
    }

    private String determineTargetType(String methodName) {
        String lower = methodName.toLowerCase();
        if (lower.contains("exam"))
            return "EXAM";
        if (lower.contains("round"))
            return "ROUND";
        if (lower.contains("question"))
            return "QUESTION";
        if (lower.contains("user"))
            return "USER";
        if (lower.contains("material") || lower.contains("file") || lower.contains("upload"))
            return "FILE";
        return null;
    }

    private HttpServletRequest getCurrentRequest() {
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            return attrs != null ? attrs.getRequest() : null;
        } catch (Exception e) {
            return null;
        }
    }

}

package com.example.engTest.controller;

import com.example.engTest.dto.User;
import com.example.engTest.dto.UserStats;
import com.example.engTest.service.UserService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@io.swagger.v3.oas.annotations.tags.Tag(name = "User Management", description = "사용자 관리 API")
public class UserController {

    private final UserService userService;

    @GetMapping
    @io.swagger.v3.oas.annotations.Operation(summary = "전체 사용자 조회", description = "시스템에 등록된 모든 사용자를 조회합니다.")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    @io.swagger.v3.oas.annotations.Operation(summary = "사용자 상세 조회", description = "ID로 특정 사용자를 조회합니다.")
    public ResponseEntity<User> getUserById(@PathVariable("id") Long id) {
        User user = userService.getUserById(id);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user);
    }

    @PostMapping("/login")
    @io.swagger.v3.oas.annotations.Operation(summary = "로그인 (이름)", description = "이름으로 로그인합니다 (없으면 자동 가입).")
    public ResponseEntity<User> login(@RequestBody Map<String, String> request, HttpSession session) {
        String name = request.get("name");
        if (name == null || name.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        User user = userService.getOrCreateUser(name.trim());
        session.setAttribute("userId", user.getId());
        session.setAttribute("userName", user.getName());
        return ResponseEntity.ok(user);
    }

    @PostMapping("/logout")
    @io.swagger.v3.oas.annotations.Operation(summary = "로그아웃", description = "현재 세션을 종료합니다.")
    public ResponseEntity<Void> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    @io.swagger.v3.oas.annotations.Operation(summary = "현재 로그인 사용자", description = "세션 정보를 기반으로 현재 로그인된 사용자를 반환합니다.")
    public ResponseEntity<User> getCurrentUser(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        User user = userService.getUserById(userId);
        if (user == null) {
            session.invalidate();
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(user);
    }

    @GetMapping("/stats")
    @io.swagger.v3.oas.annotations.Operation(summary = "사용자별 통계 (순위)", description = "모든 사용자의 시험 통계를 조회합니다.")
    public ResponseEntity<List<UserStats>> getUserStats() {
        return ResponseEntity.ok(userService.getUserStats());
    }

    @GetMapping("/{id}/stats")
    @io.swagger.v3.oas.annotations.Operation(summary = "특정 사용자 통계", description = "ID로 특정 사용자의 시험 통계를 조회합니다.")
    public ResponseEntity<UserStats> getUserStatsById(@PathVariable("id") Long id) {
        UserStats stats = userService.getUserStatsById(id);
        if (stats == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(stats);
    }
}

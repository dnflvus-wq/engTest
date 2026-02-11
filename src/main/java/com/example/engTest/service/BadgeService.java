package com.example.engTest.service;

import com.example.engTest.dto.UserBadge;
import com.example.engTest.mapper.BadgeMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BadgeService {

    private final BadgeMapper badgeMapper;

    public List<UserBadge> getUserBadges(Long userId) {
        return badgeMapper.findUserBadges(userId);
    }

    public List<UserBadge> getEquippedBadges(Long userId) {
        return badgeMapper.findEquippedBadges(userId);
    }

    @Transactional
    public void awardBadge(Long userId, String badgeId) {
        if (badgeId == null) return;
        UserBadge existing = badgeMapper.findUserBadge(userId, badgeId);
        if (existing == null) {
            UserBadge ub = UserBadge.builder()
                    .userId(userId)
                    .badgeId(badgeId)
                    .build();
            badgeMapper.insertUserBadge(ub);
            log.info("Badge awarded: userId={}, badgeId={}", userId, badgeId);
        }
    }

    @Transactional
    public void equipBadge(Long userId, String badgeId, int slotNumber) {
        if (slotNumber < 1 || slotNumber > 5) {
            throw new IllegalArgumentException("Slot number must be between 1 and 5");
        }
        UserBadge badge = badgeMapper.findUserBadge(userId, badgeId);
        if (badge == null) {
            throw new IllegalArgumentException("Badge not earned: " + badgeId);
        }
        // 해당 슬롯에 이미 다른 뱃지가 있으면 해제
        badgeMapper.unequipBadge(userId, slotNumber);
        // 이 뱃지가 다른 슬롯에 장착되어 있으면 해제
        badgeMapper.unequipBadgeById(userId, badgeId);
        // 장착
        badgeMapper.equipBadge(userId, badgeId, slotNumber);
    }

    @Transactional
    public void unequipBadge(Long userId, int slotNumber) {
        badgeMapper.unequipBadge(userId, slotNumber);
    }

    public int countUserBadges(Long userId) {
        return badgeMapper.countUserBadges(userId);
    }

    public Map<Long, List<UserBadge>> getAllEquippedBadges() {
        return badgeMapper.findAllEquippedBadges().stream()
                .collect(Collectors.groupingBy(UserBadge::getUserId));
    }
}

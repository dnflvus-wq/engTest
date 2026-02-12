package com.example.engTest.mapper;

import com.example.engTest.dto.Badge;
import com.example.engTest.dto.UserBadge;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface BadgeMapper {

    List<Badge> findAll();

    Badge findById(@Param("id") String id);

    // 사용자 뱃지
    List<UserBadge> findUserBadges(@Param("userId") Long userId);

    List<UserBadge> findEquippedBadges(@Param("userId") Long userId);

    UserBadge findUserBadge(@Param("userId") Long userId, @Param("badgeId") String badgeId);

    void insertUserBadge(UserBadge ub);

    void equipBadge(@Param("userId") Long userId, @Param("badgeId") String badgeId, @Param("slotNumber") int slotNumber);

    void unequipBadge(@Param("userId") Long userId, @Param("slotNumber") int slotNumber);

    void unequipBadgeById(@Param("userId") Long userId, @Param("badgeId") String badgeId);

    int countUserBadges(@Param("userId") Long userId);

    List<UserBadge> findAllEquippedBadges();

    // 관리자: 뱃지 수정
    void updateBadge(Badge badge);
}

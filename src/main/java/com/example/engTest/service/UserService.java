package com.example.engTest.service;

import com.example.engTest.dto.User;
import com.example.engTest.dto.UserStats;
import com.example.engTest.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserMapper userMapper;

    public List<User> getAllUsers() {
        return userMapper.findAll();
    }

    public User getUserById(Long id) {
        return userMapper.findById(id);
    }

    public User getUserByName(String name) {
        return userMapper.findByName(name);
    }

    @Transactional
    public User getOrCreateUser(String name) {
        User user = userMapper.findByName(name);
        if (user == null) {
            user = User.builder().name(name).build();
            userMapper.insert(user);
        }
        return user;
    }

    @Transactional
    public User createUser(User user) {
        userMapper.insert(user);
        return user;
    }

    @Transactional
    public void updateUser(User user) {
        userMapper.update(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        userMapper.delete(id);
    }

    public List<UserStats> getUserStats() {
        List<UserStats> stats = userMapper.getUserStats();
        // 순위 계산
        for (int i = 0; i < stats.size(); i++) {
            stats.get(i).setRank(i + 1);
        }
        return stats;
    }

    public UserStats getUserStatsById(Long userId) {
        return userMapper.getUserStatsById(userId);
    }
}

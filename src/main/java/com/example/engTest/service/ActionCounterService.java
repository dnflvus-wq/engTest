package com.example.engTest.service;

import com.example.engTest.mapper.UserActionCounterMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class ActionCounterService {

    private final UserActionCounterMapper counterMapper;

    public void increment(Long userId, String action) {
        counterMapper.incrementOrInsert(userId, action);
    }

    public int getCount(Long userId, String action) {
        return counterMapper.getCount(userId, action);
    }
}

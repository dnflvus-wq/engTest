package com.example.engTest.service;

import com.example.engTest.dto.Round;
import com.example.engTest.dto.RoundStats;
import com.example.engTest.mapper.RoundMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoundService {

    private final RoundMapper roundMapper;

    public List<Round> getAllRounds() {
        return roundMapper.findAll();
    }

    public List<Round> getActiveRounds() {
        return roundMapper.findActiveRounds();
    }

    public Round getRoundById(Long id) {
        return roundMapper.findById(id);
    }

    @Transactional
    public Round createRound(Round round) {
        if (round.getStatus() == null) {
            round.setStatus("ACTIVE");
        }
        if (round.getDifficulty() == null) {
            round.setDifficulty("MEDIUM");
        }
        if (round.getQuestionCount() == null) {
            round.setQuestionCount(20);
        }
        roundMapper.insert(round);
        return round;
    }

    @Transactional
    public void updateRound(Round round) {
        roundMapper.update(round);
    }

    @Transactional
    public void updateRoundStatus(Long id, String status) {
        roundMapper.updateStatus(id, status);
    }

    @Transactional
    public void deleteRound(Long id) {
        roundMapper.delete(id);
    }

    public List<RoundStats> getRoundStats() {
        return roundMapper.getRoundStats();
    }

    public RoundStats getRoundStatsById(Long roundId) {
        return roundMapper.getRoundStatsById(roundId);
    }
}

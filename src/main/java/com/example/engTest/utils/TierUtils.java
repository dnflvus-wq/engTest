package com.example.engTest.utils;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Map;

public final class TierUtils {

    public static final String[] TIER_ORDER = {"BRONZE", "SILVER", "GOLD", "DIAMOND"};

    private TierUtils() {
    }

    public static int indexOf(String tier) {
        if (tier == null) return -1;
        for (int i = 0; i < TIER_ORDER.length; i++) {
            if (TIER_ORDER[i].equals(tier)) return i;
        }
        return -1;
    }

    public static int compareTier(String a, String b) {
        return indexOf(a) - indexOf(b);
    }

    public static Map<String, Integer> parseThresholds(ObjectMapper objectMapper, String json) {
        if (json == null || json.isBlank()) return null;
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            return null;
        }
    }
}

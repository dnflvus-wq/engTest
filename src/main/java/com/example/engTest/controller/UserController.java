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
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        try {
            return ResponseEntity.ok(userService.getAllUsers());
        } catch (Exception e) {
            e.printStackTrace(); // Log to console
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", String.valueOf(e.getMessage()), "cause", e.toString()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user);
    }

    @PostMapping("/login")
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
    public ResponseEntity<Void> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
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
    public ResponseEntity<List<UserStats>> getUserStats() {
        return ResponseEntity.ok(userService.getUserStats());
    }

    @GetMapping("/{id}/stats")
    public ResponseEntity<UserStats> getUserStatsById(@PathVariable Long id) {
        UserStats stats = userService.getUserStatsById(id);
        if (stats == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(stats);
    }
}

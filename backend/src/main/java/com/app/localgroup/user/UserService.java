package com.app.localgroup.user;

import com.app.localgroup.user.dto.UserProfileDto;
import com.app.localgroup.user.model.User;
import com.app.localgroup.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public Optional<UserProfileDto> getCurrentUser(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) return Optional.empty();
        String userId = (String) auth.getPrincipal();
        return userRepository.findById(userId).map(u -> UserProfileDto.builder()
                .id(u.getId())
                .email(u.getEmail())
                .phone(u.getPhone())
                .verified(u.isVerified())
                .trustScore(u.getTrustScore())
                .blockedUsers(u.getBlockedUsers())
                .createdAt(u.getCreatedAt())
                .build());
    }

    public Optional<Integer> getTrustScore(Authentication auth) {
        return getCurrentUser(auth).map(UserProfileDto::getTrustScore);
    }

    public void blockUser(Authentication auth, String toBlockUserId) {
        if (auth == null || auth.getPrincipal() == null) return;
        String userId = (String) auth.getPrincipal();
        userRepository.findById(userId).ifPresent(u -> {
            if (!u.getBlockedUsers().contains(toBlockUserId)) {
                u.getBlockedUsers().add(toBlockUserId);
                userRepository.save(u);
            }
        });
    }
}

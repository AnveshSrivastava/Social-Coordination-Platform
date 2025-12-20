package com.app.localgroup.user.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@Builder
public class UserProfileDto {
    private String id;
    private String email;
    private String phone;
    private boolean verified;
    private int trustScore;
    private List<String> blockedUsers;
    private Instant createdAt;
}

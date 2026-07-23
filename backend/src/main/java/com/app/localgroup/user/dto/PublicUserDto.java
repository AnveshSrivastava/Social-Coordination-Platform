package com.app.localgroup.user.dto;

import lombok.Builder;
import lombok.Data;

/**
 * Public profile DTO — returned from GET /users/{id} and embedded in MemberInfoDto.
 * Exposes ONLY: username, trustScore, totalTrips.
 * Everything else (email, phone, age, gender, bio) is intentionally omitted.
 */
@Data
@Builder
public class PublicUserDto {
    private String id;
    private String username;
    private int trustScore;
    private int totalTrips;
}

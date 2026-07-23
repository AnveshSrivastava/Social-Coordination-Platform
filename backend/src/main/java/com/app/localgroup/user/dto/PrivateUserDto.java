package com.app.localgroup.user.dto;

import com.app.localgroup.user.model.Gender;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

/**
 * Full profile DTO — returned only from GET /users/me.
 * Contains all user data including private fields.
 * Must NEVER be returned to any endpoint other than the owner.
 */
@Data
@Builder
public class PrivateUserDto {
    private String id;
    private String username;
    private String email;
    private String phone;
    private Integer age;
    private Gender gender;
    private String bio;
    private boolean verified;
    private int trustScore;
    private int totalTrips;
    private boolean profileComplete;   // derived: username != null && age != null && gender != null
    private List<String> placesVisited; // derived from completed group memberships
    private List<String> blockedUsers;
    private Instant createdAt;
}

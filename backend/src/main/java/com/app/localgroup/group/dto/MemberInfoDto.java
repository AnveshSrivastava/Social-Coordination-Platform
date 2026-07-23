package com.app.localgroup.group.dto;

import lombok.Builder;
import lombok.Data;

/**
 * Member info included in GroupDto for CONFIRMATION and ACTIVE groups.
 *
 * Privacy: exposes username ONLY — never email or any other private field.
 * Previously this DTO leaked email addresses via a field named 'name'.
 */
@Data
@Builder
public class MemberInfoDto {
    private String userId;
    private String username;   // user's public username — NOT email
    private int trustScore;
    private int totalTrips;
}

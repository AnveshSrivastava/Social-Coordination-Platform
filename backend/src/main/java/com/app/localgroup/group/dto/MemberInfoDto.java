package com.app.localgroup.group.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MemberInfoDto {
    private String userId;
    private String name;
    private int trustScore;
    private int totalTrips;
}

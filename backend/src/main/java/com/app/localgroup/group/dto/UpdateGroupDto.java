package com.app.localgroup.group.dto;

import lombok.Data;

import java.time.Instant;

@Data
public class UpdateGroupDto {
    private Instant dateTime;
    private Integer maxSize;
}

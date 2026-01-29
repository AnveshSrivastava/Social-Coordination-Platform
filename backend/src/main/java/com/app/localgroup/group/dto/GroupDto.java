package com.app.localgroup.group.dto;

import com.app.localgroup.group.model.Group;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class GroupDto {
    private String id;
    private String placeId;
    private String creatorId;
    private Instant dateTime;
    private int maxSize;
    private Group.Visibility visibility;
    private Group.Status status;
    private Instant createdAt;
    private long memberCount;
}

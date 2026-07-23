package com.app.localgroup.group.dto;

import com.app.localgroup.group.model.Group;
import com.app.localgroup.group.model.GenderRestriction;
import com.app.localgroup.place.model.Place;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@Builder
public class GroupDto {
    private String id;
    private String placeId;

    // Place enrichment — populated from PlaceService.findById(placeId).
    // No snapshot object; flat fields directly on the DTO.
    private String placeName;
    private String placeCategory;
    private String placeAddress;   // optional; null if not available

    private String creatorId;
    private Instant dateTime;
    private int maxSize;
    private Group.Visibility visibility;
    private Group.Status status;
    private GenderRestriction genderRestriction;
    private Instant createdAt;
    private long memberCount;
    private boolean confirmed;
    private int confirmationEligibleCount;
    private int confirmationConfirmedCount;
    private List<MemberInfoDto> members;
}

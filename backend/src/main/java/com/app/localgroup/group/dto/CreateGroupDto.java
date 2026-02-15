package com.app.localgroup.group.dto;

import com.app.localgroup.group.model.Group;
import com.app.localgroup.place.dto.MapPlaceDto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.Instant;

/**
 * DTO for creating a group.
 * 
 * Supports two flows:
 * 1. EXISTING FLOW: placeId only (backward compatible, uses manually created places)
 * 2. NEW FLOW: mapPlace only (creates dynamic places from map selection)
 * 
 * Validation: At least one of placeId or mapPlace must be provided.
 */
@Data
public class CreateGroupDto {
    // Legacy flow: existing manually created places
    private String placeId;

    // New flow: dynamic places from map selection
    @Valid
    private MapPlaceDto mapPlace;

    @NotNull
    private Instant dateTime;

    @Min(2)
    @Max(6)
    private int maxSize;

    @NotNull
    private Group.Visibility visibility;

    private String inviteCode; // only for PRIVATE
}


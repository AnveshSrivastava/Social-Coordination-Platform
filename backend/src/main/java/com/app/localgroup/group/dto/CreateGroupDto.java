package com.app.localgroup.group.dto;

import com.app.localgroup.group.model.Group;
import com.app.localgroup.group.model.GenderRestriction;
import com.app.localgroup.place.dto.MapPlaceDto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.Instant;

@Data
public class CreateGroupDto {
    private String placeId;

    @Valid
    private MapPlaceDto mapPlace;

    @NotNull
    private Instant dateTime;

    @Min(2)
    @Max(6)
    private int maxSize;

    @NotNull
    private Group.Visibility visibility;

    private String inviteCode;

    /**
     * Gender restriction for this group.
     * Defaults to EVERYONE if not specified by the creator.
     * Backend enforces join rules — frontend selection alone is NOT sufficient.
     */
    private GenderRestriction genderRestriction = GenderRestriction.EVERYONE;
}

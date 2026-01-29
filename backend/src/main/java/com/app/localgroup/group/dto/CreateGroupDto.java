package com.app.localgroup.group.dto;

import com.app.localgroup.group.model.Group;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.Instant;

@Data
public class CreateGroupDto {
    @NotBlank
    private String placeId;

    @NotNull
    private Instant dateTime;

    @Min(2)
    @Max(6)
    private int maxSize;

    @NotNull
    private Group.Visibility visibility;

    private String inviteCode; // only for PRIVATE
}

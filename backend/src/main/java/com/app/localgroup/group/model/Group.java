package com.app.localgroup.group.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "groups")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Group {
    @Id
    private String id;

    private String placeId;

    private String creatorId;

    private Instant dateTime;

    @Builder.Default
    @Indexed
    private int maxSize = 2;

    private Visibility visibility;

    private Status status;

    /**
     * Gender restriction for membership.
     * Default: EVERYONE (all genders may join).
     *
     * Enforcement rules (backend only — see GroupService.joinGroup):
     * - EVERYONE    → MALE, FEMALE, OTHER may all join
     * - MALE_ONLY   → only MALE; FEMALE and OTHER are rejected
     * - FEMALE_ONLY → only FEMALE; MALE and OTHER are rejected
     */
    @Builder.Default
    private GenderRestriction genderRestriction = GenderRestriction.EVERYONE;

    private String inviteCodeHash;

    @Builder.Default
    private List<String> confirmationEligibleUserIds = new ArrayList<>();

    @Builder.Default
    private Instant createdAt = Instant.now();

    public enum Visibility { PUBLIC, PRIVATE }

    public enum Status { CREATED, JOINABLE, CONFIRMATION, ACTIVE, EXPIRED }
}

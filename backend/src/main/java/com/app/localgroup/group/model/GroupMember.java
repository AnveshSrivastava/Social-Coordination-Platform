package com.app.localgroup.group.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "group_members")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupMember {
    @Id
    private String id;

    private String groupId;

    private String userId;

    @Builder.Default
    private boolean confirmed = false;

    @Builder.Default
    private Instant joinedAt = Instant.now();
}

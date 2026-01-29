package com.app.localgroup.safety.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "safety_events")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SafetyEvent {
    @Id
    private String id;
    private String groupId;
    private String triggeredBy;
    @Builder.Default
    private Instant timestamp = Instant.now();
    private Status status;

    public enum Status { OPEN, RESOLVED }
}

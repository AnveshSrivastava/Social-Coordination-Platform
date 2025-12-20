package com.app.localgroup.user.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    @Indexed(unique = true)
    private String phone;

    @Builder.Default
    private boolean verified = false;

    @Builder.Default
    private int trustScore = 0;

    @Builder.Default
    private List<String> blockedUsers = new ArrayList<>();

    @Builder.Default
    private Instant createdAt = Instant.now();
}

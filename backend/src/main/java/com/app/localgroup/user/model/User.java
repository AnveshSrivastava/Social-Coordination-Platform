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

    /**
     * Username: unique, 3–25 chars, ^[a-zA-Z0-9_]+$ (stored lowercase).
     * Null for users who have not completed their profile yet.
     * Sparse unique index created in MongoConfig to allow multiple nulls.
     */
    private String username;

    /**
     * Age: 13–99. Immutable after first save — enforced in UserService.
     * Null for users who have not completed their profile yet.
     */
    private Integer age;

    /**
     * Gender: MALE, FEMALE, OTHER. Immutable after first save — enforced in UserService.
     * Null for users who have not completed their profile yet.
     */
    private Gender gender;

    /**
     * Optional bio, max 250 characters. Always editable.
     */
    private String bio;

    @Builder.Default
    private boolean verified = false;

    @Builder.Default
    private int trustScore = 0;

    @Builder.Default
    private int totalTrips = 0;

    @Builder.Default
    private List<String> blockedUsers = new ArrayList<>();

    @Builder.Default
    private Instant createdAt = Instant.now();
}

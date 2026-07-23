package com.app.localgroup.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * DTO for ephemeral chat messages (never persisted to database).
 *
 * Privacy: senderEmail was removed and replaced with senderUsername.
 * Email must never be broadcast over WebSocket to group members.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageDTO {

    private String groupId;

    private String senderId;

    /** Sender's public username — NOT their email address. */
    private String senderUsername;

    @NotBlank(message = "Message content cannot be blank")
    @Size(max = 500, message = "Message content cannot exceed 500 characters")
    private String content;

    @Builder.Default
    private Instant timestamp = Instant.now();
}

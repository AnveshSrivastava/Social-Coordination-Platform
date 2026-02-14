package com.app.localgroup.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * DTO for chat messages.
 * Ephemeral - never persisted to database.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageDTO {

    private String groupId;

    private String senderId;

    private String senderEmail;

    @NotBlank(message = "Message content cannot be blank")
    @Size(max = 500, message = "Message content cannot exceed 500 characters")
    private String content;

    @Builder.Default
    private Instant timestamp = Instant.now();
}

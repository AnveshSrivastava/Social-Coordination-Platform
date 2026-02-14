package com.app.localgroup.chat;

import com.app.localgroup.chat.dto.ChatMessageDTO;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.messaging.handler.annotation.MessageMapping;

/**
 * Controller for WebSocket chat messages.
 * Validates JWT, extracts userId, and delegates to ChatService.
 */
@Controller
public class ChatController {

    private static final Logger log = LoggerFactory.getLogger(ChatController.class);

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    /**
     * Handles incoming chat messages.
     * Route: /app/chat.send/{groupId}
     *
     * @param groupId  the group ID from path
     * @param message  the chat message DTO
     * @param headers  STOMP message headers with userId from JWT
     */
    @MessageMapping("/chat.send/{groupId}")
    public void handleChat(
            @DestinationVariable String groupId,
            @Payload @Valid ChatMessageDTO message,
            SimpMessageHeaderAccessor headers
    ) {
        String userId = (String) headers.getSessionAttributes().get("userId");

        if (userId == null) {
            log.warn("Chat rejected: userId not found in session");
            throw new IllegalArgumentException("User ID not found in session");
        }

        try {
            chatService.sendMessage(groupId, userId, message.getContent());
        } catch (ChatService.ChatException ex) {
            log.error("Chat error for user {} in group {}: {} [{}]",
                    userId, groupId, ex.getMessage(), ex.getErrorCode());
            throw new RuntimeException(ex.getMessage());
        }
    }
}


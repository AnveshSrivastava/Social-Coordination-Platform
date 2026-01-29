package com.app.localgroup.chat;

import jakarta.validation.constraints.NotBlank;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {
    private static final Logger log = LoggerFactory.getLogger(ChatController.class);

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @MessageMapping("/group/{groupId}/chat")
    public void handleChat(@Payload ChatMessage msg, SimpMessageHeaderAccessor headers) {
        // headers should contain simpUser with principal set by handshake interceptor (not implemented here)
        String groupId = headers.getDestination().split("/")[3];
        String user = (String) headers.getUser().getName();
        chatService.broadcast(groupId, msg.getText(), user);
    }
}

package com.app.localgroup.chat;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.Map;

@Component
public class ChatEventListener {
    private static final Logger log = LoggerFactory.getLogger(ChatEventListener.class);

    @EventListener
    public void handleSessionDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor sha = StompHeaderAccessor.wrap(event.getMessage());
        Map<String, Object> attrs = sha.getSessionAttributes();
        if (attrs == null) return;
        String userId = (String) attrs.get("userId");
        String groupId = (String) attrs.get("groupId");
        log.info("WebSocket disconnect - userId={} groupId={}", userId, groupId);
    }
}

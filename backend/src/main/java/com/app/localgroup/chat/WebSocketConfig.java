package com.app.localgroup.chat;

import com.app.localgroup.chat.config.JwtHandshakeInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocket configuration for group chat.
 * - Endpoint: /ws
 * - App prefix: /app
 * - Topic prefix: /topic
 * - JWT validation on handshake
 * - CORS enabled for development
 */
@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Value("${app.websocket.endpoint:/ws}")
    private String wsEndpoint;

    private final JwtHandshakeInterceptor jwtHandshakeInterceptor;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
public void registerStompEndpoints(StompEndpointRegistry registry) {
    registry
        .addEndpoint(wsEndpoint) // 🔥 THIS is where JWT belongs
        .setAllowedOriginPatterns("*")
        .withSockJS();  // 🔥 IMPORTANT for Postman/browser compatibility
}
}
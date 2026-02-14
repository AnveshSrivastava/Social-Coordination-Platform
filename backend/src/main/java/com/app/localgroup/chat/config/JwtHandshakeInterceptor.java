package com.app.localgroup.chat.config;

import com.app.localgroup.common.Constants;
import io.jsonwebtoken.Claims;
import com.app.localgroup.config.jwt.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.security.Key;

/**
 * Validates JWT tokens during WebSocket handshake.
 * Extracts userId from token and stores in session attributes.
 */
@Component
public class JwtHandshakeInterceptor implements ChannelInterceptor {

    private static final Logger log = LoggerFactory.getLogger(JwtHandshakeInterceptor.class);

    private final JwtUtil jwtUtil;

    public JwtHandshakeInterceptor(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

        // Only validate on CONNECT
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authHeader = accessor.getFirstNativeHeader(Constants.AUTH_HEADER);

            if (!StringUtils.hasText(authHeader) || !authHeader.startsWith(Constants.TOKEN_PREFIX)) {
                log.warn("WebSocket connection rejected: missing or invalid Authorization header");
                throw new IllegalArgumentException("Missing or invalid Authorization header");
            }

            String token = authHeader.substring(Constants.TOKEN_PREFIX.length());

            try {
                Claims claims = jwtUtil.parseClaims(token);

                String userId = claims.getSubject();

                if (!StringUtils.hasText(userId)) {
                    log.warn("WebSocket connection rejected: token has no subject");
                    throw new IllegalArgumentException("Token has no subject");
                }

                // Store userId in session attributes
                accessor.getSessionAttributes().put("userId", userId);
                accessor.getSessionAttributes().put("email", claims.get("email"));
                accessor.getSessionAttributes().put("phone", claims.get("phone"));

                log.debug("WebSocket connection accepted for user: {}", userId);

            } catch (Exception ex) {
                log.warn("WebSocket connection rejected: JWT validation failed - {}", ex.getMessage());
                throw new IllegalArgumentException("Invalid token: " + ex.getMessage());
            }
        }

        return message;
    }
}

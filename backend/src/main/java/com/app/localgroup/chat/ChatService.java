package com.app.localgroup.chat;

import com.app.localgroup.chat.dto.ChatMessageDTO;
import com.app.localgroup.group.model.Group;
import com.app.localgroup.group.repository.GroupMemberRepository;
import com.app.localgroup.group.repository.GroupRepository;
import com.app.localgroup.user.model.User;
import com.app.localgroup.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;

/**
 * Service for group chat operations.
 * Handles validation and broadcasting of ephemeral messages.
 * Never persists messages to database.
 */
@Service
@RequiredArgsConstructor
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Validates and broadcasts a chat message to a group.
     *
     * @param groupId    the group ID
     * @param senderId   the user sending the message
     * @param content    the message content
     * @throws IllegalArgumentException if group not found
     * @throws IllegalStateException    if group not ACTIVE or user not allowed
     */
    public void sendMessage(String groupId, String senderId, String content) {
        // Validate group exists
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ChatException(
                        "Group not found",
                        ChatException.ErrorCode.GROUP_NOT_FOUND,
                        404
                ));

        // Validate group is ACTIVE
        if (group.getStatus() != Group.Status.ACTIVE) {
            log.warn("Chat rejected for group {}: status is {} not ACTIVE", groupId, group.getStatus());
            throw new ChatException(
                    "Chat allowed only when group is ACTIVE. Current status: " + group.getStatus(),
                    ChatException.ErrorCode.GROUP_NOT_ACTIVE,
                    409
            );
        }

        // Validate user is a member
        boolean isMember = groupMemberRepository.findByGroupId(groupId)
                .stream()
                .anyMatch(m -> m.getUserId().equals(senderId));

        if (!isMember) {
            log.warn("Chat rejected for user {} in group {}: not a member", senderId, groupId);
            throw new ChatException(
                    "You are not a member of this group",
                    ChatException.ErrorCode.NOT_A_MEMBER,
                    403
            );
        }

        // Validate user is not blocked by group creator
        User creator = userRepository.findById(group.getCreatorId())
                .orElseThrow(() -> new ChatException(
                        "Group creator not found",
                        ChatException.ErrorCode.CREATOR_NOT_FOUND,
                        500
                ));

        if (creator.getBlockedUsers().contains(senderId)) {
            log.warn("Chat rejected for user {} in group {}: blocked by creator", senderId, groupId);
            throw new ChatException(
                    "You are blocked by the group creator and cannot send messages",
                    ChatException.ErrorCode.USER_BLOCKED,
                    403
            );
        }

        // Construct and broadcast message
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ChatException(
                        "Sender not found",
                        ChatException.ErrorCode.SENDER_NOT_FOUND,
                        500
                ));

        ChatMessageDTO message = ChatMessageDTO.builder()
                .groupId(groupId)
                .senderId(senderId)
                .senderEmail(sender.getEmail())
                .content(content)
                .timestamp(Instant.now())
                .build();

        String destination = "/topic/group/" + groupId;
        messagingTemplate.convertAndSend(destination, message);

        log.info("Chat message sent to group {} by user {}", groupId, senderId);
    }

    /**
     * Custom exception for chat operations.
     */
    public static class ChatException extends RuntimeException {
        private final ErrorCode errorCode;
        private final int httpStatus;

        public ChatException(String message, ErrorCode errorCode, int httpStatus) {
            super(message);
            this.errorCode = errorCode;
            this.httpStatus = httpStatus;
        }

        public ErrorCode getErrorCode() {
            return errorCode;
        }

        public int getHttpStatus() {
            return httpStatus;
        }

        public enum ErrorCode {
            GROUP_NOT_FOUND,
            GROUP_NOT_ACTIVE,
            NOT_A_MEMBER,
            USER_BLOCKED,
            CREATOR_NOT_FOUND,
            SENDER_NOT_FOUND
        }
    }
}

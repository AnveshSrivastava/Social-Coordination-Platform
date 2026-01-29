package com.app.localgroup.chat;

import com.app.localgroup.group.model.Group;
import com.app.localgroup.group.repository.GroupRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class ChatService {
    private static final Logger log = LoggerFactory.getLogger(ChatService.class);

    private final GroupRepository groupRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatService(GroupRepository groupRepository, SimpMessagingTemplate messagingTemplate) {
        this.groupRepository = groupRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public void broadcast(String groupId, String message, String fromUserId) {
        Group g = groupRepository.findById(groupId).orElseThrow(() -> new IllegalStateException("Group not found"));
        if (g.getStatus() != Group.Status.ACTIVE) throw new IllegalStateException("Chat allowed only during ACTIVE");
        // topic per group
        String destination = "/topic/group/" + groupId;
        ChatMessage payload = new ChatMessage(fromUserId, message);
        messagingTemplate.convertAndSend(destination, payload);
        log.info("Broadcast to {} from {}", destination, fromUserId);
    }
}

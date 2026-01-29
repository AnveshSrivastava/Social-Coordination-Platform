package com.app.localgroup.safety;

import com.app.localgroup.common.ApiResponse;
import com.app.localgroup.group.model.Group;
import com.app.localgroup.group.repository.GroupRepository;
import com.app.localgroup.group.repository.GroupMemberRepository;
import com.app.localgroup.safety.model.SafetyEvent;
import com.app.localgroup.safety.repository.SafetyEventRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/safety")
@RequiredArgsConstructor
public class SafetyController {

    private static final Logger log = LoggerFactory.getLogger(SafetyController.class);

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final SafetyEventRepository safetyEventRepository;

    @PostMapping("/sos/{groupId}")
    public ResponseEntity<ApiResponse<String>> sos(@PathVariable String groupId, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        Group g = groupRepository.findById(groupId).orElseThrow(() -> new RuntimeException("Group not found"));
        if (g.getStatus() != Group.Status.ACTIVE) return ResponseEntity.status(409).body(ApiResponse.<String>builder().success(false).message("Group not active").build());
        boolean member = groupMemberRepository.findByGroupId(groupId).stream().anyMatch(m -> m.getUserId().equals(userId));
        if (!member) return ResponseEntity.status(403).body(ApiResponse.<String>builder().success(false).message("Not a member").build());

        SafetyEvent e = SafetyEvent.builder().groupId(groupId).triggeredBy(userId).status(SafetyEvent.Status.OPEN).build();
        safetyEventRepository.save(e);

        // notify members (mocked via logs)
        log.info("SOS triggered by {} in group {}. Notifying group members and trusted contact. NOTE: This is not an emergency service and does not contact authorities.", userId, groupId);

        return ResponseEntity.ok(ApiResponse.<String>builder().success(true).message("SOS triggered. This is not an emergency service and does not contact authorities.").data(e.getId()).build());
    }
}

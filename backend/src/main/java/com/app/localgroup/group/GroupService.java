package com.app.localgroup.group;

import com.app.localgroup.common.ApiResponse;
import com.app.localgroup.group.dto.CreateGroupDto;
import com.app.localgroup.group.dto.GroupDto;
import com.app.localgroup.group.model.Group;
import com.app.localgroup.group.model.GroupMember;
import com.app.localgroup.group.repository.GroupMemberRepository;
import com.app.localgroup.group.repository.GroupRepository;
import com.app.localgroup.user.model.User;
import com.app.localgroup.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GroupService {

    private static final Logger log = LoggerFactory.getLogger(GroupService.class);

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public GroupDto createGroup(String creatorId, CreateGroupDto dto) {
        // Validate creator active groups
        long activeCount = groupRepository.countByCreatorIdAndStatusNot(creatorId, Group.Status.EXPIRED);
        if (activeCount >= 2) {
            throw new IllegalStateException("Creator has maximum allowed active groups");
        }
        if (dto.getMaxSize() < 2 || dto.getMaxSize() > 6) {
            throw new IllegalArgumentException("maxSize must be between 2 and 6");
        }

        Group g = Group.builder()
                .placeId(dto.getPlaceId())
                .creatorId(creatorId)
                .dateTime(dto.getDateTime())
                .maxSize(dto.getMaxSize())
                .visibility(dto.getVisibility())
                .status(Group.Status.JOINABLE)
                .build();

        if (dto.getVisibility() == Group.Visibility.PRIVATE) {
            if (dto.getInviteCode() == null || dto.getInviteCode().isBlank()) {
                throw new IllegalArgumentException("Private groups require an invite code");
            }
            g.setInviteCodeHash(passwordEncoder.encode(dto.getInviteCode()));
        }

        Group saved = groupRepository.save(g);

        // add creator as confirmed member
        GroupMember gm = GroupMember.builder().groupId(saved.getId()).userId(creatorId).confirmed(true).build();
        groupMemberRepository.save(gm);

        log.info("Group created: {} by {}", saved.getId(), creatorId);

        return toDto(saved);
    }

    public void joinGroup(String userId, String groupId) {
        Group g = groupRepository.findById(groupId).orElseThrow(() -> new ResourceNotFoundException("Group not found"));
        if (g.getStatus() != Group.Status.JOINABLE) throw new IllegalStateException("Group not joinable");
        long members = groupMemberRepository.findByGroupId(groupId).size();
        if (members >= g.getMaxSize()) throw new IllegalStateException("Group is full");
        if (g.getCreatorId().equals(userId)) throw new IllegalStateException("Creator already a member");
        // check blocked
        userRepository.findById(g.getCreatorId()).ifPresent(creator -> {
            if (creator.getBlockedUsers().contains(userId)) throw new IllegalStateException("You are blocked by the creator");
        });
        boolean already = groupMemberRepository.findByGroupId(groupId).stream().anyMatch(m -> m.getUserId().equals(userId));
        if (already) throw new IllegalStateException("Already a member");
        GroupMember gm = GroupMember.builder().groupId(groupId).userId(userId).confirmed(false).build();
        groupMemberRepository.save(gm);
    }

    public void joinPrivate(String userId, String groupId, String inviteCode) {
        Group g = groupRepository.findById(groupId).orElseThrow(() -> new ResourceNotFoundException("Group not found"));
        if (g.getVisibility() != Group.Visibility.PRIVATE) throw new IllegalStateException("Not a private group");
        if (g.getInviteCodeHash() == null) throw new IllegalStateException("No invite code set");
        if (!passwordEncoder.matches(inviteCode, g.getInviteCodeHash())) throw new IllegalStateException("Invalid invite code");
        joinGroup(userId, groupId);
    }

    public void leaveGroup(String userId, String groupId) {
        Group g = groupRepository.findById(groupId).orElseThrow(() -> new ResourceNotFoundException("Group not found"));
        if (g.getStatus() == Group.Status.ACTIVE) throw new IllegalStateException("Cannot leave an active group");
        List<GroupMember> members = groupMemberRepository.findByGroupId(groupId);
        Optional<GroupMember> membership = members.stream().filter(m -> m.getUserId().equals(userId)).findFirst();
        if (membership.isEmpty()) throw new IllegalStateException("Not a member");
        groupMemberRepository.delete(membership.get());
        // if creator leaves before ACTIVE -> auto-expire
        if (g.getCreatorId().equals(userId) && g.getStatus() != Group.Status.ACTIVE) {
            g.setStatus(Group.Status.EXPIRED);
            groupRepository.save(g);
            log.info("Group {} expired because creator left before ACTIVE", groupId);
        }
    }

    public void confirmAttendance(String userId, String groupId) {
        Group g = groupRepository.findById(groupId).orElseThrow(() -> new ResourceNotFoundException("Group not found"));
        if (g.getStatus() != Group.Status.CONFIRMATION) throw new IllegalStateException("Confirmation not allowed in current state");
        List<GroupMember> members = groupMemberRepository.findByGroupId(groupId);
        GroupMember member = members.stream().filter(m -> m.getUserId().equals(userId)).findFirst().orElseThrow(() -> new IllegalStateException("Not a member"));
        if (member.isConfirmed()) return; // idempotent
        member.setConfirmed(true);
        groupMemberRepository.save(member);
    }

    public GroupDto toDto(Group g) {
        long memberCount = groupMemberRepository.findByGroupId(g.getId()).size();
        return GroupDto.builder()
                .id(g.getId())
                .placeId(g.getPlaceId())
                .creatorId(g.getCreatorId())
                .dateTime(g.getDateTime())
                .maxSize(g.getMaxSize())
                .visibility(g.getVisibility())
                .status(g.getStatus())
                .createdAt(g.getCreatedAt())
                .memberCount(memberCount)
                .build();
    }

    // helper exceptional classes
    public static class ResourceNotFoundException extends RuntimeException {
        public ResourceNotFoundException(String m) { super(m); }
    }
}

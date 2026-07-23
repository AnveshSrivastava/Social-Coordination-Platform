package com.app.localgroup.group;

import com.app.localgroup.group.dto.CreateGroupDto;
import com.app.localgroup.group.dto.GroupDto;
import com.app.localgroup.group.dto.MemberInfoDto;
import com.app.localgroup.group.dto.UpdateGroupDto;
import com.app.localgroup.group.model.Group;
import com.app.localgroup.group.model.GroupMember;
import com.app.localgroup.group.model.GenderRestriction;
import com.app.localgroup.group.repository.GroupMemberRepository;
import com.app.localgroup.group.repository.GroupRepository;
import com.app.localgroup.place.PlaceService;
import com.app.localgroup.place.model.Place;
import com.app.localgroup.user.UserService;
import com.app.localgroup.user.model.User;
import com.app.localgroup.user.model.Gender;
import com.app.localgroup.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GroupService {

    private static final Logger log = LoggerFactory.getLogger(GroupService.class);

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;
    private final PlaceService placeService;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // -------------------------------------------------------------------------
    // Guard helpers
    // -------------------------------------------------------------------------

    /**
     * Loads the user and verifies profile completeness.
     * Throws IllegalStateException if profile is incomplete.
     */
    private User requireCompleteProfile(String userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!UserService.isProfileComplete(user)) {
            throw new IllegalStateException(
                "Your profile must be completed before performing this action. "
                + "Please set your username, age, and gender first.");
        }
        return user;
    }

    // -------------------------------------------------------------------------
    // Create
    // -------------------------------------------------------------------------

    public GroupDto createGroup(String creatorId, CreateGroupDto dto) {
        // Profile completeness guard
        requireCompleteProfile(creatorId);

        if ((dto.getPlaceId() == null || dto.getPlaceId().isBlank()) && dto.getMapPlace() == null) {
            throw new IllegalArgumentException("Either placeId or mapPlace must be provided");
        }

        long activeCount = groupRepository.countByCreatorIdAndStatusNot(creatorId, Group.Status.EXPIRED);
        if (activeCount >= 2) {
            throw new IllegalStateException("Creator has maximum allowed active groups");
        }
        if (dto.getMaxSize() < 2 || dto.getMaxSize() > 6) {
            throw new IllegalArgumentException("maxSize must be between 2 and 6");
        }

        String resolvedPlaceId;
        if (dto.getPlaceId() != null && !dto.getPlaceId().isBlank()) {
            resolvedPlaceId = dto.getPlaceId();
        } else {
            resolvedPlaceId = placeService.findOrCreateMapPlace(dto.getMapPlace());
        }

        GenderRestriction restriction = dto.getGenderRestriction() != null
            ? dto.getGenderRestriction()
            : GenderRestriction.EVERYONE;

        Group g = Group.builder()
            .placeId(resolvedPlaceId)
            .creatorId(creatorId)
            .dateTime(dto.getDateTime())
            .maxSize(dto.getMaxSize())
            .visibility(dto.getVisibility())
            .status(Group.Status.JOINABLE)
            .genderRestriction(restriction)
            .build();

        if (dto.getVisibility() == Group.Visibility.PRIVATE) {
            if (dto.getInviteCode() == null || dto.getInviteCode().isBlank()) {
                throw new IllegalArgumentException("Private groups require an invite code");
            }
            g.setInviteCodeHash(passwordEncoder.encode(dto.getInviteCode()));
        }

        Group saved = groupRepository.save(g);
        GroupMember gm = GroupMember.builder().groupId(saved.getId()).userId(creatorId).confirmed(true).build();
        groupMemberRepository.save(gm);

        log.info("Group created: {} by {} with place: {} restriction: {}",
            saved.getId(), creatorId, resolvedPlaceId, restriction);
        return toDto(saved);
    }

    // -------------------------------------------------------------------------
    // Join
    // -------------------------------------------------------------------------

    public void joinGroup(String userId, String groupId) {
        // Profile completeness guard
        User joiner = requireCompleteProfile(userId);

        Group g = groupRepository.findById(groupId)
            .orElseThrow(() -> new ResourceNotFoundException("Group not found"));

        if (g.getStatus() != Group.Status.JOINABLE) {
            throw new IllegalStateException("Group is not joinable");
        }

        long members = groupMemberRepository.findByGroupId(groupId).size();
        if (members >= g.getMaxSize()) {
            throw new IllegalStateException("Group is full");
        }

        if (g.getCreatorId().equals(userId)) {
            throw new IllegalStateException("Creator is already a member");
        }

        userRepository.findById(g.getCreatorId()).ifPresent(creator -> {
            if (creator.getBlockedUsers().contains(userId)) {
                throw new IllegalStateException("You are blocked by the group creator");
            }
        });

        boolean already = groupMemberRepository.findByGroupId(groupId)
            .stream().anyMatch(m -> m.getUserId().equals(userId));
        if (already) throw new IllegalStateException("Already a member");

        // Gender restriction enforcement (backend-only)
        enforceGenderRestriction(g, joiner);

        GroupMember gm = GroupMember.builder().groupId(groupId).userId(userId).confirmed(false).build();
        groupMemberRepository.save(gm);
    }

    /**
     * Enforces gender restriction on group join.
     *
     * Rules:
     * - EVERYONE    → MALE, FEMALE, OTHER may all join
     * - MALE_ONLY   → only MALE; FEMALE and OTHER are rejected
     * - FEMALE_ONLY → only FEMALE; MALE and OTHER are rejected
     *
     * Users with Gender.OTHER can only join EVERYONE groups.
     */
    private void enforceGenderRestriction(Group g, User joiner) {
        GenderRestriction restriction = g.getGenderRestriction();
        if (restriction == null || restriction == GenderRestriction.EVERYONE) {
            return; // No restriction
        }

        Gender joinerGender = joiner.getGender();
        // joinerGender cannot be null here because requireCompleteProfile() was already called

        boolean allowed = switch (restriction) {
            case MALE_ONLY   -> joinerGender == Gender.MALE;
            case FEMALE_ONLY -> joinerGender == Gender.FEMALE;
            default          -> true;
        };

        if (!allowed) {
            String label = restriction == GenderRestriction.MALE_ONLY ? "Male" : "Female";
            throw new IllegalStateException(
                "This group is restricted to " + label + " members only. "
                + "Users with other genders may only join open groups.");
        }
    }

    // -------------------------------------------------------------------------
    // Join private
    // -------------------------------------------------------------------------

    public void joinPrivate(String userId, String groupId, String inviteCode) {
        // Profile completeness is checked inside joinGroup
        Group g = groupRepository.findById(groupId)
            .orElseThrow(() -> new ResourceNotFoundException("Group not found"));
        if (g.getVisibility() != Group.Visibility.PRIVATE) {
            throw new IllegalStateException("Not a private group");
        }
        if (g.getInviteCodeHash() == null) {
            throw new IllegalStateException("No invite code set");
        }
        if (!passwordEncoder.matches(inviteCode, g.getInviteCodeHash())) {
            throw new IllegalStateException("Invalid invite code");
        }
        joinGroup(userId, groupId);
    }

    // -------------------------------------------------------------------------
    // Update
    // -------------------------------------------------------------------------

    public GroupDto updateGroup(String userId, String groupId, UpdateGroupDto dto) {
        Group g = groupRepository.findById(groupId)
            .orElseThrow(() -> new ResourceNotFoundException("Group not found"));
        if (!g.getCreatorId().equals(userId)) {
            throw new IllegalStateException("Only the creator can update this group");
        }
        if (g.getStatus() == Group.Status.ACTIVE || g.getStatus() == Group.Status.EXPIRED) {
            throw new IllegalStateException("Cannot update group in ACTIVE or EXPIRED state");
        }

        long currentMemberCount = groupMemberRepository.findByGroupId(groupId).size();
        if (dto.getMaxSize() != null) {
            if (dto.getMaxSize() < currentMemberCount) {
                throw new IllegalArgumentException("maxSize must be >= current member count (" + currentMemberCount + ")");
            }
            g.setMaxSize(dto.getMaxSize());
        }
        if (dto.getDateTime() != null) {
            if (dto.getDateTime().isBefore(Instant.now())) {
                throw new IllegalArgumentException("dateTime must be in the future");
            }
            g.setDateTime(dto.getDateTime());
        }

        Group saved = groupRepository.save(g);
        return toDto(saved, userId);
    }

    // -------------------------------------------------------------------------
    // Leave
    // -------------------------------------------------------------------------

    public void leaveGroup(String userId, String groupId) {
        Group g = groupRepository.findById(groupId)
            .orElseThrow(() -> new ResourceNotFoundException("Group not found"));
        if (g.getStatus() == Group.Status.ACTIVE) {
            throw new IllegalStateException("Cannot leave an active group");
        }

        List<GroupMember> members = groupMemberRepository.findByGroupId(groupId);
        Optional<GroupMember> membership = members.stream()
            .filter(m -> m.getUserId().equals(userId)).findFirst();
        if (membership.isEmpty()) throw new IllegalStateException("Not a member");
        groupMemberRepository.delete(membership.get());

        if (g.getCreatorId().equals(userId) && g.getStatus() != Group.Status.ACTIVE) {
            g.setStatus(Group.Status.EXPIRED);
            groupRepository.save(g);
            log.info("Group {} expired because creator left before ACTIVE", groupId);
        }
    }

    // -------------------------------------------------------------------------
    // Confirm attendance
    // -------------------------------------------------------------------------

    public void confirmAttendance(String userId, String groupId) {
        Group g = groupRepository.findById(groupId)
            .orElseThrow(() -> new ResourceNotFoundException("Group not found"));
        if (g.getStatus() != Group.Status.JOINABLE
                && g.getStatus() != Group.Status.CONFIRMATION
                && g.getStatus() != Group.Status.ACTIVE) {
            throw new IllegalStateException("Confirmation not allowed in current state");
        }

        List<GroupMember> members = groupMemberRepository.findByGroupId(groupId);
        GroupMember member = members.stream()
            .filter(m -> m.getUserId().equals(userId)).findFirst()
            .orElseThrow(() -> new IllegalStateException("Not a member"));
        if (member.isConfirmed()) return;

        member.setConfirmed(true);
        groupMemberRepository.save(member);
    }

    // -------------------------------------------------------------------------
    // Queries
    // -------------------------------------------------------------------------

    public List<GroupDto> getMyGroups(String userId) {
        return groupMemberRepository.findByUserId(userId).stream()
            .map(m -> groupRepository.findById(m.getGroupId()))
            .filter(Optional::isPresent)
            .map(Optional::get)
            .map(g -> toDto(g, userId))
            .toList();
    }

    public List<GroupDto> getGroupsByPlace(String placeId) {
        return groupRepository.findByPlaceId(placeId).stream()
            .filter(g -> g.getVisibility() == Group.Visibility.PUBLIC
                      && g.getStatus() == Group.Status.JOINABLE)
            .map(this::toDto)
            .toList();
    }

    public GroupDto getGroupById(String groupId, String userId) {
        Group g = groupRepository.findById(groupId)
            .orElseThrow(() -> new ResourceNotFoundException("Group not found"));
        return toDto(g, userId);
    }

    // -------------------------------------------------------------------------
    // DTO conversion
    // -------------------------------------------------------------------------

    public GroupDto toDto(Group g) {
        return toDto(g, null);
    }

    public GroupDto toDto(Group g, String userId) {
        long memberCount = groupMemberRepository.findByGroupId(g.getId()).size();
        boolean userConfirmed = false;
        if (userId != null) {
            userConfirmed = groupMemberRepository.findByGroupId(g.getId()).stream()
                .anyMatch(m -> m.getUserId().equals(userId) && m.isConfirmed());
        }

        List<String> eligibleUserIds = (g.getConfirmationEligibleUserIds() == null
            || g.getConfirmationEligibleUserIds().isEmpty())
            ? groupMemberRepository.findByGroupId(g.getId()).stream()
                .map(GroupMember::getUserId).distinct().toList()
            : g.getConfirmationEligibleUserIds();

        long confirmedEligible = groupMemberRepository.findByGroupId(g.getId()).stream()
            .filter(m -> eligibleUserIds.contains(m.getUserId()) && m.isConfirmed())
            .count();

        GroupDto.GroupDtoBuilder builder = GroupDto.builder()
            .id(g.getId())
            .placeId(g.getPlaceId())
            .creatorId(g.getCreatorId())
            .dateTime(g.getDateTime())
            .maxSize(g.getMaxSize())
            .visibility(g.getVisibility())
            .status(g.getStatus())
            .genderRestriction(g.getGenderRestriction() != null
                ? g.getGenderRestriction() : GenderRestriction.EVERYONE)
            .createdAt(g.getCreatedAt())
            .memberCount(memberCount)
            .confirmed(userConfirmed)
            .confirmationEligibleCount(eligibleUserIds.size())
            .confirmationConfirmedCount((int) confirmedEligible);

        // --- Place enrichment (flat fields — no wrapper DTO) ---
        if (g.getPlaceId() != null) {
            placeService.findById(g.getPlaceId()).ifPresent(place -> {
                builder.placeName(place.getName());
                builder.placeCategory(place.getCategory() != null
                    ? place.getCategory().name() : null);
                // placeAddress: Place model has no address field currently;
                // field included for forward-compatibility, left null.
                builder.placeAddress(null);
            });
        }

        // --- Member list for CONFIRMATION and ACTIVE states ---
        if (g.getStatus() == Group.Status.CONFIRMATION || g.getStatus() == Group.Status.ACTIVE) {
            List<MemberInfoDto> members = groupMemberRepository.findByGroupId(g.getId()).stream()
                .map(m -> userRepository.findById(m.getUserId())
                    .map(u -> MemberInfoDto.builder()
                        .userId(u.getId())
                        .username(u.getUsername())   // username only — never email
                        .trustScore(u.getTrustScore())
                        .totalTrips(u.getTotalTrips())
                        .build())
                    .orElse(null))
                .filter(Objects::nonNull)
                .toList();
            builder.members(members);
        }

        return builder.build();
    }

    // -------------------------------------------------------------------------
    // Inner exception
    // -------------------------------------------------------------------------

    public static class ResourceNotFoundException extends RuntimeException {
        public ResourceNotFoundException(String m) { super(m); }
    }
}

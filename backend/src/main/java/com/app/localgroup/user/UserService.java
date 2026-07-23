package com.app.localgroup.user;

import com.app.localgroup.group.model.Group;
import com.app.localgroup.group.model.GroupMember;
import com.app.localgroup.group.repository.GroupMemberRepository;
import com.app.localgroup.group.repository.GroupRepository;
import com.app.localgroup.place.PlaceService;
import com.app.localgroup.user.dto.CompleteProfileDto;
import com.app.localgroup.user.dto.PrivateUserDto;
import com.app.localgroup.user.dto.PublicUserDto;
import com.app.localgroup.user.model.User;
import com.app.localgroup.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    /** Usernames that are not allowed regardless of uniqueness. */
    private static final Set<String> RESERVED_USERNAMES = Set.of(
        "admin", "administrator", "root", "system", "support",
        "help", "api", "null", "undefined", "moderator",
        "meetspot", "meet", "spot", "staff", "official",
        "me", "you", "user", "users", "profile"
    );

    private final UserRepository userRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final GroupRepository groupRepository;
    private final PlaceService placeService;

    // -------------------------------------------------------------------------
    // Profile completeness — derived, never stored
    // -------------------------------------------------------------------------

    /**
     * Profile is complete when username, age, and gender are all non-null.
     * This is the single source of truth — computed from the User entity,
     * never persisted as a boolean field.
     */
    public static boolean isProfileComplete(User user) {
        return user.getUsername() != null
            && user.getAge() != null
            && user.getGender() != null;
    }

    // -------------------------------------------------------------------------
    // Normalisation utilities
    // -------------------------------------------------------------------------

    /**
     * Normalise a username candidate: trim whitespace and convert to lowercase.
     * Usernames are stored and compared case-insensitively.
     */
    private static String normalise(String raw) {
        return raw == null ? null : raw.strip().toLowerCase();
    }

    // -------------------------------------------------------------------------
    // Profile operations
    // -------------------------------------------------------------------------

    /**
     * Complete or update a user's profile.
     *
     * Immutability enforced here (NOT by validation annotations alone):
     * - age    : immutable after first save
     * - gender : immutable after first save
     * - username: mutable but must be unique and valid
     * - bio    : always editable
     *
     * Username handling:
     * - Trimmed and lowercased before persistence
     * - Checked against RESERVED_USERNAMES set
     * - Repository uniqueness check before save (fast, avoids unnecessary writes)
     * - DuplicateKeyException caught in case of race condition (database-level index)
     *
     * @throws IllegalArgumentException for validation failures
     * @throws IllegalStateException for immutability violations
     */
    public PrivateUserDto completeProfile(String userId, CompleteProfileDto dto) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // --- Username ---
        String normalised = normalise(dto.getUsername());

        // Reserved username check
        if (RESERVED_USERNAMES.contains(normalised)) {
            throw new IllegalArgumentException("Username '" + normalised + "' is reserved and cannot be used");
        }

        // Uniqueness check — repository level (defensive against race conditions)
        userRepository.findByUsername(normalised).ifPresent(existing -> {
            if (!existing.getId().equals(userId)) {
                throw new IllegalArgumentException("Username '" + normalised + "' is already taken");
            }
        });

        user.setUsername(normalised);

        // --- Age (immutable after first save) ---
        if (user.getAge() != null && dto.getAge() != null && !dto.getAge().equals(user.getAge())) {
            throw new IllegalStateException("Age cannot be changed after it has been set");
        }
        if (user.getAge() == null) {
            if (dto.getAge() == null) {
                throw new IllegalArgumentException("Age is required to complete your profile");
            }
            user.setAge(dto.getAge());
        }

        // --- Gender (immutable after first save) ---
        if (user.getGender() != null && dto.getGender() != null && dto.getGender() != user.getGender()) {
            throw new IllegalStateException("Gender cannot be changed after it has been set");
        }
        if (user.getGender() == null) {
            if (dto.getGender() == null) {
                throw new IllegalArgumentException("Gender is required to complete your profile");
            }
            user.setGender(dto.getGender());
        }

        // --- Bio (always editable) ---
        user.setBio(dto.getBio() != null ? dto.getBio().strip() : null);

        try {
            User saved = userRepository.save(user);
            log.info("Profile updated for user {}: username={}", userId, normalised);
            return toPrivateDto(saved);
        } catch (DuplicateKeyException ex) {
            // Database-level unique index on username caught a race condition
            log.warn("DuplicateKeyException saving username '{}' for user {}", normalised, userId);
            throw new IllegalArgumentException("Username '" + normalised + "' is already taken");
        }
    }

    // -------------------------------------------------------------------------
    // Read operations
    // -------------------------------------------------------------------------

    public Optional<PrivateUserDto> getCurrentUser(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) return Optional.empty();
        String userId = (String) auth.getPrincipal();
        return userRepository.findById(userId).map(this::toPrivateDto);
    }

    public Optional<Integer> getTrustScore(Authentication auth) {
        return getCurrentUser(auth).map(PrivateUserDto::getTrustScore);
    }

    public Optional<PublicUserDto> getPublicProfile(String userId) {
        return userRepository.findById(userId).map(this::toPublicDto);
    }

    // -------------------------------------------------------------------------
    // Block
    // -------------------------------------------------------------------------

    public void blockUser(Authentication auth, String toBlockUserId) {
        if (auth == null || auth.getPrincipal() == null) return;
        String userId = (String) auth.getPrincipal();
        userRepository.findById(userId).ifPresent(u -> {
            if (!u.getBlockedUsers().contains(toBlockUserId)) {
                u.getBlockedUsers().add(toBlockUserId);
                userRepository.save(u);
            }
        });
    }

    // -------------------------------------------------------------------------
    // DTO mapping
    // -------------------------------------------------------------------------

    public PrivateUserDto toPrivateDto(User u) {
        return PrivateUserDto.builder()
            .id(u.getId())
            .username(u.getUsername())
            .email(u.getEmail())
            .phone(u.getPhone())
            .age(u.getAge())
            .gender(u.getGender())
            .bio(u.getBio())
            .verified(u.isVerified())
            .trustScore(u.getTrustScore())
            .totalTrips(u.getTotalTrips())
            .profileComplete(isProfileComplete(u))
            .placesVisited(derivePlacesVisited(u.getId()))
            .blockedUsers(u.getBlockedUsers())
            .createdAt(u.getCreatedAt())
            .build();
    }

    public PublicUserDto toPublicDto(User u) {
        return PublicUserDto.builder()
            .id(u.getId())
            .username(u.getUsername())
            .trustScore(u.getTrustScore())
            .totalTrips(u.getTotalTrips())
            .build();
    }

    /**
     * Derives a list of unique place names visited by a user.
     *
     * Derived from: groups where the user is a confirmed member
     * AND the group has reached ACTIVE or EXPIRED status.
     *
     * No data is stored on the User document — single source of truth.
     */
    private List<String> derivePlacesVisited(String userId) {
        return groupMemberRepository.findByUserId(userId).stream()
            .filter(GroupMember::isConfirmed)
            .map(m -> groupRepository.findById(m.getGroupId()))
            .filter(Optional::isPresent)
            .map(Optional::get)
            .filter(g -> g.getStatus() == Group.Status.ACTIVE || g.getStatus() == Group.Status.EXPIRED)
            .map(g -> placeService.findById(g.getPlaceId()))
            .filter(Optional::isPresent)
            .map(p -> p.get().getName())
            .filter(name -> name != null && !name.isBlank())
            .distinct()
            .toList();
    }
}

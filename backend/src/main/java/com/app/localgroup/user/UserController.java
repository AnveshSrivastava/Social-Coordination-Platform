package com.app.localgroup.user;

import com.app.localgroup.common.ApiResponse;
import com.app.localgroup.user.dto.CompleteProfileDto;
import com.app.localgroup.user.dto.PrivateUserDto;
import com.app.localgroup.user.dto.PublicUserDto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Validated
public class UserController {

    private final UserService userService;

    /**
     * GET /users/me
     * Returns the authenticated user's full private profile.
     * Includes: username, email, phone, age, gender, bio, trustScore,
     *           profileComplete (derived), placesVisited (derived), etc.
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<PrivateUserDto>> me(Authentication auth) {
        Optional<PrivateUserDto> dto = userService.getCurrentUser(auth);
        return dto
            .map(d -> ResponseEntity.ok(ApiResponse.<PrivateUserDto>builder()
                .success(true).data(d).message("OK").build()))
            .orElseGet(() -> ResponseEntity.status(404)
                .body(ApiResponse.<PrivateUserDto>builder()
                    .success(false).message("User not found").build()));
    }

    /**
     * PATCH /users/profile
     * Complete or update profile. Enforces immutability of age and gender.
     * Username is normalised (trimmed, lowercased) and uniqueness-checked.
     */
    @PatchMapping("/profile")
    public ResponseEntity<ApiResponse<PrivateUserDto>> updateProfile(
            @Valid @RequestBody CompleteProfileDto dto,
            Authentication auth) {
        String userId = (String) auth.getPrincipal();
        PrivateUserDto updated = userService.completeProfile(userId, dto);
        return ResponseEntity.ok(ApiResponse.<PrivateUserDto>builder()
            .success(true).data(updated).message("Profile updated").build());
    }

    /**
     * GET /users/{id}
     * Returns a public profile (username, trustScore, totalTrips only).
     * Safe to call by any authenticated or unauthenticated client.
     */
    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<PublicUserDto>> publicProfile(
            @PathVariable("userId") @NotBlank String userId) {
        Optional<PublicUserDto> dto = userService.getPublicProfile(userId);
        return dto
            .map(d -> ResponseEntity.ok(ApiResponse.<PublicUserDto>builder()
                .success(true).data(d).message("OK").build()))
            .orElseGet(() -> ResponseEntity.status(404)
                .body(ApiResponse.<PublicUserDto>builder()
                    .success(false).message("User not found").build()));
    }

    /**
     * GET /users/trust-score
     * Convenience endpoint for trust score (unchanged).
     */
    @GetMapping("/trust-score")
    public ResponseEntity<ApiResponse<Integer>> trustScore(Authentication auth) {
        Optional<Integer> score = userService.getTrustScore(auth);
        return score
            .map(s -> ResponseEntity.ok(ApiResponse.<Integer>builder()
                .success(true).data(s).message("OK").build()))
            .orElseGet(() -> ResponseEntity.status(404)
                .body(ApiResponse.<Integer>builder()
                    .success(false).message("User not found").build()));
    }

    /**
     * POST /users/block/{userId}
     * Block a user (unchanged).
     */
    @PostMapping("/block/{userId}")
    public ResponseEntity<ApiResponse<String>> block(
            @PathVariable("userId") @NotBlank String userId,
            Authentication auth) {
        userService.blockUser(auth, userId);
        return ResponseEntity.ok(ApiResponse.<String>builder()
            .success(true).message("User blocked").build());
    }
}

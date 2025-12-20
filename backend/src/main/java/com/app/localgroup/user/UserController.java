package com.app.localgroup.user;

import com.app.localgroup.common.ApiResponse;
import com.app.localgroup.user.dto.UserProfileDto;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Validated
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileDto>> me(Authentication auth) {
        Optional<UserProfileDto> dto = userService.getCurrentUser(auth);
        return dto.map(d -> ResponseEntity.ok(ApiResponse.<UserProfileDto>builder().success(true).data(d).message("OK").build()))
                .orElseGet(() -> ResponseEntity.status(404).body(ApiResponse.<UserProfileDto>builder().success(false).message("User not found").build()));
    }

    @GetMapping("/trust-score")
    public ResponseEntity<ApiResponse<Integer>> trustScore(Authentication auth) {
        Optional<Integer> score = userService.getTrustScore(auth);
        return score.map(s -> ResponseEntity.ok(ApiResponse.<Integer>builder().success(true).data(s).message("OK").build()))
                .orElseGet(() -> ResponseEntity.status(404).body(ApiResponse.<Integer>builder().success(false).message("User not found").build()));
    }

    @PostMapping("/block/{userId}")
    public ResponseEntity<ApiResponse<String>> block(@PathVariable @NotBlank String userId, Authentication auth) {
        userService.blockUser(auth, userId);
        return ResponseEntity.ok(ApiResponse.<String>builder().success(true).message("User blocked").build());
    }
}

package com.app.localgroup.auth;

import com.app.localgroup.auth.dto.RequestOtpDto;
import com.app.localgroup.auth.dto.VerifyOtpDto;
import com.app.localgroup.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;

    @PostMapping("/request-otp")
    public ResponseEntity<ApiResponse<String>> requestOtp(
            @Valid @RequestBody RequestOtpDto dto
    ) {
        String otp = authService.generateOtp(dto.getEmail(), dto.getPhone());

        // OTP is mocked for MVP — logged only for development/testing
        log.info("DEV-ONLY OTP for {} / {} : {}", dto.getEmail(), dto.getPhone(), otp);

        return ResponseEntity.ok(
                ApiResponse.<String>builder()
                        .success(true)
                        .message("OTP generated successfully")
                        .data("OTP sent (mocked)")
                        .build()
        );
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<String>> verifyOtp(
            @Valid @RequestBody VerifyOtpDto dto
    ) {
        String token = authService.verifyOtpAndIssueToken(
                dto.getEmail(),
                dto.getPhone(),
                dto.getOtp()
        );

        return ResponseEntity.ok(
                ApiResponse.<String>builder()
                        .success(true)
                        .message("Authentication successful")
                        .data(token)
                        .build()
        );
    }
}

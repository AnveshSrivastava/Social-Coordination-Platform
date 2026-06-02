package com.app.localgroup.auth;

import com.app.localgroup.auth.dto.RequestOtpDto;
import com.app.localgroup.auth.dto.RequestOtpResponseDto;
import com.app.localgroup.auth.dto.VerifyOtpDto;
import com.app.localgroup.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * AuthController for OTP-based authentication.
 * 
 * DEMO MODE:
 * The /auth/request-otp endpoint returns the generated OTP in the response.
 * This is for demonstration purposes only. In production, OTPs should be sent
 * via email/SMS and NOT returned in the API response.
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/request-otp")
    public ResponseEntity<ApiResponse<RequestOtpResponseDto>> requestOtp(
            @Valid @RequestBody RequestOtpDto dto
    ) {
        String otp = authService.generateOtp(dto.getEmail(), dto.getPhone());

        // DEMO MODE: Return OTP in response for immediate display in UI
        RequestOtpResponseDto responseData = RequestOtpResponseDto.builder()
                .success(true)
                .otp(otp)
                .demoMode(true)
                .message("Demo Mode: OTP displayed below. In production, this would be sent via email.")
                .build();

        return ResponseEntity.ok(
                ApiResponse.<RequestOtpResponseDto>builder()
                        .success(true)
                        .message("OTP generated successfully (Demo Mode)")
                        .data(responseData)
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

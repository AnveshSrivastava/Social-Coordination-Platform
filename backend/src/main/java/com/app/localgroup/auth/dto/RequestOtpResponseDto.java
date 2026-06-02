package com.app.localgroup.auth.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for OTP request endpoint.
 * 
 * DEMO MODE: This application is configured for demo/testing purposes.
 * The OTP is returned directly in the response for immediate display to users.
 * In production, OTP should be sent via email/SMS and NOT returned in the response.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RequestOtpResponseDto {
    private Boolean success;
    private String message;
    private String otp;
    private Boolean demoMode;
}

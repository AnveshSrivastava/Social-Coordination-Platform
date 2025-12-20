package com.app.localgroup.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VerifyOtpDto {
    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String phone;

    @NotBlank
    private String otp;
}

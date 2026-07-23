package com.app.localgroup.user.dto;

import com.app.localgroup.user.model.Gender;
import jakarta.validation.constraints.*;
import lombok.Data;

/**
 * Request DTO for completing or editing a user profile.
 *
 * Immutability rules (enforced by UserService — NOT by validation annotations alone):
 * - age: immutable after first save; if already set, any provided value is rejected
 * - gender: immutable after first save; if already set, any provided value is rejected
 * - username: mutable (can be changed), but must remain unique and valid
 * - bio: always editable
 */
@Data
public class CompleteProfileDto {

    @NotBlank(message = "Username is required")
    @Pattern(
        regexp = "^[a-zA-Z0-9_]{3,25}$",
        message = "Username must be 3–25 characters and contain only letters, numbers, and underscores"
    )
    private String username;

    @NotNull(message = "Age is required")
    @Min(value = 13, message = "Minimum age is 13")
    @Max(value = 99, message = "Maximum age is 99")
    private Integer age;

    @NotNull(message = "Gender is required")
    private Gender gender;

    @Size(max = 250, message = "Bio cannot exceed 250 characters")
    private String bio;
}

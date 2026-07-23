package com.app.localgroup.user.model;

/**
 * Gender enum for user profile.
 * Immutable after first save — enforced by UserService.
 *
 * Join rules for gender-restricted groups:
 * - EVERYONE groups: MALE, FEMALE, OTHER may all join
 * - MALE_ONLY groups: only MALE may join; FEMALE and OTHER are rejected
 * - FEMALE_ONLY groups: only FEMALE may join; MALE and OTHER are rejected
 */
public enum Gender {
    MALE,
    FEMALE,
    OTHER
}

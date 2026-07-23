package com.app.localgroup.group.model;

/**
 * Gender restriction for group membership.
 *
 * Business rules (enforced backend-only — see GroupService.joinGroup):
 * - EVERYONE    → MALE, FEMALE, and OTHER may all join
 * - MALE_ONLY   → only MALE may join; FEMALE and OTHER are rejected
 * - FEMALE_ONLY → only FEMALE may join; MALE and OTHER are rejected
 *
 * Users with Gender.OTHER can only join EVERYONE groups.
 * This is intentional, documented, and enforced consistently.
 */
public enum GenderRestriction {
    EVERYONE,
    MALE_ONLY,
    FEMALE_ONLY
}

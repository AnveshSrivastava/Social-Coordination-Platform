package com.app.localgroup.common;

public final class Constants {
    private Constants() {}

    // Auth & JWT
    public static final String AUTH_HEADER = "Authorization";
    public static final String TOKEN_PREFIX = "Bearer ";

    // Mock/Demo Account (for testing and demos)
    public static final String MOCK_ACCOUNT_EMAIL = "mock@sca.com";
    public static final String MOCK_ACCOUNT_PHONE = "9999999999";
    public static final String MOCK_ACCOUNT_OTP = "000000";

    // Chat
    public static final int CHAT_MESSAGE_MAX_LENGTH = 500;
    public static final String CHAT_ERROR_GROUP_NOT_FOUND = "Group not found";
    public static final String CHAT_ERROR_GROUP_NOT_ACTIVE = "Chat allowed only when group is ACTIVE";
    public static final String CHAT_ERROR_NOT_MEMBER = "You are not a member of this group";
    public static final String CHAT_ERROR_USER_BLOCKED = "You are blocked by the group creator";
    public static final String CHAT_ERROR_INVALID_MESSAGE = "Message content cannot be blank";
}


package com.app.localgroup.chat;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ChatMessage {
    private String fromUserId;
    private String text;
}

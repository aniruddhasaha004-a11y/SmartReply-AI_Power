package com.smartreply.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIReplyDTO {
    private String id;
    private String userId;
    private String originalEmail;
    private String emailSubject;
    private String sender;
    private String generatedReply;
    private String selectedTone;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

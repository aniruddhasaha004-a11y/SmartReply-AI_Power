package com.smartreply.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "ai_replies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIReply {

    @Id
    private String id;

    private String userId;

    private String originalEmail;

    private String emailSubject;

    private String sender;

    private String generatedReply;

    private String selectedTone;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}

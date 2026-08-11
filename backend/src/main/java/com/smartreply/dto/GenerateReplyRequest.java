package com.smartreply.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GenerateReplyRequest {

    @NotBlank(message = "Email subject is required")
    private String emailSubject;

    @NotBlank(message = "Email body is required")
    private String emailBody;

    private String sender; // Optional sender info

    @NotBlank(message = "Tone is required")
    private String tone; // Professional, Friendly, Formal, Casual, Short, Polite
}

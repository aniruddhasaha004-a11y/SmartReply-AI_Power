package com.smartreply.ai;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class EmailReplyAIService {

    private final ChatClient chatClient;

    @Value("classpath:/prompts/email-reply.st")
    private Resource promptResource;

    // ChatClient.Builder is auto-configured by Spring AI
    public EmailReplyAIService(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }

    public String generateReply(String subject, String emailBody, String sender, String tone) {
        try {
            String resolvedSender = (sender != null && !sender.isEmpty()) ? sender : "Unknown Sender";

            // Load and render prompt template with parameters
            PromptTemplate promptTemplate = new PromptTemplate(promptResource);
            String promptText = promptTemplate.render(Map.of(
                    "tone", tone,
                    "sender", resolvedSender,
                    "subject", subject,
                    "emailBody", emailBody
            ));

            // Call Gemini and extract text content
            String response = chatClient.prompt()
                    .user(promptText)
                    .call()
                    .content();

            if (response == null || response.trim().isEmpty()) {
                throw new RuntimeException("Received empty response from Gemini API");
            }

            return response.trim();
        } catch (Exception e) {
            throw new RuntimeException("Gemini generation failed: " + e.getMessage(), e);
        }
    }
}

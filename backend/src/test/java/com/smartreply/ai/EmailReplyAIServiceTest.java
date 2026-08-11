package com.smartreply.ai;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Answers;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.core.io.Resource;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.ByteArrayInputStream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

public class EmailReplyAIServiceTest {

    private EmailReplyAIService aiService;

    @Mock
    private ChatClient.Builder chatClientBuilder;

    @Mock(answer = Answers.RETURNS_DEEP_STUBS)
    private ChatClient chatClient;

    @Mock
    private Resource promptResource;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
        
        // Mock ChatClient Builder construction
        when(chatClientBuilder.build()).thenReturn(chatClient);
        
        aiService = new EmailReplyAIService(chatClientBuilder);
        
        // Inject mock Resource using Reflection utility
        ReflectionTestUtils.setField(aiService, "promptResource", promptResource);
    }

    @Test
    public void testGenerateReplySuccess() throws Exception {
        String expectedReply = "Dear Sender,\n\nThank you for reaching out. We will connect shortly.\n\nBest regards.";
        
        // Stub resource input stream
        String fakeTemplate = "Tone: {tone}\nSubject: {subject}\nBody: {emailBody}\nSender: {sender}";
        when(promptResource.getInputStream()).thenReturn(new ByteArrayInputStream(fakeTemplate.getBytes()));
        
        // Stub deep mock methods for chatClient builder pattern
        when(chatClient.prompt()
                .user(anyString())
                .call()
                .content())
                .thenReturn(expectedReply);

        String actualReply = aiService.generateReply("Meeting Update", "Can we meet tomorrow at 10?", "Manager", "Professional");

        assertNotNull(actualReply);
        assertEquals(expectedReply, actualReply);
    }
}

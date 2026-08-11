package com.smartreply.ai;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@SpringBootTest
public class GeminiIntegrationTest {

    static {
        try {
            Path path = Paths.get("../.env");
            if (!Files.exists(path)) {
                path = Paths.get(".env");
            }
            if (Files.exists(path)) {
                List<String> lines = Files.readAllLines(path);
                for (String line : lines) {
                    String trimmed = line.trim();
                    if (trimmed.isEmpty() || trimmed.startsWith("#")) {
                        continue;
                    }
                    String[] parts = trimmed.split("=", 2);
                    if (parts.length == 2) {
                        System.setProperty(parts[0].trim(), parts[1].trim());
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Autowired
    private EmailReplyAIService aiService;

    @Test
    public void testLiveGeminiCall() {
        try {
            System.out.println(">>> starting live Gemini integration test...");
            String reply = aiService.generateReply(
                "API Check", 
                "Verify if this connection works.", 
                "Diagnostics", 
                "Professional"
            );
            System.out.println(">>> LIVE REPLY GENERATED:");
            System.out.println(reply);
        } catch (Exception e) {
            System.out.println(">>> LIVE CALL FAILED:");
            e.printStackTrace();
        }
    }
}

package com.smartreply;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@SpringBootApplication
public class SmartReplyApplication {

    public static void main(String[] args) {
        loadDotEnv();
        SpringApplication.run(SmartReplyApplication.class, args);
    }

    private static void loadDotEnv() {
        // Look for .env in the current folder, or parent folder
        Path path = Paths.get(".env");
        if (!Files.exists(path)) {
            path = Paths.get("../.env");
        }

        if (Files.exists(path)) {
            try {
                List<String> lines = Files.readAllLines(path);
                for (String line : lines) {
                    String trimmed = line.trim();
                    if (trimmed.isEmpty() || trimmed.startsWith("#")) {
                        continue;
                    }
                    String[] parts = trimmed.split("=", 2);
                    if (parts.length == 2) {
                        String key = parts[0].trim();
                        String value = parts[1].trim();
                        
                        // Force-override system properties to prioritize .env configurations
                        System.setProperty(key, value);
                    }
                }
                System.out.println(">>> SmartReply: Loaded configuration properties from " + path.toAbsolutePath());
            } catch (IOException e) {
                System.err.println(">>> SmartReply: Failed to read .env file: " + e.getMessage());
            }
        } else {
            System.out.println(">>> SmartReply: No .env file found. Using default environment variables.");
        }
    }
}

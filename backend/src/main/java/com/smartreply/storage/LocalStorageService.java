package com.smartreply.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@ConditionalOnProperty(name = "storage.provider", havingValue = "local", matchIfMissing = true)
public class LocalStorageService implements StorageService {

    @Value("${storage.local-dir:./storage-uploads}")
    private String localDir;

    @Override
    public String uploadFile(MultipartFile file) {
        try {
            Path uploadPath = Paths.get(localDir).toAbsolutePath().normalize();
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename().replaceAll("\\s+", "_");
            Path targetLocation = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Returns relative server serving URL
            return "http://localhost:8080/api/storage/files/" + filename;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file locally: " + ex.getMessage(), ex);
        }
    }
}

package com.smartreply.storage;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.ObjectCannedACL;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.UUID;

@Service
@ConditionalOnProperty(name = "storage.provider", havingValue = "s3")
public class S3StorageService implements StorageService {

    @Autowired(required = false)
    private S3Client s3Client;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${aws.s3.region}")
    private String region;

    @Override
    public String uploadFile(MultipartFile file) {
        if (s3Client == null) {
            throw new RuntimeException("AWS S3 client is unconfigured. Please check environment credentials.");
        }

        try {
            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename().replaceAll("\\s+", "_");

            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(filename)
                    .contentType(file.getContentType())
                    .acl(ObjectCannedACL.PUBLIC_READ) // Make it readable so the URL is openable
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            // Construct and return the S3 URL
            return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, filename);
        } catch (IOException ex) {
            throw new RuntimeException("S3 file upload failed: " + ex.getMessage(), ex);
        }
    }
}

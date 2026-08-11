package com.smartreply.controller;

import com.smartreply.ai.EmailReplyAIService;
import com.smartreply.dto.AIReplyDTO;
import com.smartreply.dto.GenerateReplyRequest;
import com.smartreply.exception.ResourceNotFoundException;
import com.smartreply.model.AIReply;
import com.smartreply.repository.AIReplyRepository;
import com.smartreply.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/replies")
public class ReplyController {

    @Autowired
    private EmailReplyAIService aiService;

    @Autowired
    private AIReplyRepository replyRepository;

    @PostMapping("/generate")
    public ResponseEntity<AIReplyDTO> generateReply(
            @Valid @RequestBody GenerateReplyRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        // Generate response using the AI Service
        String generatedContent = aiService.generateReply(
                request.getEmailSubject(),
                request.getEmailBody(),
                request.getSender(),
                request.getTone()
        );

        // Build and save the entity in MongoDB
        AIReply reply = AIReply.builder()
                .userId(userPrincipal.getId())
                .originalEmail(request.getEmailBody())
                .emailSubject(request.getEmailSubject())
                .sender(request.getSender())
                .generatedReply(generatedContent)
                .selectedTone(request.getTone())
                .build();

        AIReply savedReply = replyRepository.save(reply);

        // Map and return DTO
        return ResponseEntity.status(HttpStatus.CREATED).body(mapToDTO(savedReply));
    }

    @GetMapping("/history")
    public ResponseEntity<List<AIReplyDTO>> getGenerationHistory(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        List<AIReply> replies = replyRepository.findByUserIdOrderByCreatedAtDesc(userPrincipal.getId());
        List<AIReplyDTO> dtos = replies.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AIReplyDTO> getReplyById(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        AIReply reply = replyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reply not found with id: " + id));

        // Validate Ownership (except if user is ADMIN)
        boolean isAdmin = userPrincipal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        
        if (!reply.getUserId().equals(userPrincipal.getId()) && !isAdmin) {
            throw new AccessDeniedException("You do not have permission to access this reply");
        }

        return ResponseEntity.ok(mapToDTO(reply));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReply(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        AIReply reply = replyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reply not found with id: " + id));

        // Validate Ownership
        boolean isAdmin = userPrincipal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        
        if (!reply.getUserId().equals(userPrincipal.getId()) && !isAdmin) {
            throw new AccessDeniedException("You do not have permission to delete this reply");
        }

        replyRepository.delete(reply);

        return ResponseEntity.ok().body("{\"message\": \"Reply deleted successfully!\"}");
    }

    private AIReplyDTO mapToDTO(AIReply reply) {
        return AIReplyDTO.builder()
                .id(reply.getId())
                .userId(reply.getUserId())
                .originalEmail(reply.getOriginalEmail())
                .emailSubject(reply.getEmailSubject())
                .sender(reply.getSender())
                .generatedReply(reply.getGeneratedReply())
                .selectedTone(reply.getSelectedTone())
                .createdAt(reply.getCreatedAt())
                .updatedAt(reply.getUpdatedAt())
                .build();
    }
}

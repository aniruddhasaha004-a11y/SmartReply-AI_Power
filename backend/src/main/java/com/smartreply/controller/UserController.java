package com.smartreply.controller;

import com.smartreply.dto.TonePreferenceRequest;
import com.smartreply.dto.UserDTO;
import com.smartreply.exception.ResourceNotFoundException;
import com.smartreply.model.User;
import com.smartreply.repository.UserRepository;
import com.smartreply.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getUserProfile(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userPrincipal.getId()));

        UserDTO userDTO = UserDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .preferredTone(user.getPreferredTone())
                .createdAt(user.getCreatedAt())
                .build();

        return ResponseEntity.ok(userDTO);
    }

    @PutMapping("/preferences")
    public ResponseEntity<UserDTO> updateUserPreferences(
            @Valid @RequestBody TonePreferenceRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userPrincipal.getId()));

        user.setPreferredTone(request.getPreferredTone());
        User updatedUser = userRepository.save(user);

        UserDTO userDTO = UserDTO.builder()
                .id(updatedUser.getId())
                .name(updatedUser.getName())
                .email(updatedUser.getEmail())
                .role(updatedUser.getRole().name())
                .preferredTone(updatedUser.getPreferredTone())
                .createdAt(updatedUser.getCreatedAt())
                .build();

        return ResponseEntity.ok(userDTO);
    }
}

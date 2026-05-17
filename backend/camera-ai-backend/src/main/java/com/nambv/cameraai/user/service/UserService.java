package com.nambv.cameraai.user.service;

import com.nambv.cameraai.auth.security.CustomUserDetails;
import com.nambv.cameraai.user.dto.UpdateFcmTokenRequest;
import com.nambv.cameraai.user.entity.User;
import com.nambv.cameraai.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public void updateFcmToken(UpdateFcmTokenRequest request) {
        User currentUser = getCurrentUser();

        currentUser.setFcmToken(request.getFcmToken());

        userRepository.save(currentUser);
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails userDetails)) {
            throw new RuntimeException("Unauthenticated user");
        }

        Long userId = userDetails.getId();

        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
    }
}
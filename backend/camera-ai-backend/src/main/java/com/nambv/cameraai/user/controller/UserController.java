package com.nambv.cameraai.user.controller;

import com.nambv.cameraai.common.response.ApiResponse;
import com.nambv.cameraai.user.dto.UpdateFcmTokenRequest;
import com.nambv.cameraai.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/fcm-token")
    public ApiResponse<Void> updateFcmToken(@Valid @RequestBody UpdateFcmTokenRequest request) {
        userService.updateFcmToken(request);
        return ApiResponse.success("FCM token updated successfully", null);
    }
}
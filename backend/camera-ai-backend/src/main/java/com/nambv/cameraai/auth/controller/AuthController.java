package com.nambv.cameraai.auth.controller;

import com.nambv.cameraai.auth.dto.AuthResponse;
import com.nambv.cameraai.auth.dto.LoginRequest;
import com.nambv.cameraai.auth.dto.RegisterRequest;
import com.nambv.cameraai.auth.service.AuthService;
import com.nambv.cameraai.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ApiResponse.success("Register successfully", response);
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ApiResponse.success("Login successfully", response);
    }
}
package com.nambv.cameraai.alert.controller;

import com.nambv.cameraai.alert.dto.AlertUploadResponse;
import com.nambv.cameraai.alert.service.AlertService;
import com.nambv.cameraai.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertService alertService;

    @PostMapping("/upload")
    public ApiResponse<AlertUploadResponse> uploadAlert(
            @RequestParam("image") MultipartFile image,

            @RequestParam(value = "macAddress", required = false) String macAddressCamel,
            @RequestParam(value = "mac_address", required = false) String macAddressSnake,

            @RequestParam(value = "confidenceScore", required = false) BigDecimal confidenceScoreCamel,
            @RequestParam(value = "confidence_score", required = false) BigDecimal confidenceScoreSnake
    ) {
        String macAddress = macAddressCamel != null ? macAddressCamel : macAddressSnake;
        BigDecimal confidenceScore = confidenceScoreCamel != null ? confidenceScoreCamel : confidenceScoreSnake;

        AlertUploadResponse response = alertService.uploadAlert(
                image,
                macAddress,
                confidenceScore
        );

        return ApiResponse.success("Alert uploaded successfully", response);
    }
}
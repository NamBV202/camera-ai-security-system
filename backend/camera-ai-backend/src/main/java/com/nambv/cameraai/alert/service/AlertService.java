package com.nambv.cameraai.alert.service;

import com.nambv.cameraai.alert.dto.AlertUploadResponse;
import com.nambv.cameraai.alert.entity.AlertRecord;
import com.nambv.cameraai.alert.repository.AlertRecordRepository;
import com.nambv.cameraai.device.entity.Device;
import com.nambv.cameraai.device.repository.DeviceRepository;
import com.nambv.cameraai.storage.service.MinioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRecordRepository alertRecordRepository;
    private final DeviceRepository deviceRepository;
    private final MinioService minioService;

    public AlertUploadResponse uploadAlert(
            MultipartFile image,
            String macAddress,
            BigDecimal confidenceScore
    ) {
        validateUploadRequest(image, macAddress, confidenceScore);

        String normalizedMac = normalizeMacAddress(macAddress);

        Device device = deviceRepository.findByMacAddress(normalizedMac)
                .orElseThrow(() -> new RuntimeException("Device not found. Please send heartbeat first."));

        String mediaUrl = minioService.uploadAlertImage(image, normalizedMac);

        AlertRecord alertRecord = AlertRecord.builder()
                .device(device)
                .mediaUrl(mediaUrl)
                .mediaType("IMAGE")
                .confidenceScore(confidenceScore)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        AlertRecord savedAlert = alertRecordRepository.save(alertRecord);

        device.setStatus("ONLINE");
        device.setLastActive(LocalDateTime.now());
        deviceRepository.save(device);

        return AlertUploadResponse.builder()
                .alertId(savedAlert.getId())
                .deviceId(device.getId())
                .macAddress(device.getMacAddress())
                .mediaUrl(savedAlert.getMediaUrl())
                .mediaType(savedAlert.getMediaType())
                .confidenceScore(savedAlert.getConfidenceScore())
                .createdAt(savedAlert.getCreatedAt())
                .build();
    }

    private void validateUploadRequest(
            MultipartFile image,
            String macAddress,
            BigDecimal confidenceScore
    ) {
        if (image == null || image.isEmpty()) {
            throw new RuntimeException("Image file is required");
        }

        if (macAddress == null || macAddress.isBlank()) {
            throw new RuntimeException("MAC address is required");
        }

        if (confidenceScore == null) {
            throw new RuntimeException("Confidence score is required");
        }

        if (confidenceScore.compareTo(BigDecimal.ZERO) < 0
                || confidenceScore.compareTo(BigDecimal.ONE) > 0) {
            throw new RuntimeException("Confidence score must be between 0 and 1");
        }

        String contentType = image.getContentType();

        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("Only image files are allowed");
        }
    }

    private String normalizeMacAddress(String macAddress) {
        return macAddress.trim().toUpperCase();
    }
}
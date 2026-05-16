package com.nambv.cameraai.alert.service;

import com.nambv.cameraai.alert.dto.AlertResponse;
import com.nambv.cameraai.alert.dto.AlertUploadResponse;
import com.nambv.cameraai.alert.entity.AlertRecord;
import com.nambv.cameraai.alert.repository.AlertRecordRepository;
import com.nambv.cameraai.auth.security.CustomUserDetails;
import com.nambv.cameraai.device.entity.Device;
import com.nambv.cameraai.device.repository.DeviceRepository;
import com.nambv.cameraai.storage.service.MinioService;
import com.nambv.cameraai.user.entity.User;
import com.nambv.cameraai.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRecordRepository alertRecordRepository;
    private final DeviceRepository deviceRepository;
    private final UserRepository userRepository;
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

    public List<AlertResponse> getMyAlerts() {
        User currentUser = getCurrentUser();

        List<Device> devices = deviceRepository.findByUser(currentUser);

        if (devices.isEmpty()) {
            return List.of();
        }

        return alertRecordRepository.findByDeviceInOrderByCreatedAtDesc(devices)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<AlertResponse> getAlertsByDevice(Long deviceId) {
        User currentUser = getCurrentUser();

        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new RuntimeException("Device not found"));

        checkDeviceOwner(device, currentUser);

        return alertRecordRepository.findByDeviceOrderByCreatedAtDesc(device)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public AlertResponse markAsRead(Long alertId) {
        User currentUser = getCurrentUser();

        AlertRecord alertRecord = alertRecordRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found"));

        Device device = alertRecord.getDevice();

        checkDeviceOwner(device, currentUser);

        alertRecord.setIsRead(true);

        AlertRecord savedAlert = alertRecordRepository.save(alertRecord);

        return toResponse(savedAlert);
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

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails userDetails)) {
            throw new RuntimeException("Unauthenticated user");
        }

        Long userId = userDetails.getId();

        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
    }

    private void checkDeviceOwner(Device device, User currentUser) {
        if (device.getUser() == null || !device.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You do not have permission to access this device");
        }
    }

    private AlertResponse toResponse(AlertRecord alertRecord) {
        Device device = alertRecord.getDevice();

        return AlertResponse.builder()
                .id(alertRecord.getId())
                .deviceId(device.getId())
                .deviceName(device.getDeviceName())
                .macAddress(device.getMacAddress())
                .mediaUrl(alertRecord.getMediaUrl())
                .mediaType(alertRecord.getMediaType())
                .confidenceScore(alertRecord.getConfidenceScore())
                .isRead(alertRecord.getIsRead())
                .createdAt(alertRecord.getCreatedAt())
                .build();
    }

    private String normalizeMacAddress(String macAddress) {
        return macAddress.trim().toUpperCase();
    }
}
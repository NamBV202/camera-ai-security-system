package com.nambv.cameraai.device.service;

import com.nambv.cameraai.auth.security.CustomUserDetails;
import com.nambv.cameraai.device.constant.DeviceStatus;
import com.nambv.cameraai.device.dto.DeviceHeartbeatRequest;
import com.nambv.cameraai.device.dto.DevicePairRequest;
import com.nambv.cameraai.device.dto.DeviceResponse;
import com.nambv.cameraai.device.dto.DeviceUpdateRequest;
import com.nambv.cameraai.device.entity.Device;
import com.nambv.cameraai.device.repository.DeviceRepository;
import com.nambv.cameraai.user.entity.User;
import com.nambv.cameraai.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DeviceService {

    private final DeviceRepository deviceRepository;
    private final UserRepository userRepository;

    public DeviceResponse heartbeat(DeviceHeartbeatRequest request) {
        String normalizedMac = normalizeMacAddress(request.getMacAddress());

        Device device = deviceRepository.findByMacAddress(normalizedMac)
                .orElseGet(() -> Device.builder()
                        .macAddress(normalizedMac)
                        .deviceName("Camera Device")
                        .status(DeviceStatus.ONLINE)
                        .detectionDistance(100.0f)
                        .createdAt(LocalDateTime.now())
                        .build()
                );

        device.setLocalIp(request.getLocalIp());
        device.setStatus(DeviceStatus.ONLINE);
        device.setLastActive(LocalDateTime.now());

        Device savedDevice = deviceRepository.save(device);

        return toResponse(savedDevice);
    }

    public DeviceResponse pairDevice(DevicePairRequest request) {
        User currentUser = getCurrentUser();
        String normalizedMac = normalizeMacAddress(request.getMacAddress());

        Device device = deviceRepository.findByMacAddress(normalizedMac)
                .orElseGet(() -> Device.builder()
                        .macAddress(normalizedMac)
                        .deviceName("Camera Device")
                        .status(DeviceStatus.OFFLINE)
                        .detectionDistance(100.0f)
                        .createdAt(LocalDateTime.now())
                        .build()
                );

        if (device.getUser() != null && !device.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Device already belongs to another user");
        }

        device.setUser(currentUser);

        if (request.getDeviceName() != null && !request.getDeviceName().isBlank()) {
            device.setDeviceName(request.getDeviceName().trim());
        } else if (device.getDeviceName() == null || device.getDeviceName().isBlank()) {
            device.setDeviceName("Camera Device");
        }

        Device savedDevice = deviceRepository.save(device);

        return toResponse(savedDevice);
    }

    public List<DeviceResponse> getMyDevices() {
        User currentUser = getCurrentUser();

        return deviceRepository.findByUser(currentUser)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public DeviceResponse getMyDeviceById(Long deviceId) {
        User currentUser = getCurrentUser();

        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new RuntimeException("Device not found"));

        checkDeviceOwner(device, currentUser);

        return toResponse(device);
    }

    public DeviceResponse updateDevice(Long deviceId, DeviceUpdateRequest request) {
        User currentUser = getCurrentUser();

        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new RuntimeException("Device not found"));

        checkDeviceOwner(device, currentUser);

        if (request.getDeviceName() != null && !request.getDeviceName().isBlank()) {
            device.setDeviceName(request.getDeviceName().trim());
        }

        if (request.getDetectionDistance() != null) {
            if (request.getDetectionDistance() <= 0) {
                throw new RuntimeException("Detection distance must be greater than 0");
            }
            device.setDetectionDistance(request.getDetectionDistance());
        }

        Device savedDevice = deviceRepository.save(device);

        return toResponse(savedDevice);
    }

    public void unpairDevice(Long deviceId) {
        User currentUser = getCurrentUser();

        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new RuntimeException("Device not found"));

        checkDeviceOwner(device, currentUser);

        device.setUser(null);
        device.setDeviceName("Camera Device");

        deviceRepository.save(device);
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

    private String normalizeMacAddress(String macAddress) {
        if (macAddress == null || macAddress.isBlank()) {
            throw new RuntimeException("MAC address is required");
        }

        return macAddress.trim().toUpperCase();
    }

    private DeviceResponse toResponse(Device device) {
        return DeviceResponse.builder()
                .id(device.getId())
                .macAddress(device.getMacAddress())
                .deviceName(device.getDeviceName())
                .localIp(device.getLocalIp())
                .status(device.getStatus())
                .detectionDistance(device.getDetectionDistance())
                .lastActive(device.getLastActive())
                .createdAt(device.getCreatedAt())
                .build();
    }
}
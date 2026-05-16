package com.nambv.cameraai.device.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeviceResponse {

    private Long id;
    private String macAddress;
    private String deviceName;
    private String localIp;
    private String status;
    private Float detectionDistance;
    private LocalDateTime lastActive;
    private LocalDateTime createdAt;
}
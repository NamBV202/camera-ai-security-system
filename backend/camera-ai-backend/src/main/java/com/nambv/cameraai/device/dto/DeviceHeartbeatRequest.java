package com.nambv.cameraai.device.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DeviceHeartbeatRequest {

    @NotBlank(message = "MAC address is required")
    private String macAddress;

    private String localIp;
}
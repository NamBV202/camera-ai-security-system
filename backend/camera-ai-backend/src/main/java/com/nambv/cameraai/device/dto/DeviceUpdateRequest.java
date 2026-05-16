package com.nambv.cameraai.device.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DeviceUpdateRequest {

    private String deviceName;

    private Float detectionDistance;
}
package com.nambv.cameraai.device.controller;

import com.nambv.cameraai.alert.dto.AlertResponse;
import com.nambv.cameraai.alert.service.AlertService;
import com.nambv.cameraai.common.response.ApiResponse;
import com.nambv.cameraai.device.dto.DeviceHeartbeatRequest;
import com.nambv.cameraai.device.dto.DevicePairRequest;
import com.nambv.cameraai.device.dto.DeviceResponse;
import com.nambv.cameraai.device.dto.DeviceUpdateRequest;
import com.nambv.cameraai.device.service.DeviceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/devices")
@RequiredArgsConstructor
public class DeviceController {

    private final DeviceService deviceService;
    private final AlertService alertService;

    @PostMapping("/heartbeat")
    public ApiResponse<DeviceResponse> heartbeat(@Valid @RequestBody DeviceHeartbeatRequest request) {
        DeviceResponse response = deviceService.heartbeat(request);
        return ApiResponse.success("Device heartbeat received", response);
    }

    @PostMapping("/pair")
    public ApiResponse<DeviceResponse> pairDevice(@Valid @RequestBody DevicePairRequest request) {
        DeviceResponse response = deviceService.pairDevice(request);
        return ApiResponse.success("Device paired successfully", response);
    }

    @GetMapping
    public ApiResponse<List<DeviceResponse>> getMyDevices() {
        List<DeviceResponse> response = deviceService.getMyDevices();
        return ApiResponse.success("Get devices successfully", response);
    }

    @GetMapping("/{id}")
    public ApiResponse<DeviceResponse> getMyDeviceById(@PathVariable Long id) {
        DeviceResponse response = deviceService.getMyDeviceById(id);
        return ApiResponse.success("Get device successfully", response);
    }

    @GetMapping("/{id}/alerts")
    public ApiResponse<List<AlertResponse>> getAlertsByDevice(@PathVariable Long id) {
        List<AlertResponse> response = alertService.getAlertsByDevice(id);
        return ApiResponse.success("Get device alerts successfully", response);
    }

    @PatchMapping("/{id}")
    public ApiResponse<DeviceResponse> updateDevice(
            @PathVariable Long id,
            @RequestBody DeviceUpdateRequest request
    ) {
        DeviceResponse response = deviceService.updateDevice(id, request);
        return ApiResponse.success("Device updated successfully", response);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> unpairDevice(@PathVariable Long id) {
        deviceService.unpairDevice(id);
        return ApiResponse.success("Device unpaired successfully", null);
    }
}
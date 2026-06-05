package com.nambv.cameraai.device.scheduler;

import com.nambv.cameraai.device.constant.DeviceStatus;
import com.nambv.cameraai.device.entity.Device;
import com.nambv.cameraai.device.repository.DeviceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DeviceStatusScheduler {

    private final DeviceRepository deviceRepository;

    private static final long OFFLINE_TIMEOUT_SECONDS = 30;

    @Scheduled(fixedRate = 10000)
    public void markInactiveDevicesOffline() {
        LocalDateTime now = LocalDateTime.now();

        List<Device> onlineDevices = deviceRepository.findByStatus(DeviceStatus.ONLINE);

        for (Device device : onlineDevices) {
            LocalDateTime lastActive = device.getLastActive();

            if (lastActive == null) {
                continue;
            }

            long inactiveSeconds = Duration.between(lastActive, now).getSeconds();

            if (inactiveSeconds > OFFLINE_TIMEOUT_SECONDS) {
                device.setStatus(DeviceStatus.OFFLINE);
                deviceRepository.save(device);

                log.info("Device {} marked OFFLINE after {} seconds inactive",
                        device.getMacAddress(),
                        inactiveSeconds);
            }
        }
    }
}
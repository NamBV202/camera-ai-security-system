package com.nambv.cameraai.device.repository;

import com.nambv.cameraai.device.entity.Device;
import com.nambv.cameraai.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DeviceRepository extends JpaRepository<Device, Long> {

    Optional<Device> findByMacAddress(String macAddress);

    boolean existsByMacAddress(String macAddress);

    List<Device> findByUser(User user);
}
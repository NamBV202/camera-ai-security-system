package com.nambv.cameraai.alert.repository;

import com.nambv.cameraai.alert.entity.AlertRecord;
import com.nambv.cameraai.device.entity.Device;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AlertRecordRepository extends JpaRepository<AlertRecord, Long> {

    List<AlertRecord> findByDeviceInOrderByCreatedAtDesc(List<Device> devices);

    List<AlertRecord> findByDeviceInAndIsReadOrderByCreatedAtDesc(List<Device> devices, Boolean isRead);

    List<AlertRecord> findByDeviceOrderByCreatedAtDesc(Device device);

    List<AlertRecord> findByDeviceAndIsReadOrderByCreatedAtDesc(Device device, Boolean isRead);

    List<AlertRecord> findByDeviceAndIsReadFalse(Device device);
}
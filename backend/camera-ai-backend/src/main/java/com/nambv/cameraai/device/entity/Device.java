package com.nambv.cameraai.device.entity;

import com.nambv.cameraai.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "devices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Device {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "mac_address", nullable = false, unique = true, length = 17)
    private String macAddress;

    @Column(name = "device_name", length = 100)
    private String deviceName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "local_ip", length = 45)
    private String localIp;

    @Column(length = 20)
    private String status;

    @Column(name = "detection_distance")
    private Float detectionDistance;

    @Column(name = "last_active")
    private LocalDateTime lastActive;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (this.deviceName == null) {
            this.deviceName = "Camera Device";
        }

        if (this.status == null) {
            this.status = "OFFLINE";
        }

        if (this.detectionDistance == null) {
            this.detectionDistance = 100.0f;
        }

        this.createdAt = LocalDateTime.now();
    }
}
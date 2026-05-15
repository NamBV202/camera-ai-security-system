package com.nambv.cameraai.alert.entity;

import com.nambv.cameraai.device.entity.Device;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "alert_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlertRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id", nullable = false)
    private Device device;

    @Column(name = "media_url", nullable = false, length = 500)
    private String mediaUrl;

    @Column(name = "media_type", length = 20)
    private String mediaType;

    @Column(name = "confidence_score", nullable = false, precision = 5, scale = 4)
    private BigDecimal confidenceScore;

    @Column(name = "is_read")
    private Boolean isRead;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (this.mediaType == null) {
            this.mediaType = "IMAGE";
        }

        if (this.isRead == null) {
            this.isRead = false;
        }

        this.createdAt = LocalDateTime.now();
    }
}
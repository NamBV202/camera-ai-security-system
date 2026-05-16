package com.nambv.cameraai.alert.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlertResponse {

    private Long id;

    private Long deviceId;

    private String deviceName;

    private String macAddress;

    private String mediaUrl;

    private String mediaType;

    private BigDecimal confidenceScore;

    private Boolean isRead;

    private LocalDateTime createdAt;
}
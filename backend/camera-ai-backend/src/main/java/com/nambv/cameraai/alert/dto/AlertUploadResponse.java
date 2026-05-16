package com.nambv.cameraai.alert.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlertUploadResponse {

    private Long alertId;
    private Long deviceId;
    private String macAddress;
    private String mediaUrl;
    private String mediaType;
    private BigDecimal confidenceScore;
    private LocalDateTime createdAt;
}
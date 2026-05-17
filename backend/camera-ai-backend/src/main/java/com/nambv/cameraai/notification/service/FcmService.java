package com.nambv.cameraai.notification.service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class FcmService {

    public void sendAlertNotification(
            String fcmToken,
            Long alertId,
            Long deviceId,
            String deviceName,
            String mediaUrl
    ) {
        if (fcmToken == null || fcmToken.isBlank()) {
            log.warn("FCM token is empty. Skip sending notification.");
            return;
        }

        try {
            Message message = Message.builder()
                    .setToken(fcmToken)
                    .setNotification(Notification.builder()
                            .setTitle("Phát hiện người")
                            .setBody(deviceName + " vừa ghi nhận cảnh báo mới")
                            .build())
                    .putData("type", "ALERT")
                    .putData("alertId", String.valueOf(alertId))
                    .putData("deviceId", String.valueOf(deviceId))
                    .putData("deviceName", deviceName != null ? deviceName : "")
                    .putData("mediaUrl", mediaUrl != null ? mediaUrl : "")
                    .build();

            String response = FirebaseMessaging.getInstance().send(message);

            log.info("FCM notification sent successfully: {}", response);

        } catch (Exception e) {
            log.error("Failed to send FCM notification: {}", e.getMessage(), e);
        }
    }
}
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { updateFcmToken } from "../api/userApi";

// Hiển thị notification ngay cả khi app đang mở foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Xin quyền thông báo, lấy FCM device token và gửi lên backend.
 */
export const registerForPushNotifications = async () => {
  if (!Device.isDevice) return null;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") return null;

  try {
    const tokenData = await Notifications.getDevicePushTokenAsync();
    const fcmToken = tokenData.data;
    await updateFcmToken(fcmToken);
    return fcmToken;
  } catch {
    return null;
  }
};

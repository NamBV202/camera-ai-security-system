import apiClient from "./apiClient";

export const getProfile = () => apiClient.get("/api/users/me");

export const updateFcmToken = (fcmToken) =>
  apiClient.post("/api/users/fcm-token", { fcmToken });

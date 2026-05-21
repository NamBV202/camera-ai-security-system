import apiClient from "./apiClient";

export const getAlerts = () => apiClient.get("/api/alerts");

export const getAlertsByDevice = (deviceId) =>
  apiClient.get(`/api/devices/${deviceId}/alerts`);

export const markAsRead = (alertId) =>
  apiClient.patch(`/api/alerts/${alertId}/read`);

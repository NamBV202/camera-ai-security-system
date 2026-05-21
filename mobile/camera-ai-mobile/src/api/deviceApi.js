import apiClient from "./apiClient";

export const getDevices = () => apiClient.get("/api/devices");

export const pairDevice = (macAddress, deviceName) =>
  apiClient.post("/api/devices/pair", {
    macAddress,
    deviceName,
  });

export const updateDevice = (deviceId, data) =>
  apiClient.patch(`/api/devices/${deviceId}`, data);

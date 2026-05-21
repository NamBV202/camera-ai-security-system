import axios from "axios";

// ESP32-CAM SoftAP — KHÔNG dùng chung apiClient vì URL khác
const ESP32_BASE = "http://192.168.4.1";

const esp32Client = axios.create({
  baseURL: ESP32_BASE,
  timeout: 8000,
  headers: { "Content-Type": "application/json" },
});

/**
 * GET /info
 * Response: { mac_address, device_type, firmware_version }
 */
export const getEsp32Info = () => esp32Client.get("/info");

/**
 * POST /wifi
 * Body: { ssid, password }
 */
export const sendWifiConfig = (ssid, password) =>
  esp32Client.post("/wifi", { ssid, password });

import axios from "axios";
import { getToken, removeToken } from "../storage/tokenStorage";
import { navigateToAuth } from "../navigation/navigationRef";

// Đổi thành IP backend thật của bạn khi test
export const API_BASE_URL = "http://192.168.0.104:8080";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Tự động gắn JWT vào mọi request
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Tự động xử lý 401: xóa token và về màn Login
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await removeToken();
      navigateToAuth();
    }
    return Promise.reject(error);
  },
);

export default apiClient;

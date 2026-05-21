import apiClient from "./apiClient";

export const login = (username, password) =>
  apiClient.post("/api/auth/login", { username, password });

export const register = (username, password, email) =>
  apiClient.post("/api/auth/register", { username, password, email });

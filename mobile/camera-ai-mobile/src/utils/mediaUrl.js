import { API_BASE_URL } from "../api/apiClient";

const SERVER_HOST = API_BASE_URL.replace(/^https?:\/\//, "").split(":")[0];

/**
 * Replaces localhost in MinIO URLs with the actual server IP
 * so physical devices can load media files.
 */
export const resolveMediaUrl = (url) => {
  if (!url) return null;
  return url.replace("localhost", SERVER_HOST);
};

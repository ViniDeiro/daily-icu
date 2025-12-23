import axios from "axios";
import Constants from "expo-constants";
import { useAuth } from "../stores/auth";

const envBaseURL = (globalThis as any)?.process?.env?.EXPO_PUBLIC_API_BASE_URL as string | undefined;

const baseURL =
  envBaseURL ||
  (Constants?.expoConfig?.extra as any)?.apiBaseUrl ||
  ((Constants as any)?.manifest?.extra as any)?.apiBaseUrl ||
  "http://localhost:3000";

export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = useAuth.getState().token;
  const hospitalId = useAuth.getState().hospitalId;
  if (token) {
    const h = (config.headers || {}) as any;
    h.Authorization = `Bearer ${token}`;
    if (hospitalId) h["X-Hospital-Id"] = hospitalId;
    config.headers = h;
  }
  return config;
});

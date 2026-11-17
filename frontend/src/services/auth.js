
import api from "./api";

function saveSession(token, user, remember) {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
  sessionStorage.removeItem("auth_token");
  sessionStorage.removeItem("auth_user");

  const storage = remember ? localStorage : sessionStorage;
  storage.setItem("auth_token", token);
  storage.setItem("auth_user", JSON.stringify(user));
}

export async function login(email, password, remember = false) {
  const { data } = await api.post("/auth/login", { email, password });
  saveSession(data.token, data.user, remember);
  return data.user;
}

export async function register(name, email, password, password_confirmation) {
  const { data } = await api.post("/auth/register", {
    name, email, password, password_confirmation
  });
  return data;
}

export async function fetchMe() {
  const { data } = await api.get("/auth/me");
  const storage = localStorage.getItem("auth_token")
    ? localStorage
    : sessionStorage;
  storage.setItem("auth_user", JSON.stringify(data.user));
  return data.user;
}

export async function forgotPassword(email) {
  const { data } = await api.post("/auth/forgot-password", { email });
  return data;
}

export async function resetPassword(payload) {
  const { data } = await api.post("/auth/reset-password", payload);
  return data;
}

export async function logout() {
  try {
    await api.post("/auth/logout");
  } finally {
    ["auth_token", "auth_user"].forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
  }
}

export function getCurrentUser() {
  try {
    const value = localStorage.getItem("auth_user") ||
      sessionStorage.getItem("auth_user");
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

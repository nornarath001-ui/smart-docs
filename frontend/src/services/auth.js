
import api from "./api";

export async function login(email, password) {
  const { data } = await api.post("/auth/login", { email, password });
  localStorage.setItem("auth_token", data.token);
  localStorage.setItem("auth_user", JSON.stringify(data.user));
  return data.user;
}

export async function fetchMe() {
  const { data } = await api.get("/auth/me");
  localStorage.setItem("auth_user", JSON.stringify(data.user));
  return data.user;
}

export async function logout() {
  try {
    await api.post("/auth/logout");
  } finally {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  }
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("auth_user") || "null");
  } catch {
    return null;
  }
}


import { createContext, useContext, useEffect, useState } from "react";
import { fetchMe, getCurrentUser, login, logout } from "../services/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getCurrentUser);
  const [loading, setLoading] = useState(
    !!(localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token"))
  );

  useEffect(() => {
    const token = localStorage.getItem("auth_token") ||
      sessionStorage.getItem("auth_token");

    if (!token) {
      setLoading(false);
      return;
    }

    fetchMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function signIn(email, password, remember) {
    const result = await login(email, password, remember);
    setUser(result);
    return result;
  }

async function signOut() {
  try {
    await logout();
  } finally {
    setUser(null);
    window.location.assign("/login");
  }
}

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be inside AuthProvider");
  return context;
}

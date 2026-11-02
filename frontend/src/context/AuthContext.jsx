
import { createContext, useContext, useEffect, useState } from "react";
import { fetchMe, getCurrentUser, login, logout } from "../services/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getCurrentUser);
  const [loading, setLoading] = useState(!!localStorage.getItem("auth_token"));

  useEffect(() => {
    if (!localStorage.getItem("auth_token")) {
      setLoading(false);
      return;
    }
    fetchMe().then(setUser).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);

  async function signIn(email, password) {
    const result = await login(email, password);
    setUser(result);
    return result;
  }

  async function signOut() {
    await logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be inside AuthProvider");
  return context;
}

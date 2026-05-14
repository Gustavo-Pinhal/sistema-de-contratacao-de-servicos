"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

export type UserRole = "client" | "provider" | "business" | null;

export interface UserProfile {
  id: string;
  name?: string;
  email: string;
  role: UserRole;
  token: string;
}

interface UserContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (data: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Persistência local
  useEffect(() => {
    const saved = localStorage.getItem("app_user");
    if (saved) setUser(JSON.parse(saved));
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      user
        ? localStorage.setItem("app_user", JSON.stringify(user))
        : localStorage.removeItem("app_user");
    }
  }, [user, loading]);

  const parseJwt = (token: string) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };

  const login = async (email: string, pass: string) => {
    try {
      const response = await fetch("/api/login_check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password: pass }),
      });

      if (!response.ok) return false;

      const { token } = await response.json();
      const decoded = parseJwt(token);

      if (decoded) {
        setUser({
          id: decoded.id || decoded.sub,
          email,
          token,
          role: decoded.roles?.[0] || "client",
          name: decoded.nome,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await fetch(
        "https://localhost/api/cadastro-usuario/cliente",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome: userData.name,
            email: userData.email,
            telefone: userData.phone,
            senha: userData.password,
          }),
        },
      );

      const data = await response.json();
      if (response.ok) return { success: true };

      return {
        success: false,
        error: data.message || data.detail || "Erro ao realizar cadastro.",
      };
    } catch (error) {
      return { success: false, error: "Conexão com o servidor falhou." };
    }
  };

  const logout = () => setUser(null);

  return (
    <UserContext.Provider
      value={{ user, isLoggedIn: !!user, login, register, logout }}
    >
      {!loading && children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
};

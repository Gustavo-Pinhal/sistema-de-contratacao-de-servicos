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
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("app_user");
    if (saved) setUser(JSON.parse(saved));
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      if (user) localStorage.setItem("app_user", JSON.stringify(user));
      else localStorage.removeItem("app_user");
    }
  }, [user, loading]);

  const login = async (email: string, pass: string) => {
    try {
      const response = await fetch("/api/login_check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password: pass }),
      });

      if (!response.ok) return false;

      const data = await response.json(); // { "token": "..." }

      // Decodificando o token
      const decoded = parseJwt(data.token);

      if (decoded) {
        setUser({
          // Ajuste os nomes abaixo conforme a estrutura do seu JWT (ex: sub, id, role)
          id: decoded.id || decoded.sub,
          email: email,
          token: data.token,
          role: decoded.roles?.[0] || "client",
          name: decoded.nome,
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error("Erro no login:", error);
      return false;
    }
  };

  const logout = () => setUser(null);

  return (
    <UserContext.Provider value={{ user, isLoggedIn: !!user, login, logout }}>
      {!loading && children}
    </UserContext.Provider>
  );

  function parseJwt(token: string) {
    try {
      // Pega a parte do Payload (índice 1)
      const base64Url = token.split(".")[1];
      // Ajusta caracteres especiais do padrão Base64Url para Base64
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      // Decodifica e converte para objeto JSON
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      );

      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
};

"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

export type UserRole =
  | "ROLE_ADMIN"
  | "ROLE_CLIENTE"
  | "ROLE_PRESTADOR"
  | "ROLE_PREMIUM"
  | "admin"
  | "client"
  | "provider"
  | "business"
  | null;

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
  loading: boolean;
  login: (email: string, pass: string) => Promise<UserRole | false>;
  register: (data: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const STORAGE_KEY = "@app:user";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost";

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

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Inicialização e Persistência
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsedUser = JSON.parse(saved);
        // Opcional: Validar expiração do token aqui
        setUser(parsedUser);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [user, loading]);

  // Ações
  const login = useCallback(async (email: string, pass: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/login_check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password: pass }),
      });

      if (!response.ok) return false as false;

      const { token } = await response.json();
      const decoded = parseJwt(token);

      if (decoded) {
        const role: UserRole = decoded.roles?.[0] || "client";
        setUser({
          id: decoded.id || decoded.sub,
          email,
          token,
          role,
          name: decoded.nome || decoded.name,
        });
        return role;
      }
      return false;
    } catch (error) {
      console.error("Login Error:", error);
      return false;
    }
  }, []);

  const register = useCallback(async (userData: any) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/cadastro-usuario/cliente`,
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
      console.error("Register Error:", error);
      return { success: false, error: "Conexão com o servidor falhou." };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
};

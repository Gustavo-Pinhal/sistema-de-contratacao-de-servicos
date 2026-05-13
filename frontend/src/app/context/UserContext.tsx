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

      const data = await response.json(); // Recebe o { "token": "..." }

      // Aqui você pode decodificar o payload do JWT se precisar do nome/role
      // ou apenas salvar o email e o token.
      setUser({ email, token: data.token, role: "client" });
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = () => setUser(null);

  return (
    <UserContext.Provider value={{ user, isLoggedIn: !!user, login, logout }}>
      {!loading && children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
};

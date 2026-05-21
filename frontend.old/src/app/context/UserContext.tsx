import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type UserRole = 'client' | 'provider' | 'business' | null;

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  plan?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  memberSince: string;
}

interface UserContextType {
  user: UserProfile | null;
  userRole: UserRole;
  isLoggedIn: boolean;
  userPlan: string | null;
  register: (profile: Omit<UserProfile, "id" | "memberSince">) => void;
  login: (email: string, expectedRole?: Exclude<UserRole, null>) => boolean;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  resetAllData: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('sim_currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [simulatedUsers, setSimulatedUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('sim_allUsers');
    const defaultUsers: UserProfile[] = [
      {
        id: "u_mock_ana",
        name: "Ana Costa",
        email: "ana@email.com",
        phone: "(11) 98888-7777",
        role: "client",
        memberSince: "2026-01-15",
        city: "São Paulo",
        state: "SP",
        address: "Rua das Flores, 123"
      },
      {
        id: "1",
        name: "João Silva",
        email: "joao@eletrica.com",
        role: "provider",
        memberSince: "2025-05-10",
        plan: "premium"
      },
      {
        id: "7",
        name: "Conserta Tudo Ltda",
        email: "contato@consertatudo.com",
        role: "business",
        memberSince: "2024-11-20",
        plan: "business"
      }
    ];

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Garantir que os usuários default estejam sempre na lista
        const merged = [...defaultUsers];
        parsed.forEach((u: UserProfile) => {
          if (!merged.find(m => m.email === u.email)) {
            merged.push(u);
          }
        });
        return merged;
      } catch (e) {
        return defaultUsers;
      }
    }
    return defaultUsers;
  });

  const [userRole, setUserRole] = useState<UserRole>(user?.role || null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!user);
  const [userPlan, setUserPlan] = useState<string | null>(user?.plan || 'free');

  // Sync current user to individual fields for backward compatibility
  useEffect(() => {
    if (user) {
      localStorage.setItem('sim_currentUser', JSON.stringify(user));
      setUserRole(user.role);
      setIsLoggedIn(true);
      setUserPlan(user.plan || 'free');
    } else {
      localStorage.removeItem('sim_currentUser');
      setUserRole(null);
      setIsLoggedIn(false);
      setUserPlan(null);
    }
  }, [user]);

  // Sync all users
  useEffect(() => {
    localStorage.setItem('sim_allUsers', JSON.stringify(simulatedUsers));
  }, [simulatedUsers]);

  const register = (data: Omit<UserProfile, "id" | "memberSince">) => {
    const existingUser = simulatedUsers.find(
      (u) => u?.email?.toLowerCase() === data?.email?.toLowerCase() && u?.role === data?.role
    );
    const newUser: UserProfile = {
      ...data,
      id: existingUser?.id || `u_${Math.random().toString(36).substr(2, 9)}`,
      memberSince: existingUser?.memberSince || new Date().toISOString(),
      plan: data.plan || 'free',
      avatar: data.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=00C853&color=fff`
    };
    setSimulatedUsers(prev => [
      ...prev.filter(
        (u) => !(u?.email?.toLowerCase() === newUser?.email?.toLowerCase() && u?.role === newUser?.role)
      ),
      newUser
    ]);
    setUser(newUser);
  };

  const login = (email: string, expectedRole?: Exclude<UserRole, null>) => {
    const foundUser = [...simulatedUsers].reverse().find(u =>
      u?.email?.toLowerCase() === email?.toLowerCase() && (!expectedRole || u?.role === expectedRole)
    );
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    // Para facilitar os testes da simulacao sem backend.
    if (email === "ana.costa@email.com" && (!expectedRole || expectedRole === "client")) {
      const mockUser: UserProfile = {
        id: "u_mock_ana",
        name: "Ana Costa",
        email: "ana.costa@email.com",
        role: "client",
        plan: "premium",
        memberSince: "2024-01-15",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop"
      };
      setUser(mockUser);
      return true;
    }
    if (email === "joao.silva@prestador.com" && (!expectedRole || expectedRole === "provider")) {
      const mockProvider: UserProfile = {
        id: "1",
        name: "João Silva",
        email: "joao.silva@prestador.com",
        role: "provider",
        plan: "premium",
        memberSince: "2024-01-10",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop"
      };
      setUser(mockProvider);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      setSimulatedUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
    }
  };

  const resetAllData = () => {
    setUser(null);
    setSimulatedUsers([]);
    localStorage.removeItem('sim_currentUser');
    localStorage.removeItem('sim_allUsers');
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      userRole, 
      isLoggedIn, 
      userPlan, 
      register, 
      login, 
      logout,
      updateProfile,
      resetAllData
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

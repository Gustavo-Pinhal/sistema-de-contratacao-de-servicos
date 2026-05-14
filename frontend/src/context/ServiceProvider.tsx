"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useUser } from "./UserContext";

// Interfaces baseadas no que o seu backend retorna/espera
export interface ServiceRequest {
  id: string;
  prestador: { id: string; nome: string };
  endereco: string;
  data: string;
  status: string;
  descricao?: string;
}

interface ServiceContextType {
  serviceRequests: ServiceRequest[];
  loading: boolean;
  refreshServices: () => Promise<void>;
  addChatMessage: (requestId: string, message: string) => Promise<boolean>;
  updateRequestStatus: (id: string, status: string) => Promise<boolean>;
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost";

export function ServiceProvider({ children }: { children: ReactNode }) {
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  // 1. Carregar Serviços da API (Substitui o LocalStorage)
  const refreshServices = useCallback(async () => {
    if (!user?.token) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/cliente/servicos?apenasAtivos=true`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setServiceRequests(data);
      }
    } catch (error) {
      console.error("Erro ao buscar serviços:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  // Carregar ao montar o componente ou mudar o usuário
  useEffect(() => {
    refreshServices();
  }, [refreshServices]);

  // 2. Enviar Mensagem via API
  const addChatMessage = useCallback(
    async (requestId: string, message: string) => {
      if (!user?.token) return false;

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/servicos/${requestId}/mensagens`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${user.token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ mensagem: message }),
          },
        );

        if (response.ok) {
          // Opcional: Atualizar localmente ou dar refresh
          return true;
        }
        return false;
      } catch (error) {
        return false;
      }
    },
    [user?.token],
  );

  // 3. Atualizar Status via API
  const updateRequestStatus = useCallback(
    async (id: string, status: string) => {
      if (!user?.token) return false;

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/servicos/${id}/status`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${user.token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status }),
          },
        );

        if (response.ok) {
          await refreshServices(); // Recarrega a lista para refletir o novo status
          return true;
        }
        return false;
      } catch (error) {
        return false;
      }
    },
    [user?.token, refreshServices],
  );

  return (
    <ServiceContext.Provider
      value={{
        serviceRequests,
        loading,
        refreshServices,
        addChatMessage,
        updateRequestStatus,
      }}
    >
      {children}
    </ServiceContext.Provider>
  );
}

export function useService() {
  const context = useContext(ServiceContext);
  if (context === undefined) {
    throw new Error("useService deve ser usado dentro de um ServiceProvider");
  }
  return context;
}

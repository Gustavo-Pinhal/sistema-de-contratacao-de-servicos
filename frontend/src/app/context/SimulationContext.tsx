import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { ServiceRequest, ChatMessage, mockServiceRequests } from "../data/mockData";

interface SimulationContextType {
  serviceRequests: ServiceRequest[];
  addServiceRequest: (request: Omit<ServiceRequest, "id" | "createdAt" | "status" | "messages"> & { clientId: string }) => string;
  updateRequestStatus: (id: string, status: ServiceRequest["status"]) => void;
  addChatMessage: (requestId: string, sender: "client" | "provider", message: string) => void;
  markMessagesAsRead: (requestId: string, viewer: "client" | "provider") => void;
  updateProposedValue: (requestId: string, value: string) => void;
  resetSimulation: () => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>(() => {
    // Tentar carregar do localStorage (chave usada pelo ReviewService)
    const saved = localStorage.getItem("serviceRequests");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        console.log('DEBUG - SimulationContext - Carregando serviços do localStorage:', parsed);
        return parsed;
      } catch (e) {
        console.log('DEBUG - SimulationContext - Erro ao carregar, tentando chave antiga');
      }
    }
    
    // Fallback para chave antiga
    const oldSaved = localStorage.getItem("sim_serviceRequests");
    if (oldSaved) {
      try {
        return JSON.parse(oldSaved);
      } catch (e) {
        return [];
      }
    }
    
    console.log('DEBUG - SimulationContext - Nenhum serviço encontrado, iniciando vazio');
    return [];
  });

  // Persist to localStorage (usar chave consistente com ReviewService)
  useEffect(() => {
    const currentStored = localStorage.getItem("serviceRequests");
    const currentData = currentStored ? JSON.parse(currentStored) : [];
    
    console.log('DEBUG - SimulationContext - Dados atuais no localStorage:', currentData);
    console.log('DEBUG - SimulationContext - Novos dados a serem salvos:', serviceRequests);
    
    if (JSON.stringify(currentData) !== JSON.stringify(serviceRequests)) {
      localStorage.setItem("serviceRequests", JSON.stringify(serviceRequests));
      console.log('DEBUG - SimulationContext - Dados diferentes, salvando no localStorage');
    } else {
      console.log('DEBUG - SimulationContext - Dados iguais, não salvando');
    }
  }, [serviceRequests]);

  const addServiceRequest = (request: Omit<ServiceRequest, "id" | "createdAt" | "status" | "messages"> & { clientId: string }) => {
    const newId = `req_${Math.random().toString(36).substr(2, 9)}`;
    const newRequest: ServiceRequest = {
      ...request,
      id: newId,
      status: "quote",
      createdAt: new Date().toISOString(),
      messages: [
        {
          id: `m_${Date.now()}`,
          sender: "client",
          message: request.description,
          timestamp: new Date().toISOString(),
          readByClient: true,
          readByProvider: false
        }
      ]
    };
    setServiceRequests(prev => [newRequest, ...prev]);
    return newId;
  };

  const updateRequestStatus = (id: string, status: ServiceRequest["status"]) => {
    setServiceRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status, completedAt: status === 'completed' ? new Date().toISOString() : req.completedAt } : req
    ));
  };

  const addChatMessage = (requestId: string, sender: "client" | "provider", message: string) => {
    setServiceRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        const newMessage: ChatMessage = {
          id: `m_${Date.now()}`,
          sender,
          message,
          timestamp: new Date().toISOString(),
          read: false,
          readByClient: sender === "client",
          readByProvider: sender === "provider"
        };
        return { ...req, messages: [...req.messages, newMessage] };
      }
      return req;
    }));
  };

  const markMessagesAsRead = (requestId: string, viewer: "client" | "provider") => {
    setServiceRequests(prev => {
      let changed = false;
      const next = prev.map(req => {
        if (req.id !== requestId) return req;

        const messages = req.messages.map(msg => {
          if (msg.sender === viewer) return msg;
          if (viewer === "client") {
            if (msg.readByClient) return msg;
            changed = true;
            return { ...msg, readByClient: true, read: true };
          }
          if (msg.readByProvider) return msg;
          changed = true;
          return { ...msg, readByProvider: true, read: true };
        });

        return changed ? { ...req, messages } : req;
      });

      return changed ? next : prev;
    });
  };

  const updateProposedValue = (requestId: string, value: string) => {
    setServiceRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          proposedValue: value,
          quoteDetails: req.quoteDetails ? { ...req.quoteDetails, value } : {
            id: `q_${Date.now()}`,
            serviceRequestId: requestId,
            value,
            description: "Proposta atualizada",
            includedItems: [],
            estimatedDuration: "A definir",
            validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString()
          }
        };
      }
      return req;
    }));
  };

  const resetSimulation = () => {
    setServiceRequests([]);
    localStorage.removeItem("serviceRequests");
    localStorage.removeItem("sim_serviceRequests"); // Remover ambas as chaves por segurança
  };

  return (
    <SimulationContext.Provider value={{
      serviceRequests,
      addServiceRequest,
      updateRequestStatus,
      addChatMessage,
      markMessagesAsRead,
      updateProposedValue,
      resetSimulation
    }}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (context === undefined) {
    throw new Error("useSimulation must be used within a SimulationProvider");
  }
  return context;
}

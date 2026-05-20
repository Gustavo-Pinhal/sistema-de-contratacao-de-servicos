"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { EventSourcePolyfill } from "event-source-polyfill";
import { useUser } from "./UserContext";

interface ChatNotification {
  servicoId: string;
  prestadorNome: string;
  unread: number;
  lastMessage: string;
  lastAt: string;
}

interface NotificationContextType {
  notifications: ChatNotification[];
  totalUnread: number;
  markAsRead: (servicoId: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<ChatNotification[]>([]);
  const eventSourcesRef = useRef<Record<string, InstanceType<typeof EventSourcePolyfill>>>({});

  const addUnread = useCallback(
    (servicoId: string, prestadorNome: string, texto: string, at: string) => {
      setNotifications((prev) => {
        const existing = prev.find((n) => n.servicoId === servicoId);
        if (existing) {
          return prev.map((n) =>
            n.servicoId === servicoId
              ? { ...n, unread: n.unread + 1, lastMessage: texto, lastAt: at }
              : n,
          );
        }
        return [
          ...prev,
          { servicoId, prestadorNome, unread: 1, lastMessage: texto, lastAt: at },
        ];
      });
    },
    [],
  );

  const markAsRead = useCallback((servicoId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.servicoId === servicoId ? { ...n, unread: 0 } : n)),
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: 0 })));
  }, []);

  useEffect(() => {
    if (!user?.token) return;

    const isClient =
      user.role === "client" || user.role === "ROLE_CLIENTE";
    const isPrestador =
      user.role === "provider" || user.role === "ROLE_PRESTADOR";

    if (!isClient && !isPrestador) return;

    const endpoint = isClient
      ? "/api/cliente/servicos"
      : "/api/areaprestador/servicos";

    let cancelled = false;

    fetch(endpoint, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((servicos: { id: string; prestador?: { nome: string }; cliente?: { nome: string } }[]) => {
        if (cancelled) return;

        servicos.forEach((s) => {
          fetch(`/api/servico/${s.id}/chat`, {
            headers: { Authorization: `Bearer ${user.token}` },
          })
            .then((r) => (r.ok ? r.json() : null))
            .then((chatData) => {
              if (!chatData || cancelled) return;

              const { topico, mercureToken } = chatData;
              const nomeParceiro =
                s.prestador?.nome ?? s.cliente?.nome ?? "Chat";

              if (eventSourcesRef.current[s.id]) return;

              const hubUrl = `https://localhost/.well-known/mercure?topic=${encodeURIComponent(topico)}`;
              const es = new EventSourcePolyfill(hubUrl, {
                headers: { Authorization: `Bearer ${mercureToken}` },
              });

              es.onmessage = (e: MessageEvent) => {
                const msg = JSON.parse(e.data);
                if (String(msg.enviado_por) === String(user.id)) return;
                addUnread(s.id, nomeParceiro, msg.texto || "Arquivo", msg.enviado_em);
              };

              eventSourcesRef.current[s.id] = es;
            })
            .catch(() => {});
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      Object.values(eventSourcesRef.current).forEach((es) => es.close());
      eventSourcesRef.current = {};
    };
  }, [user?.token, user?.id, user?.role, addUnread]);

  const totalUnread = notifications.reduce((acc, n) => acc + n.unread, 0);

  return (
    <NotificationContext.Provider
      value={{ notifications, totalUnread, markAsRead, clearAll }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error(
      "useNotifications must be used within NotificationProvider",
    );
  return ctx;
}

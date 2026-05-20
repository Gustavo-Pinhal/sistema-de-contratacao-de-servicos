"use client";

import { useEffect, useState, useRef } from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { Loader2, Paperclip } from "lucide-react";
import MessageBubble from "./MessageBubble";
import { ChatMessage } from "./CachedImage";

interface ChatRoomProps {
  serviceId: string;
  token: string;
}

const API_BASE_URL = "https://localhost";

export default function ChatRoom({ serviceId, token }: ChatRoomProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [textInput, setTextInput] = useState("");
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper para identificar de qual lado a bolha deve renderizar
  const checkIsMe = (enviadoPor: any, currentUserId: string | null) => {
    console.log(`enviador por: ${enviadoPor}, eu sou ${currentUserId}`);
    if (!enviadoPor || !currentUserId) return false;
    return (
      String(enviadoPor).toLowerCase() === String(currentUserId).toLowerCase()
    );
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Busca histórico, metadados do Chat e conecta ao Mercure
  useEffect(() => {
    if (!serviceId || !token) return;

    const abortController = new AbortController();

    const startChatSession = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 1. Abre o chat buscando o histórico e credenciais do Mercure
        const res = await fetch(
          `${API_BASE_URL}/api/servico/${serviceId}/chat`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (res.status === 403) {
          setError("Você não tem acesso a esta sala de chat.");
          return;
        }
        if (!res.ok) {
          throw new Error("Falha ao carregar o histórico do chat.");
        }

        const data = await res.json();
        const currentUserId = data.idUsuario;
        setMyUserId(currentUserId);

        // 2. Normaliza e define o histórico inicial calculando o lado correto (isMe)
        const initialHistory = (data.messagens || []).map((m: any) => {
          const enviadopor = m.enviadoPor;
          return {
            id: m.id,
            enviadoPor: m.enviadoPor || m.enviado_por,
            tipo: m.tipo,
            texto: m.texto,
            arquivo: m.arquivo,
            enviadoEm: m.enviadoEm || m.enviado_em,
            isMe: checkIsMe(m.enviadoPor || m.enviado_por, currentUserId),
          };
        });

        setMessages(initialHistory);
        setIsLoading(false);

        // 3. Conecta ao Hub Mercure em tempo real
        await fetchEventSource(
          `${API_BASE_URL}/.well-known/mercure?topic=${encodeURIComponent(data.topico)}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${data.mercureToken}`,
              Accept: "text/event-stream",
            },
            signal: abortController.signal,
            onmessage(ev) {
              const novaMensagem = JSON.parse(ev.data);

              setMessages((prev) => {
                // Bloqueia duplicatas geradas por concorrência de requests
                if (prev.some((m) => m.id === novaMensagem.id)) return prev;

                return [
                  ...prev,
                  {
                    id: novaMensagem.id,
                    enviadoPor:
                      novaMensagem.enviadoPor || novaMensagem.enviado_por,
                    tipo: novaMensagem.tipo,
                    texto: novaMensagem.texto,
                    arquivo: novaMensagem.arquivo,
                    enviadoEm:
                      novaMensagem.enviadoEm || novaMensagem.enviado_em,
                    isMe: checkIsMe(
                      novaMensagem.enviadoPor || novaMensagem.enviado_por,
                      currentUserId,
                    ),
                  },
                ];
              });
            },
            onerror(err) {
              console.error("Erro na conexão streaming (Mercure):", err);
            },
          },
        );
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Erro de conexão com o servidor de chat.");
      } finally {
        setIsLoading(false);
      }
    };

    startChatSession();

    return () => {
      abortController.abort(); // Desconecta o EventSource imediatamente ao fechar a tela
    };
  }, [serviceId, token]);

  // Enviar Mensagem de Texto
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    const payloadText = textInput;
    setTextInput("");

    try {
      await fetch(`${API_BASE_URL}/api/servico/${serviceId}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ texto: payloadText }),
      });
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    }
  };

  // Enviar Arquivo
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await fetch(`${API_BASE_URL}/api/servico/${serviceId}/chat/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
    } catch (error) {
      console.error("Erro no upload do arquivo:", error);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (isLoading) {
    return (
      <div className="h-160 flex flex-col items-center justify-center bg-slate-50 gap-2">
        <Loader2 className="animate-spin text-blue-600 w-6 h-6" />
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Carregando mensagens...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-160 flex items-center justify-center bg-slate-50 p-4">
        <span className="text-sm font-semibold text-red-500 bg-red-50 border border-red-200 px-4 py-3 rounded-2xl">
          {error}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-160 bg-slate-50 border-t border-slate-200">
      {/* Área das Mensagens */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            message={m}
            serviceId={serviceId}
            token={token}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Caixa de Entrada */}
      <div className="p-4 bg-white border-t border-slate-200 rounded-b-3xl">
        <form
          onSubmit={handleSendMessage}
          className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2"
        >
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
            aria-label="Anexar imagem"
          >
            <Paperclip size={20} />
          </button>

          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Escreva sua mensagem..."
            className="flex-1 bg-transparent border-none outline-none font-medium text-sm text-slate-800 placeholder-slate-400 py-2"
          />

          <button
            type="submit"
            disabled={!textInput.trim()}
            className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:bg-slate-300 transition-colors text-xs font-bold uppercase tracking-wider"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}

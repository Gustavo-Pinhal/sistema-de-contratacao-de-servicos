"use client";

import { useState, useEffect, useRef } from "react";
import {
  Loader2,
  User,
  FileIcon,
  Image as ImageIcon,
  Paperclip,
  Send,
} from "lucide-react";
import { useUser } from "@/app/context/UserContext";
import { EventSourcePolyfill } from "event-source-polyfill"; // Importe a biblioteca aqui

interface Message {
  id: string;
  enviado_por: string;
  tipo: "texto" | "arquivo";
  texto: string;
  enviado_em: string;
  arquivo?: {
    url: string;
    mime_type: string;
  } | null;
}

interface ChatData {
  idServico: string;
  mercureToken: string;
  topico: string;
  participantes: {
    cliente: { id: string; nome: string };
    prestador: { id: string; nome: string };
  };
  messagens: Message[];
}

export default function ChatRoom({ serviceId }: { serviceId: string }) {
  const { user } = useUser();
  const [chat, setChat] = useState<ChatData | null>(null);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Carregamento Inicial
  useEffect(() => {
    async function loadChat() {
      if (!user?.token) return;
      try {
        setLoading(true);
        const response = await fetch(
          `https://localhost/api/servico/${serviceId}/chat`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          },
        );
        if (!response.ok) throw new Error("Erro ao abrir chat");
        const data = await response.json();
        setChat(data);
      } catch (error) {
        console.error("Erro ao carregar chat:", error);
      } finally {
        setLoading(false);
      }
    }
    loadChat();
  }, [serviceId, user?.token]);

  // 2. Conexão Real-time corrigida com Polyfill
  useEffect(() => {
    if (!chat?.mercureToken || !chat?.topico) return;

    // Em vez de usar URLSearchParams, vamos montar a string manualmente
    // para garantir que não haja encodes estranhos no início
    const hubUrl = `https://localhost/.well-known/mercure?topic=${encodeURIComponent(chat.topico)}`;

    const eventSource = new EventSourcePolyfill(hubUrl, {
      headers: {
        Authorization: `Bearer ${chat.mercureToken}`,
      },
      // O polyfill as vezes precisa disso para cross-origin
      withCredentials: false,
    });

    eventSource.onopen = () => console.log("✅ Mercure Conectado!");

    eventSource.onmessage = (e) => {
      const newMessage = JSON.parse(e.data);
      setChat((prev) => {
        if (!prev || prev.messagens.some((m) => m.id === newMessage.id))
          return prev;
        return { ...prev, messagens: [...prev.messagens, newMessage] };
      });
    };

    eventSource.onerror = (err: any) => {
      // Verifique o console.log aqui embaixo:
      console.error("Erro detalhado Mercure:", err.status, err.message);
    };

    return () => eventSource.close();
  }, [chat?.mercureToken, chat?.topico]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat?.messagens]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending || !user?.token) return;

    setSending(true);
    try {
      const response = await fetch(
        `https://localhost/api/servico/${serviceId}/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ texto: input }),
        },
      );

      if (response.ok) {
        setInput("");
      }
    } catch (error) {
      console.error("Erro ao enviar:", error);
    } finally {
      setSending(false);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-[600px] bg-slate-50 rounded-3xl border border-slate-200">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Iniciando conexão segura...
        </p>
      </div>
    );

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-200">
            <User size={20} className="text-slate-400" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-green-600 leading-none mb-1">
              • Online
            </p>
            <h3 className="font-bold text-slate-900 italic">
              {user?.id === chat?.participantes.cliente.id
                ? chat?.participantes.prestador.nome
                : chat?.participantes.cliente.nome}
            </h3>
          </div>
        </div>
      </div>

      {/* Área de Mensagens */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30"
      >
        {chat?.messagens.map((msg) => {
          // Comparação robusta de ID
          const isMe = String(msg.enviado_por) === String(user?.id);
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl p-4 shadow-sm ${
                  isMe
                    ? "bg-slate-900 text-white rounded-tr-none"
                    : "bg-white text-slate-800 border border-slate-100 rounded-tl-none"
                }`}
              >
                {msg.tipo === "texto" ? (
                  <p className="text-sm font-bold leading-relaxed">
                    {msg.texto}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {msg.arquivo?.mime_type.startsWith("image/") ? (
                      <img
                        src={msg.arquivo.url}
                        className="rounded-lg max-w-full h-auto"
                        alt="Anexo"
                      />
                    ) : (
                      <a
                        href={msg.arquivo?.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs font-bold underline"
                      >
                        <FileIcon size={14} /> Baixar Arquivo
                      </a>
                    )}
                  </div>
                )}
                <p
                  className={`text-[9px] mt-2 font-black uppercase tracking-tighter opacity-40 ${
                    isMe ? "text-right" : "text-left"
                  }`}
                >
                  {msg.enviado_em}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input de Envio */}
      <form
        onSubmit={handleSendMessage}
        className="p-4 bg-white border-t border-slate-100"
      >
        <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-2xl border-2 border-transparent focus-within:border-slate-900 focus-within:bg-white transition-all">
          <button
            type="button"
            className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
          >
            <Paperclip size={20} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Sua mensagem..."
            className="flex-1 bg-transparent border-none outline-none text-sm font-bold py-2 text-slate-700"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="bg-slate-900 text-white p-3 rounded-xl hover:bg-blue-600 transition-all disabled:opacity-20"
          >
            {sending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

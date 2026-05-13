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
  participantes: {
    cliente: { id: string; nome: string };
    prestador: { id: string; nome: string };
  };
  messagens: Message[];
}

interface ChatRoomProps {
  serviceId: string;
}

export default function ChatRoom({ serviceId }: ChatRoomProps) {
  const { user } = useUser();
  const [chat, setChat] = useState<ChatData | null>(null);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadChat();
  }, [serviceId, user?.token]);

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
          body: JSON.stringify({
            texto: input,
          }),
        },
      );

      if (response.ok) {
        setInput("");
        // Como o Mercure ainda não está ativo, você pode descomentar
        // o bloco abaixo para ver a mensagem aparecer na hora localmente:
        /*
        const newMessage: Message = {
            id: Math.random().toString(),
            enviado_por: user.id,
            tipo: "texto",
            texto: input,
            enviado_em: new Date().toLocaleTimeString(),
            arquivo: null
        };
        setChat(prev => prev ? { ...prev, messagens: [...prev.messagens, newMessage] } : null);
        */
      }
    } catch (error) {
      alert("Erro ao enviar mensagem");
    } finally {
      setSending(false);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-[600px] bg-slate-50 rounded-3xl border border-slate-200">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Sincronizando...
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
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">
              Conversando com
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
          const isMe = msg.enviado_por === user?.id;
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
                {msg.tipo === "texto" && (
                  <p className="text-sm font-bold leading-relaxed">
                    {msg.texto}
                  </p>
                )}
                <p
                  className={`text-[9px] mt-2 font-black uppercase tracking-tighter opacity-40 ${isMe ? "text-right" : "text-left"}`}
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
            className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-slate-700 py-2"
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

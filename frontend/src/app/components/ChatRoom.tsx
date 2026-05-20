"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, User, FileIcon, Paperclip, Send, CheckCheck } from "lucide-react";
import { EventSourcePolyfill } from "event-source-polyfill";
import { useUser } from "@/context/UserContext";
import { useNotifications } from "@/context/NotificationContext";

interface Message {
  id: string;
  enviado_por: string;
  tipo: "texto" | "arquivo";
  texto: string;
  enviado_em: string;
  arquivo?: { url: string; mime_type: string } | null;
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
  const { markAsRead } = useNotifications();
  const [chat, setChat] = useState<ChatData | null>(null);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    if (!user?.token) return;

    const controller = new AbortController();

    async function loadChat() {
      try {
        setLoading(true);
        const response = await fetch(
          `https://localhost/api/servico/${serviceId}/chat`,
          {
            headers: { Authorization: `Bearer ${user?.token}` },
            signal: controller.signal,
          },
        );
        if (!response.ok) throw new Error("Falha ao carregar chat");
        const data = await response.json();
        setChat(data);
      } catch (error: any) {
        if (error.name !== "AbortError") console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadChat();
    return () => controller.abort();
  }, [serviceId, user?.token]);

  useEffect(() => {
    markAsRead(serviceId);
  }, [serviceId, markAsRead]);

  useEffect(() => {
    if (!chat?.mercureToken || !chat?.topico) return;

    const hubUrl = `https://localhost/.well-known/mercure?topic=${encodeURIComponent(chat.topico)}`;
    const eventSource = new EventSourcePolyfill(hubUrl, {
      headers: { Authorization: `Bearer ${chat.mercureToken}` },
    });

    eventSource.onmessage = (e: any) => {
      const newMessage = JSON.parse(e.data);
      setChat((prev) => {
        if (!prev || prev.messagens.some((m) => m.id === newMessage.id))
          return prev;
        return { ...prev, messagens: [...prev.messagens, newMessage] };
      });
    };

    return () => eventSource.close();
  }, [chat?.mercureToken, chat?.topico]);

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messagens, scrollToBottom]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const messageText = input.trim();
    if (!messageText || sending || !user?.token) return;

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
          body: JSON.stringify({ texto: messageText }),
        },
      );

      if (response.ok) setInput("");
    } catch (error) {
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.token) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(
        `https://localhost/api/servico/${serviceId}/chat/upload`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${user.token}` },
          body: formData,
        },
      );

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("Erro no upload:", res.status, text.slice(0, 300));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] bg-slate-50 rounded-3xl border border-slate-200">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Sincronizando
        </span>
      </div>
    );
  }

  const interlocutor =
    user?.id === chat?.participantes.cliente.id
      ? chat?.participantes.prestador.nome
      : chat?.participantes.cliente.nome;

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <header className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-200 text-slate-400">
          <User size={20} />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-green-600 leading-none mb-1">
            • Online
          </p>
          <h3 className="font-bold text-slate-900 italic">{interlocutor}</h3>
        </div>
      </header>

      <main
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30"
      >
        {chat?.messagens.map((msg) => {
          const isMe = String(msg.enviado_por) === String(user?.id);
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl p-4 shadow-sm ${isMe ? "bg-slate-900 text-white rounded-tr-none" : "bg-white text-slate-800 border border-slate-100 rounded-tl-none"}`}
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
                        <FileIcon size={14} /> Arquivo
                      </a>
                    )}
                  </div>
                )}
                <div className={`flex items-center gap-1 mt-2 ${isMe ? "justify-end" : "justify-start"}`}>
                  <span className="text-[9px] font-black uppercase tracking-tighter opacity-40">
                    {msg.enviado_em}
                  </span>
                  {isMe && (
                    <CheckCheck size={12} className="opacity-60 text-blue-400" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </main>

      <footer className="p-4 bg-white border-t border-slate-100">
        <form
          onSubmit={handleSendMessage}
          className="flex items-center gap-2 bg-slate-100 p-2 rounded-2xl border-2 border-transparent focus-within:border-slate-900 focus-within:bg-white transition-all"
        >
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="p-2 text-slate-400 hover:text-slate-900 transition-colors disabled:opacity-40"
          >
            {uploading ? <Loader2 size={20} className="animate-spin" /> : <Paperclip size={20} />}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={handleFileUpload}
          />
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
        </form>
      </footer>
    </div>
  );
}

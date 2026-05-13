"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Paperclip, Loader2, FileIcon, AlertCircle } from "lucide-react";
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

interface ChatRoomProps {
  serviceId: string;
}

export default function ChatRoom({ serviceId }: ChatRoomProps) {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // 1. Carregar Histórico e Conectar Mercure
  useEffect(() => {
    async function initChat() {
      if (!user?.token) return;

      try {
        setLoading(true);
        // GET Histórico e credenciais Mercure
        const response = await fetch(
          `https://localhost/api/servico/${serviceId}/chat`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          },
        );

        if (!response.ok) throw new Error("Falha ao carregar histórico");

        const data = await response.json();

        // Ajustado para 'messagens' conforme sua documentação
        if (data.messagens) setMessages(data.messagens);

        // Conexão Real-time (Mercure)
        const url = new URL("https://localhost/.well-known/mercure");
        url.searchParams.append("topic", data.topico);

        // Para o Mercure funcionar com Authorization Bearer via EventSource:
        // Se o hub não aceitar token na URL, o seu backend deve setar um Cookie
        // chamado 'mercureAuthorization' antes desta chamada.
        eventSourceRef.current = new EventSource(url.toString(), {
          withCredentials: true,
        });

        eventSourceRef.current.onmessage = (event) => {
          const newMessage = JSON.parse(event.data);
          setMessages((prev) => {
            // Evita duplicatas (mensagens enviadas por mim que o hub ecoa)
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        };

        eventSourceRef.current.onerror = () => {
          console.error("Erro na conexão Mercure. Tentando reconectar...");
        };
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    initChat();

    return () => {
      eventSourceRef.current?.close();
    };
  }, [serviceId, user?.token]);

  // Scroll automático
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  // 2. Enviar Mensagem de Texto
  const handleSendText = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || sending || !user?.token) return;

    const currentText = input;
    setInput(""); // Limpa campo otimisticamente
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
          body: JSON.stringify({ texto: currentText }),
        },
      );

      if (!response.ok) throw new Error();
    } catch (err) {
      setInput(currentText); // Devolve o texto em caso de erro
      alert("Não foi possível enviar a mensagem.");
    } finally {
      setSending(false);
    }
  };

  // 3. Enviar Arquivo ou Imagem
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.token) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setSending(true);
      const response = await fetch(
        `https://localhost/api/servico/${serviceId}/chat/upload`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${user.token}` },
          body: formData,
        },
      );

      if (!response.ok) throw new Error();
      // O hub enviará a mensagem de arquivo via EventSource,
      // então não precisamos adicionar manualmente ao state aqui.
    } catch (err) {
      alert("Erro ao enviar arquivo.");
    } finally {
      setSending(false);
      e.target.value = ""; // Reseta o input de arquivo
    }
  };

  if (loading)
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 rounded-3xl">
        <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
        <p className="text-xs font-black uppercase tracking-tighter text-slate-400">
          Carregando Chat...
        </p>
      </div>
    );

  if (error)
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="text-red-500 mb-2" size={32} />
        <p className="text-sm font-bold text-slate-600">{error}</p>
      </div>
    );

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
      {/* Header */}
      <div className="p-4 border-b bg-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs font-black uppercase tracking-widest text-slate-900">
            Chat Operacional
          </span>
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
          Mercure Ativo
        </span>
      </div>

      {/* Messages List */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50"
      >
        {messages.map((msg) => {
          const isMe = msg.enviado_por === user?.id;
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] p-4 rounded-2xl shadow-sm border ${
                  isMe
                    ? "bg-slate-900 text-white border-slate-800 rounded-br-none"
                    : "bg-white text-slate-800 border-slate-200 rounded-bl-none"
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
                        alt="Anexo"
                        className="rounded-lg max-h-72 w-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(msg.arquivo?.url, "_blank")}
                      />
                    ) : (
                      <a
                        href={msg.arquivo?.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 p-3 bg-black/5 rounded-xl border border-black/10 hover:bg-black/10 transition-colors"
                      >
                        <FileIcon
                          size={24}
                          className={isMe ? "text-blue-300" : "text-blue-600"}
                        />
                        <div className="text-left">
                          <p className="text-[10px] font-black uppercase opacity-60">
                            Arquivo anexado
                          </p>
                          <p className="text-xs font-bold underline truncate max-w-[150px]">
                            Ver Documento
                          </p>
                        </div>
                      </a>
                    )}
                  </div>
                )}
                <span
                  className={`text-[9px] font-black uppercase mt-2 block opacity-50 ${isMe ? "text-right" : "text-left"}`}
                >
                  {msg.enviado_em}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSendText}
        className="p-4 bg-white border-t border-slate-100"
      >
        <div className="flex items-center gap-3 bg-slate-100 p-2 rounded-2xl border-2 border-transparent focus-within:border-slate-900 focus-within:bg-white transition-all">
          <label className="p-2 text-slate-400 hover:text-slate-900 cursor-pointer transition-colors">
            <Paperclip size={22} />
            <input
              type="file"
              className="hidden"
              onChange={handleUpload}
              disabled={sending}
            />
          </label>

          <input
            type="text"
            placeholder="Digite sua mensagem..."
            className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-slate-700 py-2"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={sending}
          />

          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="bg-slate-900 text-white p-3 rounded-xl hover:bg-blue-600 transition-all disabled:opacity-30 disabled:hover:bg-slate-900"
          >
            {sending ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import {
  Send,
  Paperclip,
  Loader2,
  ImageIcon,
  Download,
  FileText,
} from "lucide-react";
import { EventSourcePolyfill } from "event-source-polyfill";
import { useUser } from "@/context/UserContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost";

interface FileMetadata {
  id: string;
  mime_type: string;
}

interface Message {
  id: string;
  enviado_por: string;
  tipo: "texto" | "arquivo";
  texto: string | null;
  enviado_em: string;
  arquivo: FileMetadata | null;
}

interface ChatRoomProps {
  serviceId: string;
  initialMessages: Message[];
  topic: string;
  mercureToken: string;
}

export default function ChatRoom({
  serviceId,
  initialMessages,
  topic,
  mercureToken,
}: ChatRoomProps) {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Cache de URLs assinadas para exibição de imagens e downloads
  const [resolvedUrls, setResolvedUrls] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 1. Escuta em Tempo Real (Mercure Hub via Server-Sent Events)
  useEffect(() => {
    scrollToBottom();

    const hubUrl = new URL(`${API_BASE_URL}/.well-known/mercure`);
    hubUrl.searchParams.append("topic", topic);

    const eventSource = new EventSourcePolyfill(hubUrl.toString(), {
      headers: { Authorization: `Bearer ${mercureToken}` },
    });

    eventSource.onmessage = (event: MessageEvent) => {
      try {
        const newMessage: Message = JSON.parse(event.data);
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });
      } catch (err) {
        console.error("Erro no parse SSE:", err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [topic, mercureToken]);

  // 2. Pre-fetch automático de links assinados exclusivo para Imagens
  useEffect(() => {
    messages.forEach((msg) => {
      if (
        msg.tipo === "arquivo" &&
        msg.arquivo &&
        msg.arquivo.mime_type.startsWith("image/")
      ) {
        if (!resolvedUrls[msg.arquivo.id]) {
          fetchPresignedUrl(msg.arquivo.id);
        }
      }
    });
    scrollToBottom();
  }, [messages]);

  const fetchPresignedUrl = async (
    arquivoId: string,
  ): Promise<string | null> => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/servico/${serviceId}/chat/${arquivoId}/download`,
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        },
      );
      if (!res.ok) return null;
      const data = await res.json();

      setResolvedUrls((prev) => ({ ...prev, [arquivoId]: data.url }));
      return data.url;
    } catch (err) {
      console.error("Erro ao obter URL assinada:", err);
      return null;
    }
  };

  const handleDownload = async (arquivoId: string) => {
    let url = resolvedUrls[arquivoId];
    if (!url) {
      url = (await fetchPresignedUrl(arquivoId)) || "";
    }
    if (url) {
      window.open(url, "_blank");
    }
  };

  // 3. Enviar Mensagem de Texto
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/servico/${serviceId}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ texto: inputText }),
      });

      if (res.ok) {
        setInputText("");
      }
    } catch (err) {
      console.error("Erro ao transmitir texto:", err);
    } finally {
      setSending(false);
    }
  };

  // 4. Enviar Upload de Arquivo / Imagem Corrigido
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);

    try {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file); // Chave mapeada conforme a documentação da API

      const res = await fetch(
        `${API_BASE_URL}/api/servico/${serviceId}/chat/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user?.token}`,
            // ATENÇÃO: NÃO definir Content-Type manual aqui! O navegador precisa gerar o boundary automaticamente.
          },
          body: formData,
        },
      );

      if (!res.ok) throw new Error("Erro no envio do arquivo ao servidor.");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Falha no upload.");
    } finally {
      setUploading(false);
      e.target.value = ""; // Reseta o input de arquivo
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Timeline de Conversa */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => {
          // Correção da checagem: Garante que ambos os IDs existem e são válidos antes de testar igualdade
          const isMe = Boolean(
            user?.id && msg.enviado_por && msg.enviado_por === user.id,
          );
          const isImage = msg.arquivo?.mime_type.startsWith("image/");

          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"} animate-in fade-in-50 duration-200`}
            >
              <div
                className={`max-w-[70%] rounded-2xl p-4 shadow-sm ${
                  isMe
                    ? "bg-slate-900 text-white rounded-br-none"
                    : "bg-white text-slate-800 rounded-bl-none border border-slate-100"
                }`}
              >
                {msg.tipo === "texto" ? (
                  <p className="text-sm font-medium leading-relaxed break-words">
                    {msg.texto}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {isImage ? (
                      <div className="rounded-xl overflow-hidden min-w-[200px] min-h-[120px] bg-slate-100/50 flex items-center justify-center border border-slate-200/40">
                        {msg.arquivo && resolvedUrls[msg.arquivo.id] ? (
                          <img
                            src={resolvedUrls[msg.arquivo.id]}
                            alt="Mídia"
                            className="w-full h-auto max-h-64 object-cover cursor-pointer"
                            onClick={() => msg.arquivo && handleDownload(msg.arquivo.id)}
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
                            <ImageIcon size={16} /> Carregando Imagem...
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => msg.arquivo && handleDownload(msg.arquivo.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl text-left border transition-all w-full ${
                          isMe
                            ? "bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <FileText
                          size={20}
                          className="text-blue-500 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black truncate uppercase tracking-wider">
                            Arquivo Anexo
                          </p>
                          <p className="text-[9px] opacity-60 font-mono truncate">
                            {msg.arquivo?.mime_type}
                          </p>
                        </div>
                        <Download
                          size={16}
                          className="text-slate-400 shrink-0"
                        />
                      </button>
                    )}
                  </div>
                )}

                <span className="block text-[9px] font-black uppercase tracking-tight mt-2 text-right opacity-40">
                  {msg.enviado_em}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de Mensagem e Arquivo */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form
          onSubmit={handleSendMessage}
          className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 focus-within:border-blue-500 focus-within:bg-white transition-all"
        >
          <label className="cursor-pointer p-2 text-slate-400 hover:text-slate-600 transition-colors shrink-0">
            {uploading ? (
              <Loader2 className="animate-spin text-blue-600" size={20} />
            ) : (
              <Paperclip size={20} />
            )}
            <input
              type="file"
              className="hidden"
              disabled={uploading}
              onChange={handleFileUpload}
              accept="image/*,application/pdf"
            />
          </label>

          <input
            type="text"
            placeholder="Escreva sua mensagem..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={sending}
            maxLength={512}
            className="flex-1 bg-transparent border-none outline-none font-bold text-sm text-slate-800 placeholder-slate-400 py-2"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || sending}
            className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-20 disabled:hover:bg-slate-900 shrink-0"
          >
            {sending ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Send size={16} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

import CachedImage, { ChatMessage } from "./CachedImage";

interface MessageBubbleProps {
  message: ChatMessage;
  serviceId: string;
  token: string;
}

export default function MessageBubble({
  message,
  serviceId,
  token,
}: MessageBubbleProps) {
  const mimeType =
    message.arquivo?.mimeType || message.arquivo?.mime_type || "";

  // 💡 Correção aqui: Aceita se o tipo for explicitamente "foto" OU se for "arquivo" com mime de imagem
  const isImage =
    message.tipo === "foto" ||
    (message.tipo === "arquivo" && mimeType.toLowerCase().startsWith("image/"));

  return (
    <div
      className={`flex w-full ${message.isMe ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`flex flex-col gap-1 max-w-[75%] ${message.isMe ? "items-end" : "items-start"}`}
      >
        <div
          className={`px-4 py-3 rounded-2xl ${
            message.isMe
              ? "bg-blue-600 text-white rounded-tr-sm"
              : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm"
          }`}
        >
          {message.tipo === "texto" && (
            <p className="text-sm whitespace-pre-wrap">{message.texto}</p>
          )}

          {isImage && message.arquivo && (
            <CachedImage
              serviceId={serviceId}
              messageId={message.arquivo.id}
              token={token}
            />
          )}
        </div>
        <span className="text-xs text-slate-400 px-1">{message.enviadoEm}</span>
      </div>
    </div>
  );
}

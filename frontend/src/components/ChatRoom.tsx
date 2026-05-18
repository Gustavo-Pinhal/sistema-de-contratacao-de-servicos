"use client";

import MessageBubble, { Message } from "./MessageBubble";

interface ChatRoomProps {
  serviceId?: string;
  [key: string]: any;
}

export default function ChatRoom({ serviceId }: ChatRoomProps) {
  const fakeMessages: Message[] = [
    {
      id: "1",
      sender: "Alice",
      text: "Olá, como posso ajudar?",
      time: "10:02",
      isMe: false,
    },
    {
      id: "2",
      sender: "Você",
      text: "Preciso de um orçamento.",
      time: "10:03",
      isMe: true,
    },
    {
      id: "3",
      sender: "Alice",
      text: "Claro — vou preparar os detalhes.",
      time: "10:04",
      isMe: false,
    },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {fakeMessages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        <form className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2">
          <input
            type="text"
            placeholder="Escreva sua mensagem..."
            readOnly
            className="flex-1 bg-transparent border-none outline-none font-bold text-sm text-slate-800 placeholder-slate-400 py-2"
          />
          <button
            type="button"
            aria-label={
              serviceId
                ? `Enviar mensagem para serviço ${serviceId}`
                : "Enviar mensagem"
            }
            className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-colors"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}

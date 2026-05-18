"use client";

export type Message = {
  id: string;
  sender: string;
  text: string;
  time: string;
  isMe?: boolean;
};

export default function MessageBubble({ message }: { message: Message }) {
  return (
    <div className={`flex ${message.isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] rounded-2xl p-4 shadow-sm ${
          message.isMe
            ? "bg-blue-600 text-white"
            : "bg-white text-slate-800 border border-slate-100"
        }`}
      >
        <p className="text-sm font-medium leading-relaxed wrap-break-words">
          {message.text}
        </p>
        <span className="block text-[9px] font-black uppercase tracking-tight mt-2 text-right opacity-40">
          {message.time}
        </span>
      </div>
    </div>
  );
}

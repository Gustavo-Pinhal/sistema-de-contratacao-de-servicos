import { useState } from "react";
import { Link } from "react-router";
import { Send, User, Search, Filter, MoreVertical, Phone, Video, Info, ArrowLeft, CheckCircle2 } from "lucide-react";
import { mockProviders } from "../data/mockData";

export function Chat() {
  const [activeChat, setActiveChat] = useState(mockProviders[0]);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'provider', text: "Olá! Como posso ajudar você hoje?", time: "09:30" },
    { id: 2, sender: 'me', text: "Bom dia! Gostaria de um orçamento para uma fiação elétrica.", time: "09:32" },
    { id: 3, sender: 'provider', text: "Claro! Pode me enviar algumas fotos do local?", time: "09:33" },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg = {
      id: messages.length + 1,
      sender: 'me',
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, msg]);
    setNewMessage("");

    // Resposta automática simulada
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        sender: 'provider',
        text: "Entendido. Vou analisar e já te respondo!",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1500);
  };

  return (
    <div className="flex h-[calc(100vh-140px)] bg-white overflow-hidden -m-4 md:-m-8">
      {/* Sidebar - Chat List */}
      <div className="w-full md:w-80 border-r flex flex-col bg-gray-50/50">
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-black text-gray-900">Mensagens</h1>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Filter className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar conversas..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {mockProviders.map((provider) => (
            <div 
              key={provider.id}
              onClick={() => setActiveChat(provider)}
              className={`p-4 flex items-center gap-3 cursor-pointer transition-colors border-b border-gray-100/50 ${activeChat.id === provider.id ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
            >
              <div className="relative">
                <img src={provider.avatar} alt={provider.name} className="w-12 h-12 rounded-full object-cover" />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-0.5">
                  <h3 className="font-bold text-gray-900 text-sm truncate">{provider.name}</h3>
                  <span className="text-[10px] text-gray-400 font-medium">12:30</span>
                </div>
                <p className="text-xs text-gray-500 truncate">{provider.specialty}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="hidden md:flex flex-1 flex-col bg-white">
        {/* Chat Header */}
        <div className="p-4 border-b flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-3">
            <Link to="/search" className="md:hidden">
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </Link>
            <div className="relative">
              <img src={activeChat.avatar} alt={activeChat.name} className="w-10 h-10 rounded-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-bold text-gray-900 leading-none">{activeChat.name}</h2>
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Online agora</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Phone className="w-5 h-5" /></button>
            <button className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Video className="w-5 h-5" /></button>
            <button className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Info className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Messages Layout */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] rounded-2xl p-4 shadow-sm ${
                msg.sender === 'me' 
                  ? 'bg-red-500 text-white rounded-tr-none' 
                  : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
              }`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <p className={`text-[10px] mt-1.5 font-medium ${msg.sender === 'me' ? 'text-red-100' : 'text-gray-400'}`}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t bg-white">
          <form onSubmit={handleSendMessage} className="flex items-center gap-3 bg-gray-100 rounded-full px-4 py-2 px-1 focus-within:ring-2 focus-within:ring-red-500 transition-all">
            <button type="button" className="p-2 text-gray-400 hover:text-gray-600"><MoreVertical className="w-5 h-5" /></button>
            <input 
              type="text" 
              placeholder="Escreva sua mensagem..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button 
              type="submit"
              className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-md shadow-red-100"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

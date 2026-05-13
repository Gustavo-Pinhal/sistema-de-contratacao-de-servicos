"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  MessageSquare,
  Clock,
  MapPin,
  User,
  FileText,
  CheckCircle2,
  Send,
  Paperclip,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";

export default function ServiceTrackingPage() {
  const params = useParams();
  const serviceId = params.id;

  // DADOS FAKES PARA VISUALIZAÇÃO
  const [service] = useState({
    id: serviceId,
    status: "quote", // or 'active', 'completed'
    description:
      "Reparo no quadro elétrico e troca de fiação da cozinha que está em curto.",
    createdAt: "2024-05-20T10:30:00",
    proposedValue: "R$ 450,00",
    address: "Rua das Flores, 123 - Centro",
    provider: {
      name: "João Eletricista",
      avatar:
        "https://ui-avatars.com/api/?name=Joao+Eletricista&background=0D8ABC&color=fff",
      specialty: "Eletricista Residencial",
    },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header de Navegação */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/search"
            className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900 transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="text-xs uppercase tracking-widest">Voltar</span>
          </Link>
          <div className="text-center">
            <span className="block text-[10px] font-black uppercase text-slate-400 tracking-tighter">
              Protocolo do Serviço
            </span>
            <span className="block text-xs font-mono font-bold text-slate-600">
              #{serviceId?.toString().slice(0, 8)}
            </span>
          </div>
          <div className="w-10"></div> {/* Spacer */}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna da Esquerda: Detalhes do Serviço */}
        <div className="lg:col-span-1 space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                <Clock className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Status Atual
                </h2>
                <span className="text-lg font-black text-blue-600 uppercase tracking-tight">
                  Em Orçamento
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2"></div>
                <p className="text-sm font-medium text-slate-600">
                  O prestador está analisando sua solicitação.
                </p>
              </div>
            </div>
          </div>

          {/* Provider Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
              Prestador Responsável
            </h2>
            <div className="flex items-center gap-4 mb-4">
              <img
                src={service.provider.avatar}
                className="w-14 h-14 rounded-2xl object-cover shadow-md"
                alt=""
              />
              <div>
                <h3 className="font-black text-slate-900 leading-none">
                  {service.provider.name}
                </h3>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                  {service.provider.specialty}
                </span>
              </div>
            </div>
            <button className="w-full py-3 border-2 border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all">
              Ver Perfil Completo
            </button>
          </div>

          {/* Details Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
                <FileText size={12} /> Descrição
              </h2>
              <p className="text-sm font-bold text-slate-700 leading-relaxed">
                {service.description}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-50">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
                <MapPin size={12} /> Local do Serviço
              </h2>
              <p className="text-sm font-bold text-slate-700">
                {service.address}
              </p>
            </div>
          </div>
        </div>

        {/* Coluna da Direita: Área do Chat (Visual Only) */}
        <div className="lg:col-span-2 flex flex-col h-[600px] lg:h-[750px] bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-100 bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs font-black uppercase tracking-widest text-slate-900">
                Chat com Prestador
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-400">
              Responde geralmente em 15 min
            </span>
          </div>

          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
            {/* System Message */}
            <div className="flex justify-center">
              <span className="bg-white px-4 py-1.5 rounded-full border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 shadow-sm">
                Solicitação enviada às 10:30
              </span>
            </div>

            {/* Message From Provider (Fake) */}
            <div className="flex gap-3 max-w-[80%]">
              <img
                src={service.provider.avatar}
                className="w-8 h-8 rounded-lg shadow-sm self-end"
                alt=""
              />
              <div className="bg-white p-4 rounded-2xl rounded-bl-none shadow-sm border border-slate-100">
                <p className="text-sm font-bold text-slate-700">
                  Olá! Recebi sua solicitação. Pelas fotos que você enviou,
                  parece ser um problema no disjuntor principal. Você teria
                  disponibilidade para eu passar aí hoje à tarde?
                </p>
                <span className="text-[9px] font-black text-slate-400 mt-2 block uppercase">
                  10:45
                </span>
              </div>
            </div>

            {/* Message From Client (Fake) */}
            <div className="flex flex-row-reverse gap-3 max-w-[80%] ml-auto">
              <div className="bg-blue-600 p-4 rounded-2xl rounded-br-none shadow-lg shadow-blue-100">
                <p className="text-sm font-bold text-white">
                  Oi João! Tenho sim, a partir das 14h estarei em casa. Pode
                  vir!
                </p>
                <span className="text-[9px] font-black text-blue-200 mt-2 block uppercase text-right">
                  10:48 • Lido
                </span>
              </div>
            </div>
          </div>

          {/* Chat Input Area */}
          <div className="p-6 bg-white border-t border-slate-100">
            <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-500 transition-all">
              <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                <Paperclip size={20} />
              </button>
              <input
                type="text"
                placeholder="Escreva sua mensagem..."
                className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-slate-700 py-2"
                disabled
              />
              <button className="bg-blue-600 text-white p-3 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
                <Send size={18} />
              </button>
            </div>
            <p className="text-center text-[10px] font-bold text-slate-400 mt-3 uppercase tracking-tighter">
              Somente mensagens de texto e imagens são permitidas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  ChevronLeft,
  MessageSquare,
  Clock,
  MapPin,
  User,
  CheckCircle2,
  Send,
  DollarSign,
  Calendar,
  AlertCircle,
  MoreVertical,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

export default function ProviderServicePage() {
  const params = useParams();
  const serviceId = params.id;

  // DADOS FAKES - PERSPECTIVA DO PRESTADOR
  const [service, setService] = useState({
    id: serviceId,
    status: "pending", // 'pending', 'quote_sent', 'active', 'completed'
    description:
      "Reparo no quadro elétrico e troca de fiação da cozinha que está em curto.",
    createdAt: "2024-05-20T10:30:00",
    address: "Rua das Flores, 123 - Centro (Casa)",
    client: {
      name: "Carlos Andrade",
      avatar:
        "https://ui-avatars.com/api/?name=Carlos+Andrade&background=EBF4FF&color=7F9CF5",
      rating: 4.8,
    },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Focado em Ação */}
      <div className="bg-slate-900 text-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/provider/dashboard"
              className="p-2 hover:bg-slate-800 rounded-xl transition-colors"
            >
              <ChevronLeft size={24} />
            </Link>
            <div>
              <span className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Ordem de Serviço
              </span>
              <h1 className="text-sm font-mono font-bold">
                #{serviceId?.toString().slice(0, 8)}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:block text-[10px] font-black uppercase bg-amber-500 text-slate-900 px-3 py-1 rounded-full">
              Novo Chamado
            </span>
            <button className="p-2 hover:bg-slate-800 rounded-lg">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LADO ESQUERDO: INFOS DO CLIENTE E SERVIÇO (4 colunas) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card do Cliente */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
              Solicitante
            </h2>
            <div className="flex items-center gap-4">
              <img
                src={service.client.avatar}
                className="w-16 h-16 rounded-2xl shadow-inner"
                alt=""
              />
              <div>
                <h3 className="font-black text-slate-900 text-lg leading-none mb-1">
                  {service.client.name}
                </h3>
                <div className="flex items-center gap-1 text-amber-500">
                  <CheckCircle size={12} className="fill-amber-500" />
                  <span className="text-xs font-black uppercase tracking-tighter">
                    Cliente VIP
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card Detalhes Técnicos */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                Pedido do Cliente
              </h2>
              <p className="text-sm font-bold text-slate-700 leading-relaxed italic">
                "{service.description}"
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
                <MapPin size={12} /> Local de Execução
              </h2>
              <p className="text-sm font-black text-slate-900">
                {service.address}
              </p>
            </div>
          </div>

          {/* Botões de Ação Rápida */}
          <div className="grid grid-cols-1 gap-3">
            <button className="flex items-center justify-center gap-3 bg-blue-600 text-white p-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
              <DollarSign size={18} /> Enviar Orçamento
            </button>
            <button className="flex items-center justify-center gap-3 bg-white text-slate-900 border-2 border-slate-200 p-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all">
              <Calendar size={18} /> Agendar Visita
            </button>
          </div>
        </div>

        {/* LADO DIREITO: CHAT OPERACIONAL (8 colunas) */}
        <div className="lg:col-span-8 flex flex-col h-[700px] bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Status Bar */}
          <div className="bg-amber-50 border-b border-amber-100 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-700">
              <AlertCircle size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Ação Necessária: Envie uma mensagem inicial para o cliente
              </span>
            </div>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-50/50">
            {/* Divider Data */}
            <div className="flex justify-center">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 bg-slate-100 px-3 py-1 rounded-md">
                Hoje
              </span>
            </div>

            {/* Balão do Sistema */}
            <div className="max-w-md mx-auto text-center">
              <p className="text-[11px] font-bold text-slate-500 leading-snug">
                O cliente solicitou este serviço há 15 minutos. <br /> Respostas
                rápidas aumentam em 40% a chance de fechamento.
              </p>
            </div>

            {/* Mensagem do Cliente (Vindo da esquerda) */}
            <div className="flex gap-3 max-w-[80%]">
              <img
                src={service.client.avatar}
                className="w-8 h-8 rounded-lg self-end"
                alt=""
              />
              <div className="bg-white p-4 rounded-2xl rounded-bl-none shadow-sm border border-slate-200">
                <p className="text-sm font-bold text-slate-800">
                  {service.description}
                </p>
                <div className="flex gap-2 mt-3">
                  <div className="w-20 h-20 bg-slate-200 rounded-lg animate-pulse"></div>
                  <div className="w-20 h-20 bg-slate-200 rounded-lg animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Input de Mensagem do Prestador */}
          <div className="p-6 bg-white border-t border-slate-100">
            <div className="flex items-center gap-4">
              <div className="flex-1 flex items-center gap-3 bg-slate-100 p-2 rounded-2xl border-2 border-transparent focus-within:border-blue-600 focus-within:bg-white transition-all">
                <input
                  type="text"
                  placeholder="Escreva sua resposta para o cliente..."
                  className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-slate-700 py-3 px-2"
                />
                <button className="bg-slate-900 text-white p-3 rounded-xl hover:bg-blue-600 transition-all">
                  <Send size={18} />
                </button>
              </div>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <button className="text-[10px] font-black uppercase text-slate-400 hover:text-blue-600 transition-colors">
                Anexar Foto
              </button>
              <button className="text-[10px] font-black uppercase text-slate-400 hover:text-blue-600 transition-colors">
                Solicitar Localização
              </button>
              <button className="text-[10px] font-black uppercase text-slate-400 hover:text-blue-600 transition-colors">
                Modelo de Resposta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

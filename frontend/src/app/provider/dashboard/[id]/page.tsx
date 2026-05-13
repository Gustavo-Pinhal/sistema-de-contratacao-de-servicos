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
import ChatRoom from "@/app/components/ChatRoom";

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
        {/* Substitua a coluna do chat por: */}
        <div className="lg:col-span-8 h-[700px]">
          <ChatRoom serviceId={params.id} />
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  ChevronLeft,
  Clock,
  MapPin,
  FileText,
  Loader2,
  User,
} from "lucide-react";
import Link from "next/link";
import ChatRoom from "@/app/components/ChatRoom";
import { useUser } from "@/context/UserContext";

interface ChatMetadata {
  idServico: string;
  mercureToken: string;
  topico: string;
  participantes: {
    cliente: { id: string; nome: string };
    prestador: { id: string; nome: string };
  };
  messagens: any[];
}

export default function ServiceTrackingPage() {
  const params = useParams();
  const serviceId = params.id as string;
  const { user } = useUser();

  const [chatData, setChatData] = useState<ChatMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.token || !serviceId) return;

    async function loadChatDetails() {
      try {
        const res = await fetch(`/api/servico/${serviceId}/chat`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        if (res.status === 403) {
          setError("Você não tem permissão para acessar este chat.");
          return;
        }

        if (!res.ok) throw new Error("Erro ao carregar dados do chat.");

        const data = await res.json();
        setChatData(data);
      } catch (err: any) {
        setError(err.message || "Falha na conexão.");
      } finally {
        setLoading(false);
      }
    }

    loadChatDetails();
  }, [serviceId, user?.token]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
          Carregando Sala...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
        <p className="text-sm font-black text-red-500 uppercase tracking-widest mb-4">
          {error}
        </p>
        <Link
          href="/search"
          className="text-xs font-bold text-slate-600 underline uppercase tracking-wider"
        >
          Voltar para a busca
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Header */}
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
              #{serviceId?.slice(0, 8)}
            </span>
          </div>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar Informações */}
        <div className="lg:col-span-1 space-y-6">
          {/* Card de Status */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3">
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
          </div>

          {/* Card do Prestador */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
              Prestador Responsável
            </h2>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm">
                <User size={24} />
              </div>
              <div>
                <h3 className="font-black text-slate-900 leading-none">
                  {chatData?.participantes.prestador.nome}
                </h3>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block mt-1">
                  Profissional Parceiro
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sala de Chat Dedicada */}
        <div className="lg:col-span-2 h-[650px] bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {chatData && (
            <ChatRoom
              serviceId={serviceId}
              initialMessages={chatData.messagens}
              topic={chatData.topico}
              mercureToken={chatData.mercureToken}
            />
          )}
        </div>
      </div>
    </div>
  );
}

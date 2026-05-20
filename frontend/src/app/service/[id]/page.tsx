"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  ChevronLeft,
  Clock,
  MapPin,
  FileText,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ChatRoom from "@/app/components/ChatRoom";
import { useUser } from "@/context/UserContext";

interface ServiceData {
  id: string;
  status: string;
  descricao: string | null;
  endereco: string | null;
  inicio: string;
  prestador: {
    id: string;
    nome: string;
    urlPerfil: string | null;
  };
}

function getInitials(nome: string): string {
  return nome.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

export default function ServiceTrackingPage() {
  const params = useParams();
  const serviceId = params.id as string;
  const { user } = useUser();

  const [service, setService] = useState<ServiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!user?.token || !serviceId) return;
    fetch(`/api/servico/${serviceId}`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error("Serviço não encontrado");
        return r.json();
      })
      .then(setService)
      .catch((e) => setErro(e.message))
      .finally(() => setLoading(false));
  }, [serviceId, user?.token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (erro || !service) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 font-bold">{erro || "Serviço não encontrado."}</p>
          <Link href="/search" className="mt-4 inline-block text-blue-600 font-bold text-sm hover:underline">
            Voltar para busca
          </Link>
        </div>
      </div>
    );
  }

  const statusColor = service.status === "Concluído"
    ? "text-emerald-600"
    : service.status === "Cancelado"
    ? "text-red-500"
    : "text-blue-600";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
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
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna Esquerda */}
        <div className="lg:col-span-1 space-y-6">
          {/* Status */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                <Clock className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Status Atual
                </h2>
                <span className={`text-lg font-black uppercase tracking-tight ${statusColor}`}>
                  {service.status}
                </span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
              <p className="text-sm font-medium text-slate-600">
                {service.status === "Em Orçamento"
                  ? "O prestador está analisando sua solicitação."
                  : service.status === "Em Andamento"
                  ? "O serviço está em andamento."
                  : service.status === "Concluído"
                  ? "Serviço concluído com sucesso."
                  : "Serviço encerrado."}
              </p>
            </div>
          </div>

          {/* Prestador */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
              Prestador Responsável
            </h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-blue-600 flex items-center justify-center shrink-0 shadow-md">
                {service.prestador.urlPerfil ? (
                  <Image
                    src={service.prestador.urlPerfil}
                    alt={service.prestador.nome}
                    fill
                    className="object-cover"
                    unoptimized={service.prestador.urlPerfil.includes("localhost")}
                  />
                ) : (
                  <span className="text-white font-black text-lg select-none">
                    {getInitials(service.prestador.nome)}
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-black text-slate-900 leading-none">
                  {service.prestador.nome}
                </h3>
              </div>
            </div>
            <Link
              href={`/provider/${service.prestador.id}`}
              className="w-full py-3 border-2 border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all block text-center"
            >
              Ver Perfil Completo
            </Link>
          </div>

          {/* Detalhes */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
            {service.descricao && (
              <div>
                <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
                  <FileText size={12} /> Descrição
                </h2>
                <p className="text-sm font-bold text-slate-700 leading-relaxed">
                  {service.descricao}
                </p>
              </div>
            )}
            {service.endereco && (
              <div className="pt-4 border-t border-slate-50">
                <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
                  <MapPin size={12} /> Local do Serviço
                </h2>
                <p className="text-sm font-bold text-slate-700">
                  {service.endereco}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Coluna do Chat */}
        <div className="lg:col-span-2 h-[700px]">
          <ChatRoom serviceId={params.id} />
        </div>
      </div>
    </div>
  );
}

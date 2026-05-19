"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Loader2,
  MapPin,
  MessageSquare,
  Star,
  User,
  Briefcase,
  Calendar,
  CheckCircle2,
  FolderHeart,
  Settings,
  AlertTriangle,
} from "lucide-react";
import { useUser } from "@/context/UserContext";

interface Avaliacao {
  nota: number;
  data: string;
}

interface EnderecoCompleto {
  id: string;
  endereco: string;
  cep: string;
  municipio: string;
}

interface ServiceAPI {
  id: string;
  data: string;
  status: string;
  encerradoEm: string | null;
  projeto: boolean;
  avaliacao: Avaliacao | null;
  cliente: {
    id: string;
    nome: string;
  };
  enderecoCompleto: EnderecoCompleto;
}

interface DashboardData {
  ativos: ServiceAPI[];
  pendentes: ServiceAPI[];
  concluidos: ServiceAPI[];
  cancelados: ServiceAPI[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost";

export default function AffiliateDashboardPage() {
  const { user } = useUser();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<keyof DashboardData>("pendentes");

  // O estado Premium agora pode ser validado dinamicamente com base nas notas ou regras de negócio
  const isPremium = data?.concluidos.some((s) => s.projeto) || false;

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${API_BASE_URL}/api/areaprestador/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${user?.token}`,
            },
          },
        );

        if (response.status === 403) {
          throw new Error(
            "Acesso negado. Apenas prestadores homologados possuem acesso.",
          );
        }

        if (!response.ok) {
          throw new Error("Falha ao carregar dados do servidor");
        }

        const result = (await response.json()) as DashboardData;
        setData(result);
      } catch (err: any) {
        setError(err.message || "Erro ao carregar dashboard");
      } finally {
        setLoading(false);
      }
    }

    if (user?.token) {
      fetchDashboard();
    }
  }, [user?.token]);

  const getCurrentList = (): ServiceAPI[] => {
    if (!data) return [];
    return data[activeTab] || [];
  };

  const getTabColor = (tab: keyof DashboardData) => {
    switch (tab) {
      case "pendentes":
        return "text-amber-600 bg-amber-50 border-amber-200";
      case "ativos":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "concluidos":
        return "text-green-600 bg-green-50 border-green-200";
      case "cancelados":
        return "text-gray-500 bg-gray-50 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-green-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
            Carregando painel...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl border border-red-100 p-8 text-center max-w-md w-full shadow-xl shadow-red-50">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-700 font-black uppercase text-sm mb-1">
            Erro de Autenticação
          </p>
          <p className="text-gray-500 text-xs font-medium mb-6">{error}</p>
          <Link
            href="/affiliate/login"
            className="inline-block bg-gray-900 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl hover:bg-gray-800 transition-all"
          >
            Voltar para o Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-8 selection:bg-green-500 selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Topo do Dashboard */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-md ${isPremium ? "bg-gradient-to-tr from-green-700 to-green-500 shadow-green-100" : "bg-gray-900 shadow-gray-200"}`}
            >
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
                  Painel de Controle
                </h1>
                {isPremium && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span className="text-[9px] font-black uppercase tracking-wider">
                      Destaque
                    </span>
                  </div>
                )}
              </div>
              <p className="text-gray-400 font-bold tracking-tight uppercase text-[10px] mt-0.5">
                Prestador:{" "}
                <span className="text-green-600 font-black">
                  {user?.name || "André Oliveira"}
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/provider/edit-profile"
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200 hover:border-gray-300 rounded-xl font-black text-[10px] uppercase tracking-widest text-gray-600 hover:text-gray-900 transition-all shadow-sm"
            >
              <Settings className="w-3.5 h-3.5" /> Configurações
            </Link>
            <Link
              href="/provider/subscription"
              className="px-4 py-2.5 bg-green-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg shadow-green-100"
            >
              Minha Conta
            </Link>
          </div>
        </div>

        {/* Grid de Cards Estatísticos */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Pendentes",
              val: data?.pendentes.length,
              style: "text-amber-600 border-l-amber-500",
            },
            {
              label: "Ativos",
              val: data?.ativos.length,
              style: "text-blue-600 border-l-blue-500",
            },
            {
              label: "Concluídos",
              val: data?.concluidos.length,
              style: "text-green-600 border-l-green-500",
            },
            {
              label: "Cancelados",
              val: data?.cancelados.length,
              style: "text-gray-400 border-l-gray-300",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className={`bg-white p-5 rounded-xl border border-gray-100 border-l-4 shadow-sm transition-transform hover:-translate-y-0.5 ${stat.style}`}
            >
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">
                {stat.label}
              </p>
              <p className="text-3xl font-black tracking-tight">
                {stat.val ?? 0}
              </p>
            </div>
          ))}
        </div>

        {/* Abas Operacionais Navegáveis */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none border-b border-gray-200/60">
          {(["pendentes", "ativos", "concluidos", "cancelados"] as const).map(
            (tab) => {
              const isActive = activeTab === tab;
              const count = data ? data[tab].length : 0;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-3 rounded-t-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 border-b-2 ${
                    isActive
                      ? "bg-white border-green-600 text-green-600 shadow-sm font-black"
                      : "bg-transparent border-transparent text-gray-400 hover:text-gray-700"
                  }`}
                >
                  {tab}
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}
                  >
                    {count}
                  </span>
                </button>
              );
            },
          )}
        </div>

        {/* Listagem Dinâmica de Serviços */}
        <div className="space-y-4">
          {getCurrentList().map((service) => (
            <Link
              key={service.id}
              href={`/affiliate/service/${service.id}`}
              className="group flex flex-col md:flex-row md:items-center justify-between bg-white p-5 rounded-2xl border border-gray-100 hover:border-green-600/30 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Avatar / Ícone de Estado */}
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-green-50 transition-colors">
                  <Briefcase className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                </div>

                {/* Informações Principais */}
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <h3 className="font-black text-gray-900 uppercase tracking-tight text-base leading-none">
                      {service.cliente.nome}
                    </h3>
                    <span
                      className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wide border ${getTabColor(activeTab)}`}
                    >
                      {service.status || activeTab}
                    </span>

                    {/* Badge do Portfólio (Apenas Concluídos) */}
                    {activeTab === "concluidos" && (
                      <span
                        className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wide flex items-center gap-1 ${service.projeto ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-gray-50 text-gray-400 border-gray-200"}`}
                      >
                        <FolderHeart className="w-3 h-3" />
                        {service.projeto ? "No Portfólio" : "Não Publicado"}
                      </span>
                    )}
                  </div>

                  {/* Detalhes Técnicos Básicos */}
                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-gray-400 font-semibold">
                    <span className="font-mono text-[11px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                      ID: {service.id.slice(0, 8)}
                    </span>
                    <span className="flex items-center gap-1 text-gray-500">
                      <MapPin size={13} className="text-gray-400" />
                      {service.enderecoCompleto?.municipio ||
                        "Localização não informada"}
                    </span>
                    <span className="flex items-center gap-1 text-gray-500">
                      <Calendar size={13} className="text-gray-400" />
                      {service.data}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lado Direito - Avaliação ou Ação */}
              <div className="mt-4 md:mt-0 flex items-center justify-between md:justify-end gap-6 border-t md:border-none pt-3 md:pt-0 border-gray-50">
                {/* Se houver avaliação (Aba Concluídos) */}
                {service.avaliacao && (
                  <div className="text-left md:text-right">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">
                      Nota do Cliente
                    </p>
                    <div className="flex items-center md:justify-end gap-1 text-amber-600 font-black text-sm">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      {service.avaliacao.nota.toFixed(1)}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 group-hover:text-green-600 transition-colors ml-auto md:ml-0">
                  <span className="hidden group-hover:inline transition-all text-[10px] font-black uppercase tracking-wider">
                    Ver Detalhes
                  </span>
                  <div className="w-9 h-9 rounded-xl border border-gray-100 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white group-hover:border-green-600 transition-all">
                    <ChevronRight size={18} />
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {/* Estado Vazio (Empty State) */}
          {getCurrentList().length === 0 && (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-16 text-center">
              <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">
                Nenhum serviço pendente nesta categoria
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Serviços expirados ou sem interação são removidos
                automaticamente.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

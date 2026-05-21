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
  FolderHeart,
  Settings,
  AlertTriangle,
  Bell,
  Building2,
  Check,
  X,
  RotateCcw,
  Crown,
  DollarSign,
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

interface EmpresaFiliada {
  id: string;
  nome: string;
}

interface DashboardData {
  filiado: EmpresaFiliada | null;
  ativos: ServiceAPI[];
  pendentes: ServiceAPI[];
  concluidos: ServiceAPI[];
  cancelados: ServiceAPI[];
  premium: boolean;
  nome: string;
  urlPerfil: string | null;
}

interface Notificacao {
  id: string;
  remetente: {
    id: string;
    nome: string;
    email: string;
  };
  conteudo: {
    type: "filiationInvitation";
    companyName: string;
  };
  criadoEm: string;
}

const API_BASE_URL = "https://localhost";

export default function AffiliateDashboardPage() {
  const { user } = useUser();
  const [data, setData] = useState<DashboardData | null>(null);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] =
    useState<Exclude<keyof DashboardData, "filiado" | "premium" | "nome" | "urlPerfil">>("pendentes");
  const [showNotifs, setShowNotifs] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const isPremium = data?.premium ?? false;

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${API_BASE_URL}/api/areaprestador/dashboard`,
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        },
      );

      if (response.status === 403) {
        throw new Error(
          "Acesso negado. Apenas prestadores homologados possuem acesso.",
        );
      }
      if (!response.ok) throw new Error("Falha ao carregar dados do servidor");

      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificacoes = async () => {
    if (!user?.token) return;
    try {
      setLoadingNotifs(true);
      const response = await fetch(
        `${API_BASE_URL}/api/areaprestador/notificacoes`,
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        },
      );
      if (response.ok) {
        const result = await response.json();
        setNotificacoes(result);
      }
    } catch (err) {
      console.error("Erro ao carregar notificações", err);
    } finally {
      setLoadingNotifs(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchDashboard();
      fetchNotificacoes();
    }
  }, [user?.token]);

  const handleAceitarConvite = async (id: string, companyName: string) => {
    if (
      !confirm(
        `Deseja realmente aceitar o convite de filiação da empresa "${companyName}"?`,
      )
    )
      return;
    setActioningId(id);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/areaprestador/convite/${id}/aceitar`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${user?.token}` },
        },
      );
      if (res.ok) {
        alert("Convite aceito com sucesso!");
        fetchDashboard();
        fetchNotificacoes();
      } else {
        alert("Não foi possível aceitar o convite no momento.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActioningId(null);
    }
  };

  const handleDeclinarConvite = async (id: string, companyName: string) => {
    if (
      !confirm(
        `Tem certeza que deseja declinar o convite de filiação da empresa "${companyName}"?`,
      )
    )
      return;
    setActioningId(id);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/areaprestador/convite/${id}/declinar`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${user?.token}` },
        },
      );
      if (res.ok) {
        alert("Convite recusado.");
        fetchNotificacoes();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActioningId(null);
    }
  };

  const getCurrentList = (): ServiceAPI[] => {
    if (!data) return [];
    return data[activeTab] || [];
  };

  const getTabColor = (tab: string) => {
    switch (tab) {
      case "pendentes":
        return "text-amber-600 bg-amber-50 border-amber-200";
      case "ativos":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "concluidos":
        return "text-green-600 bg-green-50 border-green-200";
      default:
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
            Erro Operacional
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {/* CARD DE FILIAÇÃO (Exibido apenas se data.filiado não for null) */}
        {data?.filiado && (
          <div className="bg-gradient-to-r from-green-800 to-green-950 text-white p-5 rounded-3xl border border-green-900 shadow-lg flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-green-400 shrink-0">
                <Building2 size={22} />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase text-green-400 tracking-widest block leading-none mb-1">
                  Empresa Vinculada
                </span>
                <h2 className="text-lg font-black uppercase tracking-tight italic">
                  {data.filiado.nome}
                </h2>
              </div>
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest bg-green-700/50 border border-green-600/40 px-3 py-1.5 rounded-xl text-green-300">
              Vínculo Ativo
            </span>
          </div>
        )}

        {/* Topo do Dashboard */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm relative">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl overflow-hidden shrink-0 shadow-md border-2 ${isPremium ? "border-amber-400 shadow-amber-100" : "border-gray-200 shadow-gray-100"}`}>
              {data?.urlPerfil ? (
                <img src={data.urlPerfil} alt="Foto de perfil" className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full flex items-center justify-center ${isPremium ? "bg-gradient-to-tr from-green-700 to-green-500" : "bg-gray-900"}`}>
                  <User className="w-6 h-6 text-white" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase italic">
                  {data?.nome || user?.name || "Prestador"}
                </h1>
                {isPremium && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span className="text-[9px] font-black uppercase tracking-wider">
                      Premium
                    </span>
                  </div>
                )}
              </div>
              <p className="text-gray-400 font-bold tracking-tight uppercase text-[10px] mt-0.5">
                Painel de Controle do Prestador
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Botão de Notificações */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifs(!showNotifs);
                  if (!showNotifs) fetchNotificacoes();
                }}
                className={`p-3 rounded-xl border transition-all relative ${showNotifs ? "bg-gray-900 border-gray-900 text-white" : "bg-white border-gray-200 text-gray-600 hover:bg-slate-50"}`}
              >
                <Bell size={18} />
                {notificacoes.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white font-black text-[9px] rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                    {notificacoes.length}
                  </span>
                )}
              </button>

              {/* Caixa Expansível de Notificações */}
              {showNotifs && (
                <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-30 overflow-hidden">
                  <div className="p-4 border-b bg-gray-50/50 flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Notificações Recentes
                    </span>
                    {loadingNotifs && (
                      <RotateCcw
                        size={12}
                        className="animate-spin text-gray-400"
                      />
                    )}
                  </div>
                  <div className="divide-y max-h-64 overflow-y-auto">
                    {notificacoes.length === 0 ? (
                      <div className="p-6 text-center text-xs text-gray-400 font-bold">
                        Nenhuma notificação encontrada.
                      </div>
                    ) : (
                      notificacoes.map((notif) => (
                        <div
                          key={notif.id}
                          className="p-4 space-y-3 bg-white hover:bg-slate-50/50 transition-colors"
                        >
                          <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                            A empresa{" "}
                            <strong className="font-black text-slate-900 uppercase">
                              {notif.conteudo.companyName}
                            </strong>{" "}
                            enviou um convite de filiação para você.
                          </p>
                          <div className="flex gap-2">
                            <button
                              disabled={actioningId !== null}
                              onClick={() =>
                                handleAceitarConvite(
                                  notif.id,
                                  notif.conteudo.companyName,
                                )
                              }
                              className="flex-1 py-1.5 bg-green-600 hover:bg-green-700 text-white font-black text-[9px] uppercase tracking-wider rounded-lg flex items-center justify-center gap-1 transition-all"
                            >
                              <Check size={12} /> Aceitar
                            </button>
                            <button
                              disabled={actioningId !== null}
                              onClick={() =>
                                handleDeclinarConvite(
                                  notif.id,
                                  notif.conteudo.companyName,
                                )
                              }
                              className="px-3 py-1.5 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 font-bold text-[9px] uppercase tracking-wider rounded-lg flex items-center justify-center transition-all"
                            >
                              <X size={12} /> Recusar
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/provider/edit-profile"
              className="flex items-center gap-1.5 px-4 py-3 bg-white border border-gray-200 hover:border-gray-300 rounded-xl font-black text-[10px] uppercase tracking-widest text-gray-600 hover:text-gray-900 transition-all shadow-sm"
            >
              <Settings className="w-3.5 h-3.5" /> Configurações
            </Link>
            {isPremium && (
              <Link
                href="/provider/organize-profile"
                className="flex items-center gap-1.5 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-orange-100"
              >
                <Crown className="w-3.5 h-3.5" /> Organizar Perfil
              </Link>
            )}
            <Link
              href="/provider/subscription"
              className="px-4 py-3 bg-green-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg shadow-green-100 flex items-center gap-1.5"
            >
              <DollarSign className="w-3.5 h-3.5" /> Assinatura
            </Link>
          </div>
        </div>

        {/* Grid de Cards Estatísticos */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              className={`bg-white p-5 rounded-2xl border border-gray-100 border-l-4 shadow-sm transition-transform hover:-translate-y-0.5 ${stat.style}`}
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
        <div className="flex gap-2 pt-4 overflow-x-auto pb-2 border-b border-gray-200/60">
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
                      ? "bg-white border-green-600 text-green-600 shadow-sm"
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
        <div className="space-y-4 pt-2">
          {getCurrentList().map((service) => (
            <Link
              key={service.id}
              href={`/affiliate/service/${service.id}`}
              className="group flex flex-col md:flex-row md:items-center justify-between bg-white p-5 rounded-2xl border border-gray-100 hover:border-green-600/30 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-green-50 transition-colors">
                  <Briefcase className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                </div>

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

                    {activeTab === "concluidos" && (
                      <span
                        className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wide flex items-center gap-1 ${service.projeto ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-gray-50 text-gray-400 border-gray-200"}`}
                      >
                        <FolderHeart className="w-3 h-3" />
                        {service.projeto ? "No Portfólio" : "Não Publicado"}
                      </span>
                    )}
                  </div>

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

              <div className="mt-4 md:mt-0 flex items-center justify-between md:justify-end gap-6 border-t md:border-none pt-3 md:pt-0 border-gray-50">
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

          {getCurrentList().length === 0 && (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-16 text-center">
              <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">
                Nenhum serviço nesta categoria
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Serviços expirados ou sem interação são omitidos
                automaticamente.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

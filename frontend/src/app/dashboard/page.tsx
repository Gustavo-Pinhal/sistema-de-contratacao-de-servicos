"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  DollarSign,
  MapPin,
  User,
  Crown,
  Star,
  Loader2,
  AlertCircle,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import { useUser } from "@/context/UserContext";

// Tipagem baseada no retorno da sua API
interface ServiceAPI {
  id: string;
  cliente: {
    nome: string;
  };
  serviceType?: string; // Campos opcionais caso a API expanda
  description?: string;
  address?: string;
  proposedValue?: string;
}

interface DashboardData {
  ativos: ServiceAPI[];
  pendentes: ServiceAPI[];
  concluidos: ServiceAPI[];
  cancelados: ServiceAPI[];
}

export default function ProviderDashboard() {
  const { user } = useUser();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<keyof DashboardData>("pendentes");
  const [providerName, setProviderName] = useState("");
  const [providerProfessions, setProviderProfessions] = useState<string[]>([]);

  const isPremium = user?.role === "ROLE_PREMIUM";

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        const [resDashboard, resPerfil] = await Promise.all([
          fetch("https://localhost/api/areaprestador/dashboard", {
            headers: { Authorization: `Bearer ${user?.token}` },
          }),
          fetch("https://localhost/api/prestador/perfil/editar", {
            headers: { Authorization: `Bearer ${user?.token}` },
          }),
        ]);

        if (!resDashboard.ok) throw new Error("Falha ao carregar dados do servidor");

        const result = await resDashboard.json();
        setData(result);

        if (resPerfil.ok) {
          const perfil = await resPerfil.json();
          setProviderName(perfil.nomeProfissional || perfil.nome || "");
          if (perfil.profissoes) {
            const profs = await fetch("/api/ui/profissoes").then(r => r.json());
            const nomes = perfil.profissoes
              .map((id: number) => profs.find((p: { id: number; descricao: string }) => p.id === id)?.descricao)
              .filter(Boolean);
            setProviderProfessions(nomes);
          }
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (user?.token) fetchDashboard();
  }, [user?.token]);

  const getCurrentList = () => {
    if (!data) return [];
    return data[activeTab] || [];
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - Identidade do Profissional */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${isPremium ? "bg-slate-900 shadow-slate-200" : "bg-gray-400"}`}
            >
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight italic uppercase">
                  Painel de Controle
                </h1>
                {isPremium && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100 shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    <span className="text-[10px] font-black uppercase tracking-wider">
                      Premium
                    </span>
                  </div>
                )}
              </div>
              <p className="text-gray-500 font-bold tracking-tight uppercase text-xs mt-1">
                Profissional:{" "}
                <span className="text-gray-900">{providerName || user?.name}</span>
                {providerProfessions.length > 0 && (
                  <span className="text-gray-400">
                    {" "}· {providerProfessions.join(", ")}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              href="/provider/edit-profile"
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all"
            >
              Configurações
            </Link>
            <Link
              href="/provider/subscription"
              className="px-4 py-2 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
            >
              Minha Assinatura
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Pendentes",
              val: data?.pendentes.length,
              color: "text-amber-600",
              bg: "bg-amber-50",
            },
            {
              label: "Ativos",
              val: data?.ativos.length,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              label: "Concluídos",
              val: data?.concluidos.length,
              color: "text-green-600",
              bg: "bg-green-50",
            },
            {
              label: "Cancelados",
              val: data?.cancelados.length,
              color: "text-gray-400",
              bg: "bg-gray-50",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">
                {stat.label}
              </p>
              <p className={`text-4xl font-black ${stat.color}`}>{stat.val}</p>
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {(["pendentes", "ativos", "concluidos", "cancelados"] as const).map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-slate-900 text-white shadow-lg"
                    : "bg-white text-gray-400 hover:text-gray-900 border border-gray-100"
                }`}
              >
                {tab} ({data ? data[tab].length : 0})
              </button>
            ),
          )}
        </div>

        {/* Listagem */}
        <div className="space-y-4">
          {getCurrentList().map((service) => (
            <Link
              key={service.id}
              href={`/provider/dashboard/${service.id}`}
              className="group flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-slate-900 transition-all"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-slate-900 transition-colors">
                  <User className="w-6 h-6 text-slate-400 group-hover:text-white" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 uppercase tracking-tight text-lg leading-none mb-1">
                    {service.cliente.nome}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">
                      ID: {service.id.slice(0, 8)}
                    </span>
                    <span className="text-gray-400 text-xs font-bold flex items-center gap-1">
                      <MapPin size={12} /> Localização pendente
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 md:mt-0 flex items-center gap-4">
                <div className="text-right hidden md:block">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Status
                  </p>
                  <p className="text-sm font-bold text-slate-900 capitalize">
                    {activeTab}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
                  <ChevronRight size={20} />
                </div>
              </div>
            </Link>
          ))}

          {getCurrentList().length === 0 && (
            <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-20 text-center">
              <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">
                Nenhum serviço nesta categoria
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

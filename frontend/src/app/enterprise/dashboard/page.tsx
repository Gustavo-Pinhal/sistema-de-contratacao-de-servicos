"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Clock,
  TrendingUp,
  Activity,
  Award,
  ArrowUpRight,
  ShieldCheck,
  Briefcase,
  CheckCircle2,
  Lock,
  Loader2,
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import CompanySidebar from "@/components/enterprise/CompanySidebar";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost";

interface EnterpriseStats {
  prestadores_vinculados: number;
  servicos_contratados: number;
  servicos_ativos: number;
  profissionais_premium: number;
  convites_pendentes: number;
  percentual_premium: number;
}

export default function CompanyDashboardPage() {
  const { user } = useUser();
  const [stats, setStats] = useState<EnterpriseStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.token) {
      setLoading(false);
      return;
    }

    fetch(`${API_BASE_URL}/api/empresarial/dashboard/stats`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user?.token) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl border text-center shadow-xl max-w-sm space-y-4">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
            <Lock size={22} />
          </div>
          <h1 className="text-md font-black uppercase tracking-tight text-slate-900">
            Acesso Restrito
          </h1>
          <Link
            href="/enterprise/login"
            className="block w-full py-3 bg-purple-600 text-white rounded-xl text-xs font-black uppercase tracking-widest"
          >
            Autenticar Empresa
          </Link>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Prestadores Vinculados",
      value: stats?.prestadores_vinculados ?? 0,
      change: "Membros ativos da equipe",
      isPositive: null,
      icon: <Users size={20} className="text-purple-600" />,
      bg: "bg-purple-50",
    },
    {
      title: "Convites Pendentes",
      value: stats?.convites_pendentes ?? 0,
      change: "Aguardando aceite",
      isPositive: null,
      icon: <Clock size={20} className="text-amber-600" />,
      bg: "bg-amber-50",
    },
    {
      title: "Profissionais Premium",
      value: stats?.profissionais_premium ?? 0,
      change: `${stats?.percentual_premium ?? 0}% da sua equipe`,
      isPositive: true,
      icon: <Award size={20} className="text-emerald-600" />,
      bg: "bg-emerald-50",
    },
    {
      title: "Serviços Contratados",
      value: stats?.servicos_contratados ?? 0,
      change: `${stats?.servicos_ativos ?? 0} em andamento`,
      isPositive: true,
      icon: <TrendingUp size={20} className="text-blue-600" />,
      bg: "bg-blue-50",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800">
      <CompanySidebar />

      <main className="flex-1 flex flex-col overflow-x-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <LayoutDashboard size={16} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Painel Corporativo
            </span>
          </div>
          <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-3 py-1 rounded-full uppercase tracking-widest">
            Visão Geral
          </span>
        </header>

        {/* Corpo do Dashboard */}
        <div className="p-8 max-w-5xl w-full mx-auto space-y-6">
          {/* Header de Boas-Vindas */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">
                Painel Executivo
              </h1>
              <p className="text-slate-400 text-xs font-bold">
                Métricas consolidadas da sua organização em tempo real.
              </p>
            </div>
            {loading && (
              <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-100 rounded-2xl self-start sm:self-auto">
                <Loader2 size={14} className="text-purple-600 animate-spin" />
                <span className="text-[10px] font-black text-purple-700 uppercase tracking-wider">
                  Carregando dados...
                </span>
              </div>
            )}
          </div>

          {/* Grid de Cards Estatísticos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((item, index) => (
              <div
                key={index}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-purple-200 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    {item.title}
                  </span>
                  <div className={`p-2 rounded-xl ${item.bg}`}>{item.icon}</div>
                </div>
                <div className="mt-4">
                  {loading ? (
                    <Loader2 size={22} className="animate-spin text-slate-200" />
                  ) : (
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                      {item.value}
                    </h3>
                  )}
                  <p className="text-[10px] font-bold text-slate-400 mt-1 flex items-center gap-1">
                    {item.isPositive && (
                      <span className="text-emerald-600 font-black">↑</span>
                    )}
                    {item.change}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Seção Central - Resumo e Ações */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bloco de Resumo Operacional (2/3) */}
            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden md:col-span-2 flex flex-col">
              <div className="p-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                <Activity size={14} className="text-purple-600" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Resumo Operacional
                </h3>
              </div>

              <div className="p-6 flex-1 space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
                      <Briefcase size={14} className="text-blue-600" />
                    </div>
                    <span className="text-xs font-bold text-slate-700">
                      Serviços em andamento
                    </span>
                  </div>
                  <span className="text-sm font-black text-slate-900">
                    {loading ? (
                      <Loader2 size={14} className="animate-spin text-slate-300" />
                    ) : (
                      stats?.servicos_ativos ?? 0
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center">
                      <CheckCircle2 size={14} className="text-emerald-600" />
                    </div>
                    <span className="text-xs font-bold text-slate-700">
                      Serviços concluídos (total)
                    </span>
                  </div>
                  <span className="text-sm font-black text-slate-900">
                    {loading ? (
                      <Loader2 size={14} className="animate-spin text-slate-300" />
                    ) : (
                      (stats?.servicos_contratados ?? 0) - (stats?.servicos_ativos ?? 0)
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center">
                      <Clock size={14} className="text-amber-600" />
                    </div>
                    <span className="text-xs font-bold text-slate-700">
                      Convites de filiação pendentes
                    </span>
                  </div>
                  <span className="text-sm font-black text-slate-900">
                    {loading ? (
                      <Loader2 size={14} className="animate-spin text-slate-300" />
                    ) : (
                      stats?.convites_pendentes ?? 0
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Painel Lateral de Ações (1/3) */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-purple-900 to-purple-950 p-6 rounded-[32px] text-white shadow-xl shadow-purple-950/10 space-y-4 flex flex-col justify-between h-[180px]">
                <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase tracking-widest text-purple-300">
                    Ações de Equipe
                  </h4>
                  <p className="text-sm font-black tracking-tight leading-tight uppercase italic">
                    Expanda sua malha corporativa
                  </p>
                </div>

                <Link
                  href="/enterprise/prestadores"
                  className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-purple-950 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-between group"
                >
                  <span>Alocar Prestadores</span>
                  <ArrowUpRight
                    size={14}
                    className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                  />
                </Link>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-600" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Segurança e Contrato
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  Sua conta empresarial está verificada e em total conformidade
                  com os termos de uso do ecossistema central.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

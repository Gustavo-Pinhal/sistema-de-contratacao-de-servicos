"use client";

import { useUser } from "@/context/UserContext";
import {
  Users,
  Wrench,
  FileText,
  Building2,
  TrendingUp,
  Clock,
  ArrowRight,
  Plus,
  RotateCcw,
  DollarSign,
  CreditCard,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

export default function AdminDashboardPage() {
  const { user } = useUser();
  const [stats, setStats] = useState({
    totalClientes: 0,
    totalPrestadores: 0,
    totalOrcamentos: 0,
    totalEmpresariais: 0,
    totalAssinaturas: 0,
    rendimentoMensal: 0,
    clientesPctMes: 0,
    clientesMes: 0,
    prestadoresMes: 0,
    orcamentosSemana: 0,
  });
  const [profissoesCount, setProfissoesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [atividades, setAtividades] = useState<{tipo: string; usuario: string; acao: string; alvo: string; tempo: string}[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.token) return;
      try {
        const [statsData, profissoesData, atividadesData] = await Promise.all([
          apiRequest("/admin/stats", "GET", user.token),
          apiRequest("/admin/cadastro/profissoes", "GET", user.token),
          apiRequest("/admin/atividades", "GET", user.token),
        ]);

        if (statsData) {
          setStats((prev) => ({
            ...prev,
            totalClientes: statsData.totalClientes ?? 0,
            totalPrestadores: statsData.totalPrestadores ?? 0,
            totalOrcamentos: statsData.totalOrcamentos ?? 0,
            totalEmpresariais: statsData.totalEmpresariais ?? 0,
            clientesPctMes: statsData.clientesPctMes ?? 0,
            clientesMes: statsData.clientesMes ?? 0,
            prestadoresMes: statsData.prestadoresMes ?? 0,
            orcamentosSemana: statsData.orcamentosSemana ?? 0,
          }));
        }

        if (Array.isArray(profissoesData)) {
          setProfissoesCount(profissoesData.length);
        }

        if (Array.isArray(atividadesData)) {
          setAtividades(atividadesData);
        }
      } catch (err) {
        console.error("Erro ao carregar dados do dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.token]);

  const cards = [
    {
      title: "Clientes Cadastrados",
      value: stats.totalClientes,
      icon: Users,
      color: "from-blue-500 to-indigo-600",
      bgLight: "bg-blue-50",
      textColor: "text-blue-600",
      change: stats.clientesPctMes >= 0 ? `+${stats.clientesPctMes}% este mês` : `${stats.clientesPctMes}% este mês`,
    },
    {
      title: "Prestadores Ativos",
      value: stats.totalPrestadores,
      icon: Wrench,
      color: "from-emerald-400 to-teal-600",
      bgLight: "bg-emerald-50",
      textColor: "text-emerald-600",
      change: `+${stats.prestadoresMes} novos este mês`,
    },
    {
      title: "Orçamentos Criados",
      value: stats.totalOrcamentos,
      icon: FileText,
      color: "from-amber-400 to-orange-500",
      bgLight: "bg-amber-50",
      textColor: "text-amber-600",
      change: `+${stats.orcamentosSemana} orçamentos esta semana`,
    },
    {
      title: "Usuários Empresariais",
      value: stats.totalEmpresariais,
      icon: Building2,
      color: "from-pink-500 to-rose-600",
      bgLight: "bg-pink-50",
      textColor: "text-pink-600",
      change: `${stats.totalEmpresariais} cadastrado(s) no total`,
    },
    {
      title: "Assinaturas Ativas",
      value: stats.totalAssinaturas,
      icon: CreditCard,
      color: "from-violet-500 to-purple-700",
      bgLight: "bg-violet-50",
      textColor: "text-violet-600",
      change: "+3 novas assinaturas",
    },
    {
      title: "Rendimento Mensal",
      value: `R$ ${stats.rendimentoMensal.toLocaleString("pt-BR")}`,
      icon: DollarSign,
      color: "from-green-500 to-emerald-700",
      bgLight: "bg-green-50",
      textColor: "text-green-600",
      change: "+18% vs mês anterior",
    },
  ];

  const tempoRelativo = (iso: string): string => {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (diff < 60) return `Há ${diff}s`;
    if (diff < 3600) return `Há ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Há ${Math.floor(diff / 3600)}h`;
    return `Há ${Math.floor(diff / 86400)} dia(s)`;
  };

  const iconePorTipo = (tipo: string) => {
    switch (tipo) {
      case "orcamento": return { icon: FileText, bg: "bg-blue-50 text-blue-600" };
      case "prestador": return { icon: UserPlus, bg: "bg-amber-50 text-amber-600" };
      case "cliente":   return { icon: Users,    bg: "bg-emerald-50 text-emerald-600" };
      default:          return { icon: Plus,     bg: "bg-indigo-50 text-indigo-600" };
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">
            Seja bem-vindo de volta! Acompanhe as estatísticas e as atividades da plataforma hoje.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-white border border-slate-200/80 px-3.5 py-2 rounded-xl shadow-sm">
          <Clock className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
          <span>Última atualização: Tempo Real</span>
        </div>
      </div>

      {/* Grid de Cards de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 hover:shadow-md hover:border-slate-300 transition-all group hover:-translate-y-0.5 duration-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {card.title}
                  </span>
                  <h3 className="text-3xl font-black text-slate-800 tracking-tight mt-1.5">
                    {card.value}
                  </h3>
                </div>
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${card.color} text-white shadow-md group-hover:scale-105 transition-transform duration-300`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-1.5 text-slate-500 text-xs font-semibold">
                <TrendingUp className={`w-3.5 h-3.5 ${card.textColor}`} />
                <span className={card.textColor}>{card.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Section: Atividades Recentes & Ações Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Atividades Recentes (2/3 da largura em telas grandes) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Atividades Recentes</h2>
              <p className="text-slate-400 text-xs mt-0.5">Fluxo de ações executadas no sistema</p>
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50/50 px-2.5 py-1 rounded-lg">
              Em tempo real
            </span>
          </div>

          <div className="flex-1 space-y-5">
            {loading ? (
              <div className="flex items-center gap-2 text-slate-400 text-sm py-4">
                <RotateCcw className="w-4 h-4 animate-spin" />
                Carregando atividades...
              </div>
            ) : atividades.length === 0 ? (
              <p className="text-sm text-slate-400 py-4">Nenhuma atividade recente encontrada.</p>
            ) : (
              atividades.map((act, idx) => {
                const { icon: Icon, bg } = iconePorTipo(act.tipo);
                return (
                  <div key={idx} className="flex gap-4 items-start p-3 hover:bg-slate-50/50 rounded-xl transition-colors">
                    <div className={`p-2.5 rounded-xl ${bg} shadow-sm shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-700 text-sm leading-normal">
                        <span className="font-bold text-slate-900">{act.usuario}</span>{" "}
                        <span className="text-slate-500">{act.acao}</span>{" "}
                        <span className="font-bold text-slate-800">{act.alvo}</span>
                      </p>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-1">
                        {tempoRelativo(act.tempo)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Ações Rápidas & Profissões Resumo (1/3 da largura) */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight mb-4">Ações Rápidas</h2>
            <div className="space-y-2.5">
              <Link
                href="/admin/profissoes"
                className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-indigo-50/30 border border-slate-100 hover:border-indigo-100 rounded-xl text-slate-700 hover:text-indigo-900 transition-all font-bold text-sm group"
              >
                <div className="flex items-center gap-3">
                  <Wrench className="w-4.5 h-4.5 text-slate-400 group-hover:text-indigo-600" />
                  <span>Cadastrar Nova Profissão</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                href="/admin/usuarios"
                className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-indigo-50/30 border border-slate-100 hover:border-indigo-100 rounded-xl text-slate-700 hover:text-indigo-900 transition-all font-bold text-sm group"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4.5 h-4.5 text-slate-400 group-hover:text-indigo-600" />
                  <span>Visualizar Usuários</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </Link>

            </div>
          </div>

          {/* Categoria / Profissões Info Panel */}
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-indigo-600/10">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-200">
              Banco de Profissões
            </span>
            <h3 className="text-xl font-bold mt-1 tracking-tight">Especialidades Ativas</h3>
            {loading ? (
              <div className="mt-6 flex items-center gap-2 text-indigo-200 text-xs">
                <RotateCcw className="w-4 h-4 animate-spin" />
                Carregando dados...
              </div>
            ) : (
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-5xl font-black tracking-tight">{profissoesCount}</span>
                <span className="text-indigo-200 font-semibold text-xs">categorias no sistema</span>
              </div>
            )}
            <p className="text-indigo-100 text-xs font-medium leading-relaxed mt-3">
              Estas especialidades estão disponíveis para novos prestadores escolherem em seus cadastros e para clientes usarem nos filtros de busca da Home.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

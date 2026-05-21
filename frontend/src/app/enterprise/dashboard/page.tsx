"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Clock,
  TrendingUp,
  Activity,
  Award,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Lock,
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import CompanySidebar from "@/components/enterprise/CompanySidebar";

export default function CompanyDashboardPage() {
  const { user } = useUser();

  // Redirecionamento de segurança client-side caso não esteja logado
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
            href="/company/login"
            className="block w-full py-3 bg-purple-600 text-white rounded-xl text-xs font-black uppercase tracking-widest"
          >
            Autenticar Empresa
          </Link>
        </div>
      </div>
    );
  }

  // Estatísticas simuladas (Feature ainda em desenvolvimento)
  const stats = [
    {
      title: "Prestadores Ativos",
      value: "24",
      change: "+12% este mês",
      isPositive: true,
      icon: <Users size={20} className="text-purple-600" />,
      bg: "bg-purple-50",
    },
    {
      title: "Convites Pendentes",
      value: "07",
      change: "Aguardando aceite",
      isPositive: null,
      icon: <Clock size={20} className="text-amber-600" />,
      bg: "bg-amber-50",
    },
    {
      title: "Profissionais Premium",
      value: "18",
      change: "75% da sua equipe",
      isPositive: true,
      icon: <Award size={20} className="text-emerald-600" />,
      bg: "bg-emerald-50",
    },
    {
      title: "Chamados Atendidos",
      value: "342",
      change: "+8.4% de eficiência",
      isPositive: true,
      icon: <TrendingUp size={20} className="text-blue-600" />,
      bg: "bg-blue-50",
    },
  ];

  // Atividades recentes simuladas
  const atividadesRecentes = [
    {
      id: 1,
      tipo: "vínculo",
      texto: "Carlos Henrique foi registrado com sucesso na plataforma.",
      hora: "Há 10 minutos",
    },
    {
      id: 2,
      tipo: "convite",
      texto:
        "Convite de filiação emitido para prestador.existente@exemplo.com.",
      hora: "Há 1 hora",
    },
    {
      id: 3,
      tipo: "desfiliar",
      texto: "Vínculo com o prestador ID ...c340 foi encerrado pela empresa.",
      hora: "Ontem às 18:40",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800">
      {/* Barra Lateral Unificada */}
      <CompanySidebar />

      {/* Conteúdo Principal */}
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
                Métricas consolidadas da sua organização e atividades recentes
                do ecossistema.
              </p>
            </div>
            <div className="px-4 py-2 bg-purple-50 border border-purple-100 rounded-2xl flex items-center gap-2 self-start sm:self-auto">
              <Zap size={14} className="text-purple-600 fill-purple-600" />
              <span className="text-[10px] font-black text-purple-700 uppercase tracking-wider">
                Modo Simulação Ativo
              </span>
            </div>
          </div>

          {/* Grid de Cards Estatísticos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((item, index) => (
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
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                    {item.value}
                  </h3>
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

          {/* Seção Central - Atalhos Rápidos e Atividades */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bloco de Atividades Recentes (2/3) */}
            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden md:col-span-2 flex flex-col">
              <div className="p-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                <Activity size={14} className="text-purple-600" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Logs e Atividades Recentes
                </h3>
              </div>

              <div className="p-6 flex-1 divide-y divide-slate-100 space-y-4">
                {atividadesRecentes.map((log) => (
                  <div
                    key={log.id}
                    className="flex gap-4 pt-4 first:pt-0 items-start"
                  >
                    <div className="w-2 h-2 rounded-full bg-purple-600 mt-1.5 shrink-0" />
                    <div className="flex-1 space-y-0.5">
                      <p className="text-xs font-bold text-slate-700 leading-relaxed">
                        {log.texto}
                      </p>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {log.hora}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Painel Lateral de Ações e Status (1/3) */}
            <div className="space-y-4">
              {/* Card de Atalho para Gestão de Times */}
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
                  href="/company/prestadores"
                  className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-purple-950 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-between group"
                >
                  <span>Alocar Prestadores</span>
                  <ArrowUpRight
                    size={14}
                    className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                  />
                </Link>
              </div>

              {/* Informações de Compliance Corporativo */}
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

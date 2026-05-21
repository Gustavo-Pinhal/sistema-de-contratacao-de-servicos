"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  Search,
  Bell,
  Users,
  UserCheck,
  Building2,
  CreditCard,
  LayoutDashboard,
  DollarSign,
  Loader2,
} from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { useUser } from "@/context/UserContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost";

interface AdminStats {
  clientes: number;
  prestadores: number;
  empresas: number;
  assinaturas_ativas: number;
  rendimento_mensal: number;
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconBg,
  loading,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  iconBg: string;
  loading: boolean;
}) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5">
      <div
        className={`w-14 h-14 ${iconBg} rounded-2xl flex items-center justify-center shrink-0`}
      >
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {title}
        </p>
        {loading ? (
          <div className="flex items-center gap-2 mt-1">
            <Loader2 size={18} className="animate-spin text-slate-300" />
          </div>
        ) : (
          <p className="text-2xl font-black text-slate-900 tracking-tighter">
            {value}
          </p>
        )}
        {subtitle && (
          <p className="text-[10px] font-bold text-slate-400 mt-1">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useUser();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.token) return;

    fetch(`${API_BASE_URL}/api/admin/dashboard/stats`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, [user]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />

      <main className="flex-1 flex flex-col">
        {/* Header Superior */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 w-96">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar por prestador, serviço ou log..."
              className="bg-transparent border-none outline-none text-xs font-bold ml-3 w-full text-slate-600 placeholder-slate-400"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all relative">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200 mx-2"></div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-black text-slate-900 uppercase leading-none">
                  Administrador
                </p>
                <p className="text-[10px] font-bold text-green-500 uppercase tracking-tighter">
                  Sistema Online
                </p>
              </div>
              <div className="w-10 h-10 bg-slate-200 rounded-xl overflow-hidden border-2 border-white shadow-sm">
                <img
                  src="https://ui-avatars.com/api/?name=Admin&background=0F172A&color=fff"
                  alt="Avatar"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Área de Visualização */}
        <div className="p-8 space-y-8">
          {/* Saudação */}
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">
              Dashboard Geral
            </h1>
            <p className="text-slate-500 font-bold text-sm">
              Visão consolidada da operação e saúde da plataforma.
            </p>
          </div>

          {/* Cards de Estatística — linha 1: tipos de usuário */}
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
              Usuários Cadastrados
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Usuários Cliente"
                value={stats?.clientes ?? 0}
                subtitle="Clientes ativos na plataforma"
                icon={<Users size={24} className="text-blue-600" />}
                iconBg="bg-blue-50"
                loading={loading}
              />
              <StatCard
                title="Usuários Prestador"
                value={stats?.prestadores ?? 0}
                subtitle="Prestadores cadastrados"
                icon={<UserCheck size={24} className="text-emerald-600" />}
                iconBg="bg-emerald-50"
                loading={loading}
              />
              <StatCard
                title="Usuários Empresarial"
                value={stats?.empresas ?? 0}
                subtitle="Empresas parceiras ativas"
                icon={<Building2 size={24} className="text-violet-600" />}
                iconBg="bg-violet-50"
                loading={loading}
              />
            </div>
          </div>

          {/* Cards de Estatística — linha 2: financeiro */}
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
              Financeiro e Assinaturas
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatCard
                title="Assinaturas Ativas"
                value={stats?.assinaturas_ativas ?? 0}
                subtitle="Total de assinaturas vigentes"
                icon={<CreditCard size={24} className="text-amber-600" />}
                iconBg="bg-amber-50"
                loading={loading}
              />
              <StatCard
                title="Rendimento Mensal"
                value={
                  stats ? formatCurrency(stats.rendimento_mensal) : "R$ 0,00"
                }
                subtitle="Soma dos orçamentos no mês atual"
                icon={<DollarSign size={24} className="text-green-600" />}
                iconBg="bg-green-50"
                loading={loading}
              />
            </div>
          </div>

          {/* Acesso Rápido */}
          <div className="bg-white rounded-[32px] border border-slate-200 p-8 min-h-40 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
              <LayoutDashboard size={32} />
            </div>
            <h3 className="text-slate-900 font-black uppercase tracking-widest">
              Acesso Rápido
            </h3>
            <p className="text-slate-400 text-xs font-bold max-w-xs mt-2">
              Selecione uma opção na barra lateral para gerenciar os dados da
              plataforma.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

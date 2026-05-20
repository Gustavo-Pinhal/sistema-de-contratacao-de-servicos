"use client";

import {
  Search,
  Bell,
  Users,
  CheckCircle2,
  AlertCircle,
  LayoutDashboard,
  TrendingUp,
} from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Reaproveitando a Barra Lateral */}
      <AdminSidebar />

      {/* Conteúdo Principal */}
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

          {/* Cards de Estatística */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                <Users size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Total Prestadores
                </p>
                <p className="text-2xl font-black text-slate-900 tracking-tighter">
                  1,284
                </p>
                <div className="flex items-center gap-1 text-[10px] font-bold text-green-500 mt-1">
                  <TrendingUp size={10} /> +12% esse mês
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5">
              <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shrink-0">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Serviços Ativos
                </p>
                <p className="text-2xl font-black text-slate-900 tracking-tighter">
                  439
                </p>
                <p className="text-[10px] font-bold text-slate-400 mt-1">
                  Status operacional normal
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
                <AlertCircle size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Solicitações Pendentes
                </p>
                <p className="text-2xl font-black text-slate-900 tracking-tighter">
                  18
                </p>
                <p className="text-[10px] font-bold text-amber-600 mt-1">
                  Requer atenção imediata
                </p>
              </div>
            </div>
          </div>

          {/* Espaço para Conteúdo Futuro */}
          <div className="bg-white rounded-[32px] border border-slate-200 p-8 min-h-64 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
              <LayoutDashboard size={32} />
            </div>
            <h3 className="text-slate-900 font-black uppercase tracking-widest">
              Acesso Rápido
            </h3>
            <p className="text-slate-400 text-xs font-bold max-w-xs mt-2">
              Selecione uma option na barra lateral para gerenciar os dados da
              plataforma.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import {
  LayoutDashboard,
  Wrench,
  Users,
  LogOut,
  ArrowLeft,
  Shield,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = user?.role === "admin" || user?.role === "ROLE_ADMIN";

  const menuItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      description: "Métricas e relatórios",
    },
    {
      name: "Profissões",
      href: "/admin/profissoes",
      icon: Wrench,
      description: "Gerenciar especialidades",
    },
    {
      name: "Usuários",
      href: "/admin/usuarios",
      icon: Users,
      description: "Clientes e Prestadores",
    },
  ];

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center animate-in fade-in slide-in-from-bottom-4">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mx-auto mb-6">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Acesso Restrito</h2>
          <p className="text-slate-500 mb-6">
            Por favor, faça login com uma conta de administrador para acessar o painel administrativo.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-indigo-600 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-slate-900/10 hover:shadow-indigo-600/25"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para o Início
          </Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center animate-in fade-in slide-in-from-bottom-4">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-6">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Acesso Negado</h2>
          <p className="text-slate-500 mb-6">
            Esta área é exclusiva para administradores da plataforma.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-indigo-600 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-slate-900/10 hover:shadow-indigo-600/25"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para o Início
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50/50">
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200/80 px-4 flex items-center justify-between z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
            <Shield className="w-5 h-5" />
          </div>
          <span className="font-bold text-slate-800 text-base tracking-tight">Admin Console</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-slate-500 hover:text-slate-800 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Overlay (Mobile Only) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 bottom-0 w-72 bg-white border-r border-slate-200/80 flex flex-col z-40 transform lg:transform-none transition-transform duration-300 ease-out shadow-xl lg:shadow-none h-screen ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="h-20 px-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-slate-800 text-lg tracking-tight leading-none">Console</h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                  active
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/15"
                    : "text-slate-500 hover:text-slate-950 hover:bg-slate-50"
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg transition-colors ${
                    active ? "bg-white/10" : "bg-slate-50 group-hover:bg-slate-100 text-slate-400 group-hover:text-slate-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-sm tracking-tight">{item.name}</div>
                  <div
                    className={`text-[10px] leading-none mt-0.5 font-medium ${
                      active ? "text-indigo-100" : "text-slate-400 group-hover:text-slate-500"
                    }`}
                  >
                    {item.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-100 shadow-sm mb-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm uppercase">
              {user?.name?.[0] || user?.email?.[0] || "A"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-xs text-slate-800 truncate leading-none mb-0.5">
                {user?.name || "Administrador"}
              </div>
              <div className="text-[10px] text-slate-400 font-semibold truncate leading-none">
                {user?.email}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              href="/"
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-800 rounded-xl font-bold text-xs transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Sair da Área
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
              title="Encerrar Sessão"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pt-16 lg:pt-0">
        <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-6xl w-full mx-auto animate-in fade-in duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}

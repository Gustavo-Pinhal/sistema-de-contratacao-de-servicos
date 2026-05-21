"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  Users,
  UserPlus,
  LogOut,
  ChevronRight,
  LayoutDashboard,
} from "lucide-react";
import { useUser } from "@/context/UserContext";

export default function CompanySidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useUser();

  const menuItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard size={18} />,
      href: "/enterprise/dashboard",
    },
    {
      title: "Prestadores Ativos",
      icon: <Users size={18} />,
      href: "/enterprise/prestadores",
    },
    {
      title: "Enviar Convites",
      icon: <UserPlus size={18} />,
      href: "/enterprise/convites",
    },
  ];

  const handleLogout = () => {
    logout();
    router.push("/enterprise/login");
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-200">
          <Building2 size={22} />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">
            Painel
          </p>
          <p className="text-sm font-black text-slate-900 uppercase">Empresa</p>
        </div>
      </div>

      {/* Navegação Corporativa */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">
          Gestão de Equipes
        </p>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group ${
                isActive
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-100"
                  : "text-slate-500 hover:bg-slate-50 hover:text-purple-600"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={
                    isActive
                      ? "text-white"
                      : "text-slate-400 group-hover:text-purple-600"
                  }
                >
                  {item.icon}
                </span>
                <span className="text-xs font-black uppercase tracking-widest">
                  {item.title}
                </span>
              </div>
              {isActive && <ChevronRight size={14} />}
            </Link>
          );
        })}
      </nav>

      {/* Sair */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-black text-xs uppercase tracking-widest"
        >
          <LogOut size={18} />
          Desconectar
        </button>
      </div>
    </aside>
  );
}

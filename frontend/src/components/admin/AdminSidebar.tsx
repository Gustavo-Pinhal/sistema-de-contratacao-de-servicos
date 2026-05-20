"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useUser } from "@/context/UserContext";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useUser();

  const menuItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard size={18} />,
      href: "/admin/dashboard",
    },
    {
      title: "Profissões",
      icon: <Briefcase size={18} />,
      href: "/admin/profissoes",
    },
    {
      title: "Prestadores",
      icon: <Users size={18} />,
      href: "/admin/prestadores",
    },
  ];

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
          <ShieldCheck size={24} />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">
            Painel
          </p>
          <p className="text-sm font-black text-slate-900 uppercase">Admin</p>
        </div>
      </div>

      {/* Links de Navegação */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">
          Navegação Principal
        </p>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                  : "text-slate-500 hover:bg-slate-50 hover:text-blue-600"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={
                    isActive
                      ? "text-white"
                      : "text-slate-400 group-hover:text-blue-600"
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

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-black text-xs uppercase tracking-widest"
        >
          <LogOut size={18} />
          Sair do Sistema
        </button>
      </div>
    </aside>
  );
}

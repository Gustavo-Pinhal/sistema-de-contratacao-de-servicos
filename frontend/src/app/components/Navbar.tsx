"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  User,
  LogOut,
  Search,
  Home as HomeIcon,
  FileText,
  Bell,
} from "lucide-react";
import { useUser } from "../../context/UserContext";
import { useNotifications } from "../../context/NotificationContext";
import { RoleSelectionDialog } from "./RoleSelectionDialog";
import Image from "next/image";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoggedIn, logout } = useUser();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<{
    isOpen: boolean;
    type: "login" | "register";
  }>({ isOpen: false, type: "login" });
  const notifRef = useRef<HTMLDivElement>(null);

  const role = user?.role || "client";
  const { notifications, totalUnread, clearAll } = useNotifications();
  const unreadCount = totalUnread;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    router.push("/");
  };

  const openAuthDialog = (type: "login" | "register") => {
    setDialogConfig({ isOpen: true, type });
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-15 h-15 group-hover:scale-105 transition-transform">
                <Image
                  src="/logo.png"
                  alt="Logo ServiçoFácil"
                  fill
                  sizes="60px"
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-xl font-bold text-slate-900 hidden sm:inline tracking-tighter">
                ServiçoFácil
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {isLoggedIn && (
                <>
                  {/* Links de acordo com a Role */}
                  {(role === "client" || role === "ROLE_CLIENTE") && (
                    <>
                      <NavLink
                        href="/search"
                        active={pathname === "/search"}
                        icon={<Search className="w-4 h-4" />}
                      >
                        Buscar Prestadores
                      </NavLink>
                      <NavLink
                        href="/client/requests"
                        active={pathname.startsWith("/client/requests")}
                        icon={<FileText className="w-4 h-4" />}
                      >
                        Meus Orçamentos
                      </NavLink>
                    </>
                  )}

                  {(role === "provider" || role === "ROLE_PRESTADOR") && (
                    <>
                      <NavLink
                        href="/dashboard"
                        active={pathname === "/dashboard"}
                        icon={<HomeIcon className="w-4 h-4" />}
                      >
                        Painel
                      </NavLink>
                      <NavLink
                        href="/provider/profile"
                        active={pathname.includes("/profile")}
                        icon={<User className="w-4 h-4" />}
                      >
                        Meu Perfil
                      </NavLink>
                    </>
                  )}
                </>
              )}

              {/* Seção de Autenticação / Perfil */}
              <div className="flex items-center gap-4 border-l pl-6 border-slate-200">
                {!isLoggedIn ? (
                  <>
                    <button
                      onClick={() => openAuthDialog("login")}
                      className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors"
                    >
                      Entrar
                    </button>
                    <button
                      onClick={() => openAuthDialog("register")}
                      className="text-sm font-bold bg-slate-900 text-white px-5 py-2 rounded-full hover:bg-blue-600 transition-all shadow-md active:scale-95"
                    >
                      Cadastre-se
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-5">
                    {/* Notificações */}
                    <div className="relative" ref={notifRef}>
                      <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-1 text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white animate-pulse">
                            {unreadCount > 9 ? "9+" : unreadCount}
                          </span>
                        )}
                      </button>

                      {showNotifications && (
                        <div className="absolute right-0 top-9 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
                          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Notificações</span>
                            {unreadCount > 0 && (
                              <button
                                onClick={clearAll}
                                className="text-[10px] font-bold text-blue-500 hover:text-blue-700"
                              >
                                Marcar todas como lidas
                              </button>
                            )}
                          </div>
                          <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                            {notifications.filter((n) => n.unread > 0).length === 0 ? (
                              <div className="p-6 text-center">
                                <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                <p className="text-xs font-bold text-slate-400">Nenhuma notificação</p>
                              </div>
                            ) : (
                              notifications
                                .filter((n) => n.unread > 0)
                                .map((n) => (
                                  <a
                                    key={n.servicoId}
                                    href={`/service/${n.servicoId}`}
                                    onClick={() => setShowNotifications(false)}
                                    className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                                  >
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 font-black text-xs">
                                      {n.unread}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-black text-slate-800 truncate">{n.prestadorNome}</p>
                                      <p className="text-[11px] text-slate-500 truncate">{n.lastMessage}</p>
                                      <p className="text-[10px] text-slate-400 mt-0.5">{n.lastAt}</p>
                                    </div>
                                  </a>
                                ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Avatar do Usuário */}
                    <Link
                      href={
                        role === "client"
                          ? "/client/profile"
                          : "/provider/dashboard"
                      }
                      className="group"
                    >
                      <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm uppercase border-2 border-transparent group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        {user?.name?.[0] || user?.email?.[0] || "U"}
                      </div>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                      title="Sair"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </nav>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white p-4 space-y-3 animate-in slide-in-from-top-5 duration-200">
            {isLoggedIn ? (
              <>
                <MobileNavLink
                  href="/search"
                  icon={<Search className="w-5 h-5" />}
                  label="Buscar Prestadores"
                  onClick={() => setMobileMenuOpen(false)}
                />
                <MobileNavLink
                  href="/client/requests"
                  icon={<FileText className="w-5 h-5" />}
                  label="Meus Orçamentos"
                  onClick={() => setMobileMenuOpen(false)}
                />
                <div className="pt-4 border-t">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-red-500 font-bold hover:bg-red-50"
                  >
                    <LogOut className="w-5 h-5" /> Sair da Conta
                  </button>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => openAuthDialog("login")}
                  className="p-3 rounded-xl bg-slate-100 text-slate-700 font-bold active:scale-95 transition-transform"
                >
                  Entrar
                </button>
                <button
                  onClick={() => openAuthDialog("register")}
                  className="p-3 rounded-xl bg-blue-600 text-white font-bold active:scale-95 transition-transform shadow-lg shadow-blue-100"
                >
                  Cadastrar
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Dialog de Seleção de Role */}
      <RoleSelectionDialog
        isOpen={dialogConfig.isOpen}
        type={dialogConfig.type}
        onClose={() => setDialogConfig({ ...dialogConfig, isOpen: false })}
      />
    </>
  );
}

// Helpers de Componente
function NavLink({
  href,
  active,
  icon,
  children,
}: {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 text-sm font-bold transition-all px-2 py-1 rounded-lg ${
        active
          ? "text-blue-600 bg-blue-50/50"
          : "text-slate-500 hover:text-blue-600 hover:bg-slate-50"
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  icon,
  label,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-700 font-bold transition-colors"
    >
      <span className="text-slate-400">{icon}</span>
      {label}
    </Link>
  );
}

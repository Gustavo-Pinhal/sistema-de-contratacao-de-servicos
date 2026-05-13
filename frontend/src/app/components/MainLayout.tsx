"use client";

import { useState } from "react";
import Link from "next/link"; // Ajustado
import { usePathname } from "next/navigation"; // Ajustado (substitui useLocation)
import {
  Menu,
  X,
  User,
  LogOut,
  Search,
  Home as HomeIcon,
  Briefcase,
  ShoppingBag,
  LogIn,
  Building2,
  FileText,
  Star,
  Bell,
  RotateCcw,
} from "lucide-react";
import { useUser } from "../context/UserContext";
import { useSimulation } from "../context/SimulationContext";
import { RoleSelectionDialog } from "./RoleSelectionDialog";
// No Next.js, importe imagens assim ou use o caminho da pasta public
import logo from "../../assets/logo.png";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); // Substitui useLocation().pathname
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { userRole, isLoggedIn, userPlan, logout, resetAllData } = useUser();
  const { resetSimulation } = useSimulation();

  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);

  const [notifications] = useState([
    {
      id: 1,
      text: "Bem-vindo ao Marido de Aluguel!",
      date: "Hoje",
      read: false,
    },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // LOGICA DE REAPROVEITAMENTO:
  // 1. Troquei todos os <Link to="..."> por <Link href="...">
  // 2. Removi o <Outlet />, no lugar dele entra o {children}

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <img
                src={logo.src}
                alt="Logo"
                className="w-16 h-16 object-contain"
              />
              <span className="text-xl font-bold text-gray-900 hidden sm:inline">
                Marido de Aluguel
              </span>
            </Link>

            {/* Desktop Nav - Ajustado para href */}
            <nav className="hidden md:flex items-center gap-6">
              {isLoggedIn && userRole === "client" && (
                <Link
                  href="/search"
                  className={`flex items-center gap-2 text-sm ${pathname === "/search" ? "text-blue-600" : "text-gray-700"}`}
                >
                  <Search className="w-4 h-4" /> Buscar
                </Link>
              )}
              {/* ... Repita a lógica para provider e business trocando 'to' por 'href' ... */}

              {/* Seção de Login/Profile igual ao seu antigo */}
              <div className="flex items-center gap-4 border-l pl-6 border-slate-200">
                {!isLoggedIn ? (
                  <>
                    <button
                      onClick={() => setLoginDialogOpen(true)}
                      className="text-sm font-semibold text-slate-700"
                    >
                      Entrar
                    </button>
                    <button
                      onClick={() => setRegisterDialogOpen(true)}
                      className="bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-semibold"
                    >
                      Cadastre-se
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-5">
                    {/* Botoes de Notificação, Zerar e Logout permanecem iguais */}
                    <button
                      onClick={() => logout()}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* AQUI ESTÁ A MÁGICA: O children substitui o Outlet */}
      <main>{children}</main>

      <footer className="bg-white border-t border-slate-200 mt-auto py-12">
        {/* ... Seu código de footer reaproveitado trocando 'to' por 'href' ... */}
      </footer>

      {/* Dialogs */}
      <RoleSelectionDialog
        isOpen={loginDialogOpen}
        onClose={() => setLoginDialogOpen(false)}
        type="login"
      />
      <RoleSelectionDialog
        isOpen={registerDialogOpen}
        onClose={() => setRegisterDialogOpen(false)}
        type="register"
      />
    </div>
  );
}

import { Outlet, Link, useLocation } from "react-router";
import { useState } from "react";
import { Menu, X, User, LogOut, Search, Home as HomeIcon, Briefcase, ShoppingBag, LogIn, Building2, FileText, Star, Bell, RotateCcw } from "lucide-react";
import { useUser } from "./context/UserContext";
import { useSimulation } from "./context/SimulationContext";
import logo from "../assets/logo.png";
import { RoleSelectionDialog } from "./components/RoleSelectionDialog";

export function Root() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { userRole, isLoggedIn, userPlan, logout, resetAllData } = useUser();
  const { resetSimulation } = useSimulation();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);

  const [notifications, setNotifications] = useState([
    { id: 1, text: "Bem-vindo ao Marido de Aluguel!", date: "Hoje", read: false },
    { id: 2, text: "Sua conta já está ativa.", date: "Ontem", read: true },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <img 
                src={logo} 
                alt="Marido de Aluguel Logo" 
                className="w-16 h-16 rounded-lg object-contain"
              />
              <span className="text-xl font-bold text-gray-900 hidden sm:inline">Marido de Aluguel</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {isLoggedIn && userRole === 'client' && (
                <>
                  <Link
                    to="/search"
                    className={`flex items-center gap-2 text-sm ${
                      location.pathname === '/search' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                    }`}
                  >
                    <Search className="w-4 h-4" />
                    Buscar Prestadores
                  </Link>
                  <Link
                    to="/quotes"
                    className={`flex items-center gap-2 text-sm ${
                      location.pathname === '/quotes' || location.pathname.startsWith('/quote/') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    Meus Orçamentos
                  </Link>

                </>
              )}

              {isLoggedIn && userRole === 'provider' && (
                <>
                  <Link
                    to="/dashboard"
                    className={`flex items-center gap-2 text-sm ${
                      location.pathname === '/dashboard' ? 'text-green-600' : 'text-gray-700 hover:text-green-600'
                    }`}
                  >
                    <HomeIcon className="w-4 h-4" />
                    Painel
                  </Link>
                  <Link
                    to="/provider/edit-profile"
                    className={`flex items-center gap-2 text-sm ${
                      location.pathname === '/provider/edit-profile' ? 'text-green-600' : 'text-gray-700 hover:text-green-600'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    Editar Perfil
                  </Link>
                  {userPlan === "premium" && (
                    <Link
                      to="/provider/organize-profile"
                      className={`flex items-center gap-2 text-sm ${
                        location.pathname === '/provider/organize-profile' ? 'text-green-600' : 'text-gray-700 hover:text-green-600'
                      }`}
                    >
                      <Star className="w-4 h-4" />
                      Organizar Perfil
                    </Link>
                  )}
                </>
              )}

              {isLoggedIn && userRole === 'business' && (
                <>
                  <Link
                    to="/business/dashboard"
                    className={`flex items-center gap-2 text-sm ${
                      location.pathname === '/business/dashboard' ? 'text-purple-600' : 'text-gray-700 hover:text-purple-600'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    Painel Empresarial
                  </Link>
                  <Link
                    to="/business/add-provider"
                    className={`flex items-center gap-2 text-sm ${
                      location.pathname === '/business/add-provider' ? 'text-purple-600' : 'text-gray-700 hover:text-purple-600'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    Adicionar Prestador
                  </Link>
                  <Link
                    to="/business/edit-profile"
                    className={`flex items-center gap-2 text-sm ${
                      location.pathname === '/business/edit-profile' ? 'text-purple-600' : 'text-gray-700 hover:text-purple-600'
                    }`}
                  >
                    <Star className="w-4 h-4" />
                    Editar Perfil
                  </Link>
                </>
              )}



              {/* Login/Profile Section inspirado no Uber */}
              <div className="flex items-center gap-4 border-l pl-6 border-slate-200">
                {!isLoggedIn ? (
                  <>
                    <button
                      onClick={() => setLoginDialogOpen(true)}
                      className="text-sm font-semibold tracking-tight text-slate-700 hover:text-indigo-600 transition-colors"
                    >
                      Entrar
                    </button>
                    <button
                      onClick={() => setRegisterDialogOpen(true)}
                      className="text-sm font-semibold tracking-tight bg-indigo-600 text-white px-5 py-2 rounded-full hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md active:scale-95"
                    >
                      Cadastre-se
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-5">
                    {/* Notification Bell */}
                    <div className="relative">
                      <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`relative p-1 text-gray-500 transition-colors ${userRole === 'business' ? 'hover:text-pink-600' : 'hover:text-green-600'}`}
                      >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                          <span className={`absolute top-0 right-0 w-4 h-4 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white ${userRole === 'business' ? 'bg-pink-600' : 'bg-green-600'}`}>
                            {unreadCount}
                          </span>
                        )}
                      </button>
                      
                      {showNotifications && (
                        <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2">
                          <div className="p-4 border-b bg-gray-50/50">
                            <h3 className="font-bold text-gray-900">Notificações</h3>
                          </div>
                          <div className="max-h-96 overflow-y-auto">
                            {notifications.length > 0 ? (
                              notifications.map(n => (
                                <div key={n.id} className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${!n.read ? 'bg-red-50/30' : ''}`}>
                                  <p className="text-sm text-gray-800 leading-tight">{n.text}</p>
                                  <p className="text-[10px] text-gray-400 mt-1 font-medium">{n.date}</p>
                                </div>
                              ))
                            ) : (
                              <div className="p-8 text-center text-gray-400 text-sm italic">
                                Nenhuma notificação.
                              </div>
                            )}
                          </div>
                          <div className="p-3 text-center bg-gray-50">
                            <button className="text-xs font-bold text-red-500 hover:underline">Ver todo o histórico</button>
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        if (confirm("Deseja zerar toda a simulação? Isso apagará todas as contas e orçamentos criados.")) {
                          resetAllData();
                          resetSimulation();
                          window.location.href = "/";
                        }
                      }}
                      className="text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-1"
                      title="Zerar Simulação"
                    >
                      <RotateCcw className="w-5 h-5" />
                      <span className="text-[10px] font-black uppercase tracking-widest hidden lg:block">Zerar</span>
                    </button>

                    <Link
                      to={userRole === 'client' ? '/client/profile' : userRole === 'provider' ? '/provider/edit-profile' : '/business/dashboard'}
                      className="flex items-center gap-2 group"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase shadow-sm transition-all ${
                        userRole === 'business' 
                          ? 'bg-pink-600 text-white group-hover:bg-pink-700' 
                          : 'bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white'
                      }`}>
                        {userRole === 'client' ? 'C' : userRole === 'provider' ? 'P' : 'E'}
                      </div>
                    </Link>

                    <button
                      onClick={() => logout()}
                      className="p-1 px-2 text-gray-400 hover:text-red-500 transition-colors"
                      title="Sair"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-4 py-4 space-y-3">


              {isLoggedIn && userRole === 'client' && (
                <>
                  <Link
                    to="/search"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Search className="w-4 h-4" />
                    Buscar Prestadores
                  </Link>
                  <Link
                    to="/quotes"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FileText className="w-4 h-4" />
                    Meus Orçamentos
                  </Link>

                </>
              )}

              {isLoggedIn && userRole === 'provider' && (
                <>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <HomeIcon className="w-4 h-4" />
                    Painel
                  </Link>
                  <Link
                    to="/provider/edit-profile"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    Editar Perfil
                  </Link>
                  {userPlan === "premium" && (
                    <Link
                      to="/provider/organize-profile"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Star className="w-4 h-4" />
                      Organizar Perfil
                    </Link>
                  )}
                </>
              )}

              {isLoggedIn && userRole === 'business' && (
                <>
                  <Link
                    to="/business/dashboard"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Building2 className="w-4 h-4" />
                    Painel Empresarial
                  </Link>
                  <Link
                    to="/business/add-provider"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    Adicionar Prestador
                  </Link>
                  <Link
                    to="/business/edit-profile"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Star className="w-4 h-4" />
                    Editar Perfil
                  </Link>
                </>
              )}

              {/* Login/Profile Mobile */}
              <div className="pt-3 border-t space-y-2">
                {!isLoggedIn ? (
                  <>
                    <button
                      onClick={() => { setLoginDialogOpen(true); setMobileMenuOpen(false); }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium"
                    >
                      <LogIn className="w-4 h-4" />
                      Entrar
                    </button>
                    <button
                      onClick={() => { setRegisterDialogOpen(true); setMobileMenuOpen(false); }}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-white ${
                        userRole === 'provider'
                          ? 'bg-green-600'
                          : userRole === 'business'
                          ? 'bg-gradient-to-r from-purple-600 to-orange-500'
                          : 'bg-blue-600'
                      }`}
                    >
                      Cadastrar
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to={userRole === 'client' ? '/client/profile' : userRole === 'provider' ? '/provider/edit-profile' : '/business/dashboard'}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      Meu Perfil
                    </Link>
                    <button
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-blue-600"
                      onClick={() => { 
                        if (confirm("Deseja zerar toda a simulação?")) {
                          resetAllData();
                          resetSimulation();
                          setMobileMenuOpen(false);
                          window.location.href = "/";
                        }
                      }}
                    >
                      <RotateCcw className="w-4 h-4" />
                      Zerar Simulação
                    </button>
                    <button
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-red-600"
                      onClick={() => { logout(); setMobileMenuOpen(false); }}
                    >
                      <LogOut className="w-4 h-4" />
                      Sair
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <img 
                  src={logo} 
                  alt="Marido de Aluguel Logo" 
                  className="w-12 h-12 rounded-xl object-contain shadow-sm border border-slate-100"
                />
                <span className="font-bold text-xl tracking-tight text-slate-900">Marido de Aluguel</span>
              </div>
              <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
                A plataforma mais confiável para conectar clientes e profissionais qualificados. Serviços rápidos, seguros e práticos ao seu alcance.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-slate-900 mb-4 tracking-tight">Recursos</h3>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><Link to="/search" className="hover:text-indigo-600 transition-colors">Buscar Profissionais</Link></li>
                <li><Link to="/" className="hover:text-indigo-600 transition-colors">Como Funciona</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-slate-900 mb-4 tracking-tight">Contato & Suporte</h3>
              <p className="text-sm text-slate-500 space-y-2">
                <span className="block">ajuda@maridodealuguel.com</span>
                <span className="block">0800 123 4567</span>
              </p>
            </div>
          </div>
          
          <div className="border-t border-slate-100 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
            <p>&copy; 2026 Marido de Aluguel Inc. Todos os direitos reservados.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-indigo-600 transition-colors">Privacidade</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Termos</a>
            </div>
          </div>
        </div>
      </footer>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 flex justify-around items-center py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] md:hidden">
        <Link to="/" className="flex flex-col items-center gap-1 group">
          <Search className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
          <span className="text-[10px] font-bold uppercase tracking-tight text-gray-500 group-hover:text-green-600">Prestadores</span>
        </Link>
        <Link to="/business/dashboard" className="flex flex-col items-center gap-1 group">
          <Briefcase className="w-5 h-5 text-gray-400 group-hover:text-pink-600 transition-colors" />
          <span className="text-[10px] font-bold uppercase tracking-tight text-gray-500 group-hover:text-pink-600">Empresarial</span>
        </Link>
      </div>

      {/* Role Selection Dialogs */}
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
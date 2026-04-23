import { useState } from "react";
import { Link } from "react-router";
import { Search, Star, Shield, Users, ArrowRight, MessageSquare, PlayCircle, CheckCircle } from "lucide-react";
import { useUser } from "../context/UserContext";
import { ProviderHome } from "./ProviderHome";
import { BusinessHome } from "./BusinessHome";
import { RoleSelectionDialog } from "../components/RoleSelectionDialog";
import heroImg from "../../assets/hero-handyman.png";

export function Home() {
  const { userRole } = useUser();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Se o usuário for um prestador, mostrar a página específica para prestadores
  if (userRole === 'provider') {
    return <ProviderHome />;
  }

  // Se o usuário for empresarial, mostrar a página específica para empresas
  if (userRole === 'business') {
    return <BusinessHome />;
  }

  // Página padrão para clientes
  const services = [
    { icon: "⚡", name: "Eletricista", count: "120+ profissionais" },
    { icon: "🔧", name: "Encanador", count: "95+ profissionais" },
    { icon: "🎨", name: "Pintor", count: "150+ profissionais" },
    { icon: "🏗️", name: "Pedreiro", count: "80+ profissionais" },
    { icon: "❄️", name: "Ar Condicionado", count: "60+ profissionais" },
    { icon: "🪛", name: "Marceneiro", count: "45+ profissionais" },
  ];

  const features = [
    {
      icon: Shield,
      title: "Profissionais Verificados",
      description: "Todos os prestadores são verificados e avaliados por outros clientes."
    },
    {
      icon: Star,
      title: "Avaliações Reais",
      description: "Veja o histórico completo de trabalhos e avaliações de cada profissional."
    },
    {
      icon: Users,
      title: "Suporte Completo",
      description: "Acompanhe seu serviço do orçamento até a conclusão com chat integrado."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Redesigned Hero Section */}
      <section className="relative pt-16 pb-24 overflow-hidden border-b border-border/50">
        {/* Background shapes */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-br from-indigo-50 to-transparent -z-10 rounded-l-[120px] hidden lg:block opacity-70"></div>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/5 blur-3xl rounded-full -z-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            
            <div className="flex-1 text-center lg:text-left z-10 w-full">
              <span className="inline-block py-1 px-3 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold mb-6">
                Líder em serviços na sua região
              </span>
              <h1 className="text-4xl md:text-6xl lg:text-[4rem] font-bold text-slate-900 leading-[1.05] tracking-tight mb-6">
                A maior plataforma <br />
                de <span className="text-indigo-600">profissionais</span> do Brasil
              </h1>
              
              {/* Stats Inline */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-x-8 gap-y-3 mb-10 text-slate-600 border-l-4 border-indigo-200 pl-4">
                <div className="flex flex-col">
                  <span className="font-bold text-2xl text-slate-900">+20k</span>
                  <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">Usuários Ativos</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-2xl text-slate-900">+10k</span>
                  <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">Avaliações 5 Estrelas</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link 
                  to="/client/login?mode=register"
                  className="flex items-center justify-center px-8 py-4 bg-indigo-600 text-white rounded-xl font-semibold text-base hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 hover:-translate-y-1"
                >
                  Contratar Serviço
                </Link>
                <Link 
                  to="/provider/login?mode=register"
                  className="flex items-center justify-center px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold text-base hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm hover:-translate-y-1"
                >
                  Sou Profissional
                </Link>
                <Link 
                  to="/business/login?mode=register"
                  className="flex items-center justify-center px-8 py-4 bg-slate-900 text-white rounded-xl font-semibold text-base hover:bg-slate-800 transition-all shadow-sm hover:-translate-y-1"
                >
                  Para Empresas
                </Link>
              </div>

              <div className="relative mt-8 max-w-xl group">
                <input 
                  type="text" 
                  placeholder="Buscar profissional por categoria ou cidade..." 
                  className="w-full pl-6 pr-16 py-5 bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 text-base focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Link 
                  to="/search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white hover:bg-green-700 transition-colors shadow-lg"
                >
                  <Search className="w-6 h-6" />
                </Link>
              </div>

              {/* Links Populares Card */}
              <div className="mt-12 bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-slate-100 p-6 max-w-xs mx-auto lg:mx-0 hidden md:block">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Links Populares</h3>
                <div className="space-y-4">
                  <Link to="/search" className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600 group-hover:scale-110 transition-transform">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700">Ler avaliações</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                  </Link>
                  <Link to="/search" className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600 group-hover:scale-110 transition-transform">
                        <PlayCircle className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700">Serviços em vídeo</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column - Image Section */}
            <div className="flex-1 relative">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-100 to-indigo-50 rounded-[2.5rem] -z-10 blur-xl opacity-70"></div>
                <img 
                  src={heroImg} 
                  alt="Profissional" 
                  className="w-full max-w-2xl mx-auto rounded-[2rem] relative z-20 shadow-2xl border border-white"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-slate-50 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
              A especialidade que você precisa
            </h2>
            <p className="text-lg text-slate-500">
              Encontre profissionais qualificados e avaliados para qualquer tipo de projeto ou manutenção.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {services.map((service, index) => (
              <Link
                key={index}
                to={`/search?specialty=${service.name}`}
                className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-indigo-200 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all text-center group flex flex-col items-center justify-center hover:-translate-y-1"
              >
                <div className="text-4xl mb-3">{service.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{service.name}</h3>
                <p className="text-sm text-gray-600">{service.count}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Decor */}
        <div className="absolute right-0 bottom-0 w-[800px] h-[800px] bg-slate-50 rounded-full blur-3xl -z-10 translate-x-1/2 translate-y-1/2"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
              Padronização e Qualidade
            </h2>
            <p className="text-lg text-slate-500">
              A plataforma que conecta você com segurança e excelência.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-slate-50/50 backdrop-blur-sm border border-slate-100 rounded-3xl p-8 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group">
                  <div className="w-14 h-14 bg-white border border-slate-200 shadow-sm rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-indigo-200 transition-all">
                    <Icon className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-snug">{feature.title}</h3>
                  <p className="text-slate-500 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-500/10 mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-800">
            <div className="px-4">
              <div className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">550+</div>
              <div className="text-slate-400 font-medium">Profissionais</div>
            </div>
            <div className="px-4">
              <div className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">2.5k+</div>
              <div className="text-slate-400 font-medium">Clientes</div>
            </div>
            <div className="px-4">
              <div className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">8.7k+</div>
              <div className="text-slate-400 font-medium">Serviços Executados</div>
            </div>
            <div className="px-4">
              <div className="text-4xl md:text-5xl font-bold mb-2 tracking-tight flex justify-center items-baseline gap-1">4.8 <Star className="w-6 h-6 fill-amber-400 text-amber-400" /></div>
              <div className="text-slate-400 font-medium">Aprovação Média</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-b from-indigo-50 to-white border-t border-indigo-100/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
            Pronto para transformar seu espaço?
          </h2>
          <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto">
            Junte-se a milhares de pessoas que já simplificaram a contratação de profissionais qualificados.
          </p>
          <Link 
            to="/search" 
            className="inline-flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 hover:-translate-y-1"
          >
            <Search className="w-5 h-5" />
            Encontrar Profissional Agora
          </Link>
        </div>
      </section>

      {/* Role Selection Dialog */}
      <RoleSelectionDialog 
        isOpen={loginDialogOpen}
        onClose={() => setLoginDialogOpen(false)}
        type="login"
      />
    </div>
  );
}
import { Link } from "react-router";
import { Building2, Users, TrendingUp, Shield, Star, CheckCircle, ArrowRight } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function BusinessHome() {
  const features = [
    {
      icon: Users,
      title: "Gerencie Múltiplos Prestadores",
      description: "Cadastre e gerencie toda sua equipe de profissionais em um só lugar."
    },
    {
      icon: TrendingUp,
      title: "Acompanhe o Desempenho",
      description: "Visualize estatísticas, avaliações e desempenho de cada prestador."
    },
    {
      icon: Shield,
      title: "Credibilidade Empresarial",
      description: "Aumente a confiança dos clientes com um perfil empresarial verificado."
    }
  ];

  const benefits = [
    "Cadastro ilimitado de prestadores",
    "Dashboard centralizado de controle",
    "Relatórios de desempenho detalhados",
    "Gestão de serviços em andamento",
    "Controle de avaliações e reviews",
    "Suporte prioritário empresarial"
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-pink-600 via-pink-700 to-rose-600 text-white font-black tracking-tight">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Building2 className="w-4 h-4" />
                <span className="text-sm font-semibold">Solução Empresarial</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Expanda seu negócio de serviços
              </h1>
              <p className="text-xl mb-8 text-pink-100 font-medium font-sans">
                Gerencie sua equipe de prestadores de forma profissional.
                Centralize operações, acompanhe desempenho e cresça com confiança.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/business/login"
                  className="inline-flex items-center justify-center gap-2 bg-white text-pink-600 px-8 py-4 rounded-lg font-black text-xs uppercase tracking-widest hover:bg-pink-50 transition-all shadow-xl shadow-pink-100 hover:-translate-y-0.5"
                >
                  <Building2 className="w-5 h-5" />
                  Criar Conta Empresarial
                </Link>
                <Link
                  to="/business/dashboard"
                  className="inline-flex items-center justify-center gap-2 bg-pink-700/50 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-black text-xs uppercase tracking-widest hover:bg-pink-700 transition-all border border-white/20"
                >
                  Ver Dashboard Demo
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>

            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">150+</div>
                    <div className="text-pink-200 uppercase text-[10px] font-black tracking-widest">Empresas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-black mb-2">800+</div>
                    <div className="text-pink-200 uppercase text-[10px] font-black tracking-widest">Prestadores</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-black mb-2">15k+</div>
                    <div className="text-pink-200 uppercase text-[10px] font-black tracking-widest">Serviços</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-black mb-2">4.9</div>
                    <div className="text-pink-200 uppercase text-[10px] font-black tracking-widest">Avaliação</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Recursos Empresariais Completos
            </h2>
            <p className="text-xl text-gray-600">
              Tudo que você precisa para gerenciar sua equipe de prestadores
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-8 hover:shadow-lg transition-shadow border border-pink-100/50 group">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-600 to-rose-500 rounded-lg flex items-center justify-center mb-4 shadow-lg shadow-pink-100 group-hover:-translate-y-1 transition-transform">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Tudo que você precisa em um só lugar
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Nossa plataforma empresarial oferece ferramentas completas para gestão profissional de prestadores de serviços.
              </p>
              <div className="grid grid-cols-1 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-600 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwbWVldGluZyUyMG9mZmljZXxlbnwxfHx8fDE3NzU2OTY4MDh8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Equipe trabalhando"
                className="w-full h-96 object-cover rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-6 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-orange-500 rounded-lg flex items-center justify-center">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">4.9/5.0</div>
                    <div className="text-sm text-gray-600">Satisfação média</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Como Funciona
            </h2>
            <p className="text-xl text-gray-600">
              Comece a gerenciar sua equipe em 3 passos simples
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Crie sua Conta Empresarial
              </h3>
              <p className="text-gray-600">
                Cadastre sua empresa com CNPJ e informações básicas.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Cadastre seus Prestadores
              </h3>
              <p className="text-gray-600">
                Adicione os profissionais da sua equipe com seus dados e documentos.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Gerencie e Acompanhe
              </h3>
              <p className="text-gray-600">
                Use o dashboard para monitorar serviços, avaliações e desempenho.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-pink-600 via-pink-700 to-rose-600 text-white font-black tracking-tight">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4 uppercase tracking-widest">
            Pronto para crescer seu negócio?
          </h2>
          <p className="text-xl text-pink-100 mb-8 font-medium font-sans">
            Junte-se a centenas de empresas que confiam na nossa plataforma
          </p>
          <Link
            to="/business/login"
            className="inline-flex items-center gap-2 bg-white text-pink-600 px-8 py-4 rounded-lg font-black text-xs uppercase tracking-widest hover:bg-pink-50 transition-all shadow-xl shadow-pink-100"
          >
            <Building2 className="w-5 h-5" />
            Começar Agora Gratuitamente
          </Link>
        </div>
      </section>
    </div>
  );
}

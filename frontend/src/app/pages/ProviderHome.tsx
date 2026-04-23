import { Link } from "react-router";
import { TrendingUp, Clock, Shield, Users, CheckCircle, Star, ArrowRight, Briefcase } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function ProviderHome() {
  const benefits = [
    {
      icon: TrendingUp,
      title: "Aumente sua Renda",
      description: "Receba solicitações de clientes verificados e expanda seus negócios."
    },
    {
      icon: Clock,
      title: "Flexibilidade Total",
      description: "Você escolhe quando e quais serviços aceitar. Trabalhe no seu ritmo."
    },
    {
      icon: Shield,
      title: "Pagamentos Seguros",
      description: "Sistema de pagamento protegido e suporte dedicado para prestadores."
    }
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Crie seu Perfil",
      description: "Cadastre-se gratuitamente e monte seu perfil profissional com fotos dos seus trabalhos."
    },
    {
      step: "2",
      title: "Receba Solicitações",
      description: "Clientes interessados enviam solicitações de orçamento diretamente para você."
    },
    {
      step: "3",
      title: "Envie Propostas",
      description: "Analise o serviço, converse com o cliente e envie sua proposta de valor."
    },
    {
      step: "4",
      title: "Execute e Receba",
      description: "Cliente aceita, você realiza o serviço e recebe o pagamento de forma segura."
    }
  ];

  const plans = [
    {
      name: "Plano Básico",
      price: "Grátis",
      period: "",
      features: [
        "Perfil na plataforma",
        "Receba até 5 solicitações/mês",
        "Chat com clientes",
        "Sistema de avaliações",
        "Suporte por email"
      ],
      cta: "Começar Grátis",
      highlighted: false
    },
    {
      name: "Plano Premium",
      price: "R$ 49",
      period: "/mês",
      features: [
        "Tudo do plano básico",
        "Solicitações ilimitadas",
        "Selo Premium no perfil",
        "Destaque nas buscas",
        "Portfólio de serviços",
        "Estatísticas detalhadas",
        "Suporte prioritário"
      ],
      cta: "Começar Premium",
      highlighted: true
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-600 to-green-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-green-700 px-4 py-2 rounded-full mb-6">
                <Briefcase className="w-4 h-4" />
                <span className="text-sm font-semibold">Para Prestadores de Serviços</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-[1.1]">
                Expanda seu negócio <br /> e conquiste mais clientes
              </h1>
              <p className="text-xl mb-8 text-green-100">
                Junte-se a centenas de profissionais que já aumentaram sua renda através 
                da nossa plataforma. Receba solicitações qualificadas todos os dias.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/provider/login?mode=register" 
                  className="inline-flex items-center justify-center gap-2 bg-white text-green-600 px-8 py-4 rounded-lg font-black text-xs uppercase tracking-widest hover:bg-green-50 transition-all shadow-xl shadow-green-100 hover:-translate-y-0.5"
                >
                  <Star className="w-5 h-5" />
                  Cadastrar Grátis
                </Link>
                <a 
                  href="#plans" 
                  className="inline-flex items-center justify-center gap-2 bg-green-700/50 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-black text-xs uppercase tracking-widest hover:bg-green-700 transition-all border border-white/20"
                >
                  Ver Planos
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            </div>
            
            <div className="hidden md:block">
              <ImageWithFallback 
                src="https://images.unsplash.com/photo-1758876204244-930299843f07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b3JrZXIlMjBzbWlsaW5nfGVufDF8fHx8MTc3NTY5NjQwMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Profissional sorrindo"
                className="w-full h-96 object-cover rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-black text-green-600 mb-2 tracking-tighter">R$ 5.2k</div>
              <div className="text-gray-600">Renda Média Mensal</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-green-600 mb-2">2.5k+</div>
              <div className="text-gray-600">Clientes Ativos</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-green-600 mb-2">8.7k+</div>
              <div className="text-gray-600">Serviços/Mês</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-green-600 mb-2">4.8★</div>
              <div className="text-gray-600">Satisfação Média</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Por que trabalhar conosco?
            </h2>
            <p className="text-xl text-gray-600">
              Benefícios exclusivos para prestadores de serviços
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Como Funciona
            </h2>
            <p className="text-xl text-gray-600">
              Simples, rápido e transparente
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="text-2xl font-bold text-green-600">{item.step}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">{item.title}</h3>
                <p className="text-gray-600 text-center">{item.description}</p>
                
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-8 -right-4 w-8">
                    <ArrowRight className="w-6 h-6 text-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              O que nossos prestadores dizem
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "João Silva",
                role: "Eletricista",
                comment: "Desde que entrei na plataforma, minha agenda está sempre cheia. Consegui aumentar minha renda em 60%!",
                rating: 5,
                avatar: "https://i.pravatar.cc/150?img=12"
              },
              {
                name: "Maria Santos",
                role: "Encanador",
                comment: "A plataforma é muito fácil de usar e o suporte é excelente. Recebo solicitações todos os dias.",
                rating: 5,
                avatar: "https://i.pravatar.cc/150?img=5"
              },
              {
                name: "Carlos Oliveira",
                role: "Pintor",
                comment: "O plano premium valeu muito a pena. O selo de destaque me trouxe muito mais visibilidade.",
                rating: 5,
                avatar: "https://i.pravatar.cc/150?img=33"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">"{testimonial.comment}"</p>
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="plans" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Escolha seu Plano
            </h2>
            <p className="text-xl text-gray-600">
              Comece grátis ou potencialize seus resultados com o Premium
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`rounded-2xl p-8 ${
                  plan.highlighted
                    ? 'bg-gradient-to-br from-green-600 to-green-700 text-white shadow-xl scale-105'
                    : 'bg-white border-2 border-gray-200'
                }`}
              >
                {plan.highlighted && (
                  <div className="inline-block bg-amber-400 text-gray-900 px-4 py-1 rounded-full text-sm font-semibold mb-4">
                    MAIS POPULAR
                  </div>
                )}
                
                <h3 className={`text-2xl font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                
                <div className="mb-6">
                  <span className={`text-5xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                    {plan.price}
                  </span>
                  <span className={`text-lg ${plan.highlighted ? 'text-green-100' : 'text-gray-600'}`}>
                    {plan.period}
                  </span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        plan.highlighted ? 'text-green-200' : 'text-green-600'
                      }`} />
                      <span className={plan.highlighted ? 'text-green-50' : 'text-gray-700'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    plan.highlighted
                      ? 'bg-white text-green-600 hover:bg-green-50'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-green-600 to-green-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para aumentar sua renda?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Cadastre-se agora e comece a receber solicitações de serviço hoje mesmo
          </p>
          <Link 
            to="/provider/login?mode=register" 
            className="inline-flex items-center gap-2 bg-white text-green-600 px-8 py-4 rounded-lg font-black text-xs uppercase tracking-widest hover:bg-green-50 transition-all shadow-xl shadow-green-100"
          >
            <Star className="w-5 h-5" />
            Começar Agora Gratuitamente
          </Link>
          <p className="mt-4 text-green-100 text-sm">
            Sem taxas de cadastro • Cancele quando quiser
          </p>
        </div>
      </section>
    </div>
  );
}
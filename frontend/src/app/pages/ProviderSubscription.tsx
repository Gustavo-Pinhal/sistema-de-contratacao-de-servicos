import { useState } from "react";
import { Link } from "react-router";
import { Check, Crown, Star, TrendingUp, ArrowLeft } from "lucide-react";
import { useUser } from "../context/UserContext";

export function ProviderSubscription() {
  const { user, updateProfile } = useUser();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const currentPlan = user?.plan || 'free';
  const isPremium = currentPlan === 'premium';

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
      cta: "Plano Atual",
      highlighted: false,
      isCurrent: currentPlan === 'free'
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
      cta: isPremium ? "Plano Atual" : "Fazer Upgrade",
      highlighted: true,
      isCurrent: isPremium
    }
  ];

  const handleUpgrade = () => {
    if (isPremium) return;
    
    setIsUpgrading(true);
    // Simulação do upgrade
    setTimeout(() => {
      updateProfile({ plan: 'premium' });
      setIsUpgrading(false);
      alert("Upgrade para Premium realizado com sucesso! Aproveite todos os benefícios.");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <Link 
            to="/provider/dashboard" 
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-8 font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para o Painel
          </Link>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Gerenciar Assinatura
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Escolha o plano ideal para expandir seus negócios e conquistar mais clientes
            </p>
          </div>
        </div>

        {/* Current Plan Status */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                isPremium ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-gray-200'
              }`}>
                {isPremium ? (
                  <Crown className="w-6 h-6 text-white" />
                ) : (
                  <Star className="w-6 h-6 text-gray-600" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Plano Atual: {isPremium ? 'Premium' : 'Básico'}
                </h2>
                <p className="text-gray-600">
                  {isPremium 
                    ? 'Você tem acesso a todos os recursos premium'
                    : 'Você está usando o plano gratuito'
                  }
                </p>
              </div>
            </div>
            
            {isPremium && (
              <div className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-green-800">Ativo</span>
              </div>
            )}
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl p-8 ${
                plan.highlighted 
                  ? 'ring-2 ring-green-500 shadow-xl transform scale-105' 
                  : 'shadow-lg'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    Mais Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={plan.isCurrent ? undefined : handleUpgrade}
                disabled={plan.isCurrent || isUpgrading}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                  plan.isCurrent
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : plan.highlighted
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } ${isUpgrading ? 'opacity-50 cursor-wait' : ''}`}
              >
                {isUpgrading && !plan.isCurrent ? 'Processando...' : plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="mt-16 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Por que fazer upgrade para Premium?
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Mais Clientes</h4>
              <p className="text-gray-600 text-sm">
                Receba solicitações ilimitadas e apareça em destaque nas buscas
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Mais Credibilidade</h4>
              <p className="text-gray-600 text-sm">
                Selo Premium no perfil e portfólio completo de serviços
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Crown className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Suporte Prioritário</h4>
              <p className="text-gray-600 text-sm">
                Atendimento rápido e estatísticas detalhadas do seu negócio
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

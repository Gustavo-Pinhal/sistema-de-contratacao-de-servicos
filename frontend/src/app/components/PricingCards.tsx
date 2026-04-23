import { Check, Star } from "lucide-react";
import { Button } from "./ui/button";

interface Plan {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  isPopular?: boolean;
}

const businessPlans: Plan[] = [
  {
    id: "start",
    name: "Plano Start",
    price: "R$ 49,90",
    description: "Ideal para pequenas equipes em crescimento.",
    features: [
      "Até 5 prestadores",
      "Suporte via e-mail",
      "Perfil verificado",
      "Gestão de orçamentos",
      "Relatórios básicos"
    ]
  },
  {
    id: "expert",
    name: "Plano Expert",
    price: "R$ 99,90",
    description: "Para empresas que buscam escala e destaque.",
    features: [
      "Prestadores ilimitados",
      "Suporte prioritário 24/7",
      "Destaque nos resultados",
      "Gestão de equipe avançada",
      "Relatórios financeiros",
      "Selo de Empresa Premium"
    ],
    isPopular: true
  }
];

const providerPlans: Plan[] = [
  {
    id: "free",
    name: "Plano Grátis",
    price: "R$ 0,00",
    description: "Para profissionais que estão começando.",
    features: [
      "Perfil básico",
      "1 categoria de serviço",
      "Receber solicitações",
      "Chat com clientes",
      "Atendimento padrão"
    ]
  },
  {
    id: "premium",
    name: "Plano Premium",
    price: "R$ 29,90",
    description: "Para quem quer dominar os pedidos da região.",
    features: [
      "Destaque nos resultados",
      "Múltiplas categorias (até 5)",
      "Selo de Profissional Premium",
      "Suporte prioritário",
      "Estatísticas de visitas",
      "Taxa de serviço reduzida"
    ],
    isPopular: true
  }
];

interface PricingCardsProps {
  onSelect: (planId: string) => void;
  selectedPlanId?: string;
  type?: 'business' | 'provider';
}

export function PricingCards({ onSelect, selectedPlanId, type = 'business' }: PricingCardsProps) {
  const plans = type === 'business' ? businessPlans : providerPlans;
  
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className={`relative flex flex-col p-6 rounded-2xl border-2 transition-all cursor-pointer ${
            selectedPlanId === plan.id
              ? type === 'business' ? "border-pink-600 bg-pink-50/50 ring-2 ring-pink-600 ring-offset-2" : "border-green-600 bg-green-50/50 ring-2 ring-green-600 ring-offset-2"
              : "border-gray-200 hover:border-blue-300 bg-white"
          }`}
          onClick={() => onSelect(plan.id)}
        >
          {plan.isPopular && (
            <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm ${
              type === 'business' ? "bg-gradient-to-r from-pink-600 to-rose-500" : "bg-gradient-to-r from-green-600 to-teal-500"
            }`}>
              {plan.price === 'R$ 0,00' ? 'Iniciante' : 'Mais Popular'}
            </div>
          )}

          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
              <span className="text-sm text-gray-500">/mês</span>
            </div>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              {plan.description}
            </p>
          </div>

          <ul className="space-y-3 mb-6 flex-1">
            {plan.features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-gray-700">
                <Check className={`w-4 h-4 mt-0.5 shrink-0 ${selectedPlanId === plan.id ? (type === 'business' ? "text-pink-600" : "text-green-600") : "text-gray-400"}`} />
                {feature}
              </li>
            ))}
          </ul>

          <Button
            variant={selectedPlanId === plan.id ? "default" : "outline"}
            className={`w-full ${
              selectedPlanId === plan.id
                ? type === 'business' ? "bg-pink-600 hover:bg-pink-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"
                : type === 'business' ? "text-pink-600 border-pink-200 hover:bg-pink-50" : "text-green-600 border-green-200 hover:bg-green-50"
            }`}
          >
            {selectedPlanId === plan.id ? "Selecionado" : "Selecionar Plano"}
          </Button>
        </div>
      ))}
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Briefcase,
  ArrowLeft,
  Phone,
  MapPin,
  Loader2,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Check,
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";

interface Profissao {
  id: number;
  descricao: string;
}

const providerPlans = [
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
      "Atendimento padrão",
    ],
    isPopular: false,
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
      "Taxa de serviço reduzida",
    ],
    isPopular: true,
  },
];

export default function ProviderLoginPage() {
  const router = useRouter();
  const { login } = useUser();
  const searchParams = useSearchParams();

  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profissoes, setProfissoes] = useState<Profissao[]>([]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    cep: "",
    profissao: "",
  });

  const [cepPreview, setCepPreview] = useState("");
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState("");
  const cepDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setIsLogin(searchParams.get("mode") !== "register");
  }, [searchParams]);

  useEffect(() => {
    fetch("/api/ui/profissoes")
      .then((r) => (r.ok ? r.json() : []))
      .then(setProfissoes)
      .catch(() => {});
  }, []);

  const handleCepChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    setFormData((prev) => ({ ...prev, cep: digits }));
    setCepPreview("");
    setCepError("");

    if (cepDebounce.current) clearTimeout(cepDebounce.current);

    if (digits.length === 8) {
      cepDebounce.current = setTimeout(async () => {
        setCepLoading(true);
        try {
          const res = await fetch(`/api/ui/endereco?cep=${digits}`);
          if (res.ok) {
            const data = await res.json();
            setCepPreview(
              `${data.rua}, ${data.bairro} - ${data.municipio.nome}/${data.municipio.uf}`,
            );
          } else {
            setCepError("CEP não encontrado");
          }
        } catch {
          setCepError("Erro ao buscar CEP");
        } finally {
          setCepLoading(false);
        }
      }, 400);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isLogin) {
      setLoading(true);
      const success = await login(formData.email, formData.password);
      if (success) {
        router.push("/provider/dashboard");
      } else {
        setError("Credenciais inválidas.");
        setLoading(false);
      }
      return;
    }

    if (step === 1) {
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!selectedPlan) return;
      if (selectedPlan === "free") {
        await doRegister();
      } else {
        setStep(3);
      }
      return;
    }

    if (step === 3) {
      await doRegister();
    }
  };

  const doRegister = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cadastro-usuario/prestador", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: formData.name,
          email: formData.email,
          telefone: formData.phone,
          senha: formData.password,
          cep: formData.cep,
          profissao: Number(formData.profissao),
        }),
      });
      if (res.ok) {
        const success = await login(formData.email, formData.password);
        if (success) router.push("/provider/dashboard");
      } else {
        const data = await res.json();
        setError(data.message || data.detail || "Erro ao realizar cadastro.");
      }
    } catch {
      setError("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  id="name"
                  type="text"
                  required={!isLogin}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Seu nome profissional"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            {!isLogin && (
              <>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone/WhatsApp *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="phone"
                      type="tel"
                      required={!isLogin}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="profissao" className="block text-sm font-medium text-gray-700 mb-2">
                    Serviço Principal *
                  </label>
                  <select
                    id="profissao"
                    required={!isLogin}
                    value={formData.profissao}
                    onChange={(e) => setFormData({ ...formData, profissao: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Selecione seu serviço</option>
                    {profissoes.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.descricao}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="cep" className="block text-sm font-medium text-gray-700 mb-2">
                    CEP *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="cep"
                      type="text"
                      required={!isLogin}
                      maxLength={9}
                      value={formData.cep}
                      onChange={(e) => handleCepChange(e.target.value)}
                      className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${cepError ? "border-red-400" : "border-gray-300"}`}
                      placeholder="00000-000"
                    />
                    {cepLoading && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600 animate-spin" />
                    )}
                    {cepPreview && !cepLoading && (
                      <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                    )}
                  </div>
                  {cepPreview && (
                    <p className="text-[11px] text-green-600 font-bold mt-1 flex items-center gap-1">
                      <MapPin size={10} /> {cepPreview}
                    </p>
                  )}
                  {cepError && (
                    <p className="text-[11px] text-red-500 font-bold mt-1">{cepError}</p>
                  )}
                </div>
              </>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-100 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isLogin ? (
                "Entrar"
              ) : (
                <>Próximo Passo <Sparkles className="w-4 h-4 text-green-300" /></>
              )}
            </button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Turbine seus resultados</h3>
              <p className="text-sm text-gray-600 mt-1">Selecione o plano ideal para sua carreira</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {providerPlans.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`relative flex flex-col p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedPlan === plan.id
                      ? "border-green-600 bg-green-50/50 ring-2 ring-green-600 ring-offset-2"
                      : "border-gray-200 hover:border-green-300 bg-white"
                  }`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-600 to-teal-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                      Mais Popular
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-sm text-gray-500">/mês</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 mb-4">{plan.description}</p>
                  <ul className="space-y-2 flex-1">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <Check className={`w-4 h-4 mt-0.5 shrink-0 ${selectedPlan === plan.id ? "text-green-600" : "text-gray-400"}`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="flex gap-4 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
                Voltar
              </Button>
              <Button
                type="submit"
                disabled={!selectedPlan || loading}
                className="flex-[2] bg-green-600 hover:bg-green-700 text-white font-bold"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : selectedPlan === "free" ? "Finalizar Cadastro" : "Continuar"}
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-start gap-3">
              <ShieldCheck className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900">Checkout Seguro</p>
                <p className="text-xs text-green-700 mt-0.5">Seus dados estão 100% protegidos.</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 text-center">
              Pagamento integrado em breve. Por ora, seu cadastro será criado gratuitamente.
            </p>

            <div className="pt-4 space-y-3">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-base font-bold shadow-lg shadow-green-100"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ativar Plano Premium"}
              </Button>
              <Button type="button" variant="ghost" className="w-full text-gray-500" onClick={() => setStep(2)}>
                Voltar para Planos
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Lado Esquerdo - Imagem */}
      <div className="hidden lg:block relative w-0 flex-1">
        <img
          src="https://images.unsplash.com/photo-1678803262992-d79d06dd5d96?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
          alt="Profissional trabalhando"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-green-900/60 to-green-600/30" />
        <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
          <div className="flex items-center gap-2 mb-4">
            <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-[10px] font-bold uppercase tracking-tighter">
              Profissional Partner
            </div>
          </div>
          <h3 className="text-4xl font-bold mb-4 tracking-tight">
            Você profissional, nós as oportunidades.
          </h3>
          <p className="text-xl text-green-50 max-w-lg leading-relaxed">
            Junte-se à maior rede de prestadores da região e multiplique seus ganhos com total flexibilidade.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <CheckCircle2 className="w-5 h-5 text-green-300 mb-2" />
              <p className="text-sm font-bold">Solicitações Diretas</p>
              <p className="text-xs text-green-100 mt-1">Receba pedidos no seu WhatsApp.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <Sparkles className="w-5 h-5 text-green-300 mb-2" />
              <p className="text-sm font-bold">Destaque na Busca</p>
              <p className="text-xs text-green-100 mt-1">Apareça no topo para mais clientes.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lado Direito - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className={`mx-auto w-full ${step === 2 ? "max-w-2xl" : "max-w-sm lg:w-96"}`}>
          <Link href="/" className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-8">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>

          <div className={`flex items-center gap-3 mb-8 ${step === 2 ? "justify-center text-center" : ""}`}>
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-green-100">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                {isLogin
                  ? "Área do Prestador"
                  : step === 2
                  ? "Planos Disponíveis"
                  : step === 3
                  ? "Ativar Assinatura"
                  : "Cadastro Profissional"}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-gray-600 font-medium">Transforme sua carreira</p>
                {!isLogin && (
                  <div className="flex items-center gap-1">
                    <span className="w-1 h-1 bg-gray-400 rounded-full" />
                    <p className="text-xs text-green-600 font-bold uppercase tracking-wider">
                      Passo {step} de {selectedPlan === "free" ? "2" : "3"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-semibold mb-6 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>{renderStep()}</form>

          {isLogin && (
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Ainda não é parceiro?{" "}
                <button
                  type="button"
                  onClick={() => { setIsLogin(false); setStep(1); router.push("/provider/login?mode=register"); }}
                  className="text-green-600 font-semibold hover:text-green-700 underline-offset-4 hover:underline"
                >
                  Cadastre-se e comece hoje
                </button>
              </p>
            </div>
          )}

          {!isLogin && step === 1 && (
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Já é nosso parceiro?{" "}
                <button
                  type="button"
                  onClick={() => { setIsLogin(true); router.push("/provider/login"); }}
                  className="text-green-600 font-semibold hover:text-green-700 underline-offset-4 hover:underline"
                >
                  Fazer Login
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

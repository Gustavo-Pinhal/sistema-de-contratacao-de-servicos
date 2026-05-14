"use client";

import { useState, useEffect } from "react";
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
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";

// Se você tiver o componente PricingCards, certifique-se de movê-lo para src/app/components
// import { PricingCards } from "@/app/components/PricingCards";

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

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    service: "",
    city: "",
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  useEffect(() => {
    setIsLogin(searchParams.get("mode") !== "register");
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isLogin) {
      setLoading(true);
      const success = await login(formData.email, formData.password);
      if (success) {
        router.push("/provider/dashboard");
      } else {
        setError("Credenciais inválidas para prestador.");
        setLoading(false);
      }
    } else {
      // Fluxo de Cadastro (Multi-step)
      if (step === 1) {
        setStep(2);
      } else if (step === 2) {
        if (selectedPlan === "free") {
          // Aqui você chamaria seu endpoint de registro real
          alert("Cadastro gratuito enviado!");
          router.push("/dashboard");
        } else {
          setStep(3);
        }
      } else {
        // Finalização com pagamento (Premium)
        alert("Assinatura Premium processada!");
        router.push("/dashboard");
      }
    }
  };

  // Sub-componente para renderizar os steps (simplificado para o exemplo)
  const renderStep = () => {
    if (isLogin || step === 1) {
      return (
        <div className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                Nome Profissional
              </label>
              <input
                type="text"
                required
                className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                required
                className="w-full pl-10 p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
          </div>
          {!isLogin && (
            <div className="grid grid-cols-2 gap-3">
              <input
                type="tel"
                placeholder="WhatsApp"
                className="w-full p-3 bg-white border border-gray-200 rounded-xl"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Cidade"
                className="w-full p-3 bg-white border border-gray-200 rounded-xl"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full pl-10 pr-10 p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-green-700 shadow-lg shadow-green-100 transition-all"
          >
            {loading ? "Entrando..." : isLogin ? "Entrar" : "Próximo Passo"}
          </button>
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className="space-y-6 text-center">
          <h3 className="text-xl font-bold">Escolha seu plano</h3>
          <div className="grid grid-cols-1 gap-4">
            <div
              onClick={() => setSelectedPlan("free")}
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedPlan === "free" ? "border-green-600 bg-green-50" : "border-gray-100"}`}
            >
              <p className="font-bold">Plano Grátis</p>
              <p className="text-xs text-gray-500">
                Apareça nas buscas básicas
              </p>
            </div>
            <div
              onClick={() => setSelectedPlan("premium")}
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedPlan === "premium" ? "border-green-600 bg-green-50" : "border-gray-100"}`}
            >
              <p className="font-bold text-green-600">Plano Premium ✨</p>
              <p className="text-xs text-gray-500">
                Destaque total e selo de verificado
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setStep(1)}
            >
              Voltar
            </Button>
            <Button
              className="flex-1 bg-green-600 text-white"
              onClick={handleSubmit}
            >
              Continuar
            </Button>
          </div>
        </div>
      );
    }

    return null; // Adicione o step 3 (Checkout) seguindo a mesma lógica se necessário
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Lado Esquerdo - Imagem (Next.js Link/Img) */}
      <div className="hidden lg:block relative w-0 flex-1">
        <img
          src="https://images.unsplash.com/photo-1678803262992-d79d06dd5d96?q=80&w=1080"
          alt="Profissional"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-green-900/80 to-green-600/40" />
        <div className="absolute bottom-0 p-12 text-white">
          <h3 className="text-4xl font-black mb-4">
            Sua carreira, nossas oportunidades.
          </h3>
          <p className="text-lg text-green-50 opacity-90">
            Multiplique seus ganhos com total flexibilidade.
          </p>
        </div>
      </div>

      {/* Lado Direito - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-6 lg:px-20">
        <div className="mx-auto w-full max-w-sm">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-green-600 font-bold mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-100">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 uppercase">
              {isLogin ? "Área do Prestador" : "Cadastro"}
            </h2>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs font-bold mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>{renderStep()}</form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setStep(1);
                router.push(
                  `/provider/login${isLogin ? "?mode=register" : ""}`,
                );
              }}
              className="text-green-600 font-black uppercase text-[10px] tracking-widest"
            >
              {isLogin ? "Quero ser um parceiro" : "Já tenho conta"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

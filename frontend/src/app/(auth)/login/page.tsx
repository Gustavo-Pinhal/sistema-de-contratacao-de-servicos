"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShoppingBag,
  ArrowLeft,
  User,
  Phone,
  Briefcase,
  MapPin,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useUser } from "@/context/UserContext";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, register } = useUser();

  // Estados de controle
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Detecta o papel do usuário (client, provider, business)
  const role =
    (searchParams.get("role") as "client" | "provider" | "business") ||
    "client";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    city: "",
  });

  useEffect(() => {
    setIsLogin(searchParams.get("mode") !== "register");
    setStep(1);
    setError("");
  }, [searchParams]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (isLogin) {
      const success = await login(formData.email, formData.password);
      if (success) {
        // Redireciona conforme a role após login real
        router.push(role === "client" ? "/search" : "/dashboard");
      } else {
        setError("E-mail ou senha incorretos.");
        setLoading(false);
      }
    } else {
      // Fluxo de Registro
      if (role === "provider" && step === 1) {
        setStep(2);
        setLoading(false);
        return;
      }

      const result = await register({ ...formData, role });
      if (result.success) {
        const logged = await login(formData.email, formData.password);
        if (logged) router.push(role === "client" ? "/search" : "/dashboard");
      } else {
        setError(result.error || "Falha ao realizar cadastro.");
        setLoading(false);
      }
    }
  };

  // Cores dinâmicas baseadas na role
  const themeColor =
    role === "client" ? "blue" : role === "provider" ? "green" : "purple";
  const ThemeIcon = role === "client" ? ShoppingBag : Briefcase;

  return (
    <div className="min-h-screen bg-white flex">
      {/* Lado Esquerdo - Formulário */}
      <div className="flex-1 flex flex-col justify-center py-12 px-6 lg:px-20 xl:px-32">
        <div className="mx-auto w-full max-w-sm">
          <Link
            href="/"
            className={`inline-flex items-center gap-2 text-${themeColor}-600 hover:opacity-80 mb-8 font-black text-[10px] uppercase tracking-[0.2em]`}
          >
            <ArrowLeft className="w-4 h-4" /> Voltar ao Início
          </Link>

          <div className="flex items-center gap-4 mb-8">
            <div
              className={`w-14 h-14 bg-${themeColor}-600 rounded-2xl flex items-center justify-center shadow-xl shadow-${themeColor}-100 rotate-3`}
            >
              <ThemeIcon className="w-7 h-7 text-white -rotate-3" />
            </div>
            <div>
              <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                {role === "client" ? "Área do Cliente" : "Área Profissional"}
              </h2>
              <h1 className="text-3xl font-black text-gray-900 tracking-tighter">
                {isLogin ? "Bem-vindo!" : "Criar Conta"}
              </h1>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-[11px] font-black uppercase tracking-tight rounded-2xl border border-red-100 animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {/* Step 1 ou Login */}
            {(isLogin || step === 1) && (
              <>
                {!isLogin && (
                  <div className="animate-in fade-in slide-in-from-bottom-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">
                      Nome Completo
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        required
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-200 outline-none font-bold text-slate-700"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      required
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-200 outline-none font-bold text-slate-700"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      className="w-full pl-12 pr-12 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-200 outline-none font-bold text-slate-700"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Step 2 - Apenas Cadastro de Provedor */}
            {!isLogin && step === 2 && role === "provider" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">
                    WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      required
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-200 outline-none font-bold text-slate-700"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">
                    Cidade de Atuação
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-200 outline-none font-bold text-slate-700"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-${themeColor}-600 text-white py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:opacity-90 transition-all disabled:opacity-50 shadow-xl shadow-${themeColor}-100 mt-4`}
            >
              {loading
                ? "Aguarde..."
                : isLogin
                  ? "Acessar Conta"
                  : step === 1 && role === "provider"
                    ? "Próximo Passo"
                    : "Finalizar"}
            </button>

            <div className="text-center pt-6">
              <button
                type="button"
                onClick={() => {
                  const newMode = isLogin ? "register" : "login";
                  router.push(`/login?role=${role}&mode=${newMode}`);
                }}
                className={`text-${themeColor}-600 font-black uppercase tracking-widest text-[10px] hover:underline transition-all`}
              >
                {isLogin
                  ? "Ainda não tem conta? Clique aqui"
                  : "Já possui conta? Faça login"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Lado Direito - Banner Informativo */}
      <div
        className={`hidden lg:block relative w-0 flex-1 bg-${themeColor}-600 overflow-hidden`}
      >
        <img
          src={
            role === "client"
              ? "https://images.unsplash.com/photo-1603714228681-b399854b8f80?q=80&w=1080"
              : "https://images.unsplash.com/photo-1678803262992-d79d06dd5d96?q=80&w=1080"
          }
          alt="Banner"
          className="absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-overlay"
        />
        <div className="absolute inset-0 flex flex-col justify-center p-20 text-white">
          <div className="max-w-md">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full mb-6 border border-white/20">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Plataforma Líder
              </span>
            </div>
            <h3 className="text-5xl font-black mb-6 uppercase tracking-tighter italic leading-none">
              {role === "client"
                ? "Sua casa em boas mãos."
                : "Seu talento, seu negócio."}
            </h3>
            <ul className="space-y-4">
              {[
                "Profissionais Verificados",
                role === "client" ? "Pagamento Seguro" : "Gestão de Orçamentos",
                "Suporte 24h especializado",
              ].map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-3 font-bold opacity-90"
                >
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center font-black uppercase tracking-widest text-slate-400">
          Carregando...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

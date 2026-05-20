"use client";

import { useState, useEffect, useRef, Suspense } from "react";
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
  Loader2,
  Check,
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

  const [profissoes, setProfissoes] = useState<{ id: number; descricao: string }[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const providerPlans = [
    {
      id: "free",
      name: "Plano Grátis",
      price: "R$ 0,00",
      description: "Para profissionais que estão começando.",
      features: ["Perfil básico", "1 categoria de serviço", "Receber solicitações", "Chat com clientes", "Atendimento padrão"],
      isPopular: false,
    },
    {
      id: "premium",
      name: "Plano Premium",
      price: "R$ 29,90",
      description: "Para quem quer dominar os pedidos da região.",
      features: ["Destaque nos resultados", "Múltiplas categorias (até 5)", "Selo de Profissional Premium", "Suporte prioritário", "Estatísticas de visitas", "Taxa de serviço reduzida"],
      isPopular: true,
    },
  ];
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
    cidade: "",
    profissao: "",
  });
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState("");

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocalização não suportada pelo navegador.");
      return;
    }
    setGeoLoading(true);
    setGeoError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=pt-BR`,
            { headers: { "User-Agent": "ServicoFacil/1.0" } }
          );
          const data = await res.json();
          const cidade = data.address?.city || data.address?.town || data.address?.village || "";
          const estado = data.address?.state_code || "";
          setFormData((prev) => ({ ...prev, cidade: estado ? `${cidade}, ${estado}` : cidade }));
        } catch {
          setGeoError("Não foi possível obter a localização.");
        } finally {
          setGeoLoading(false);
        }
      },
      () => {
        setGeoError("Permissão negada. Digite sua cidade manualmente.");
        setGeoLoading(false);
      }
    );
  };

  useEffect(() => {
    setIsLogin(searchParams.get("mode") !== "register");
    setStep(1);
    setError("");
  }, [searchParams]);

  useEffect(() => {
    if (role === "provider") {
      fetch("/api/ui/profissoes")
        .then((r) => (r.ok ? r.json() : []))
        .then(setProfissoes)
        .catch(() => {});
    }
  }, [role]);


  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (isLogin) {
      const loggedRole = await login(formData.email, formData.password);
      if (loggedRole) {
        const normalized = String(loggedRole).toUpperCase();
        if (normalized === "ROLE_ADMIN") {
          router.push("/admin");
        } else {
          router.push(role === "client" ? "/search" : "/dashboard");
        }
      } else {
        setError("E-mail ou senha incorretos.");
        setLoading(false);
      }
    } else {
      if (role === "provider" && step === 1) {
        if (formData.password !== formData.confirmPassword) {
          setError("As senhas não coincidem.");
          setLoading(false);
          return;
        }
        setStep(2);
        setLoading(false);
        return;
      }

      if (role === "provider" && step === 2) {
        if (selectedPlan === "free") {
          await doRegister();
        } else {
          setStep(3);
          setLoading(false);
        }
        return;
      }

      if (role === "provider" && step === 3) {
        await doRegister();
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
          cidade: formData.cidade,
          profissao: Number(formData.profissao),
        }),
      });
      if (res.ok) {
        const logged = await login(formData.email, formData.password);
        if (logged) router.push("/dashboard");
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || data.detail || "Erro ao realizar cadastro.");
      }
    } catch {
      setError("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
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

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-12 h-12 bg-${themeColor}-600 rounded-2xl flex items-center justify-center shadow-lg shadow-${themeColor}-100 shrink-0`}
              >
                <ThemeIcon className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                    {!isLogin && role === "provider" ? "Cadastro Profissional" : role === "client" ? "Área do Cliente" : "Área Profissional"}
                  </p>
                  {!isLogin && role === "provider" && (
                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full leading-none">
                      Passo {step} de 3
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-0.5 leading-tight">
                  {isLogin
                    ? (role === "provider" ? "Área do Prestador" : "Bem-vindo!")
                    : (role === "provider"
                        ? (step === 1 ? "Transforme sua carreira" : step === 2 ? "Escolha seu plano" : "Finalize o pagamento")
                        : "Criar Conta")}
                </h1>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-[11px] font-black uppercase tracking-tight rounded-2xl border border-red-100 animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {/* Login ou Cadastro Cliente */}
            {(isLogin || (step === 1 && role !== "provider")) && (
              <>
                {!isLogin && (
                  <div>
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
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Cadastro Prestador - Step 1: todos os campos */}
            {!isLogin && step === 1 && role === "provider" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Seu nome profissional"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone/WhatsApp *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      required
                      placeholder="(11) 99999-9999"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Serviço Principal *</label>
                  <select
                    required
                    value={formData.profissao}
                    onChange={(e) => setFormData({ ...formData, profissao: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Selecione seu serviço</option>
                    {profissoes.map((p) => (
                      <option key={p.id} value={p.id}>{p.descricao}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">Cidade *</label>
                    <button
                      type="button"
                      onClick={handleGeolocate}
                      disabled={geoLoading}
                      className="flex items-center gap-1 text-[11px] font-bold text-green-600 hover:text-green-700 disabled:opacity-50"
                    >
                      {geoLoading
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : <MapPin className="w-3 h-3" />}
                      {geoLoading ? "Detectando..." : "Usar minha localização"}
                    </button>
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      placeholder="Ex: São Paulo, SP"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={formData.cidade}
                      onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    />
                  </div>
                  {geoError && <p className="text-[11px] text-red-500 font-bold mt-1">{geoError}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Senha *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Senha *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        confirmPasswordError ? "border-red-400" : "border-gray-300"
                      }`}
                      value={formData.confirmPassword}
                      onChange={(e) => {
                        setFormData({ ...formData, confirmPassword: e.target.value });
                        setConfirmPasswordError(e.target.value !== formData.password ? "As senhas não coincidem" : "");
                      }}
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {confirmPasswordError && <p className="text-[11px] text-red-500 font-bold mt-1">{confirmPasswordError}</p>}
                </div>
              </div>
            )}

            {/* Cadastro Prestador - Step 2: Planos */}
            {!isLogin && step === 2 && role === "provider" && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900">Turbine seus resultados</h3>
                  <p className="text-sm text-gray-500 mt-1">Selecione o plano ideal para sua carreira</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {providerPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`relative flex flex-col p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                        selectedPlan === plan.id
                          ? "border-green-500 bg-green-50/40 ring-2 ring-green-500 ring-offset-1"
                          : "border-gray-200 bg-white hover:border-green-300"
                      }`}
                    >
                      {plan.isPopular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                          Mais Popular
                        </div>
                      )}
                      <h4 className="text-lg font-bold text-gray-900">{plan.name}</h4>
                      <div className="flex items-baseline gap-1 mt-1 mb-1">
                        <span className="text-2xl font-black text-gray-900">{plan.price}</span>
                        <span className="text-xs text-gray-500">/mês</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-3">{plan.description}</p>
                      <ul className="space-y-1.5 flex-1 mb-4">
                        {plan.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                            <Check className="w-3.5 h-3.5 mt-0.5 shrink-0 text-green-500" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        onClick={() => setSelectedPlan(plan.id)}
                        className={`w-full py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                          selectedPlan === plan.id
                            ? "border-green-500 bg-green-500 text-white"
                            : "border-green-500 text-green-600 hover:bg-green-50"
                        }`}
                      >
                        {selectedPlan === plan.id ? "Plano Selecionado" : "Selecionar Plano"}
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 rounded-2xl border-2 border-gray-200 font-semibold text-gray-600 hover:border-gray-300 transition-all"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedPlan || loading}
                    className="flex-[2] py-3 rounded-2xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Continuar"}
                  </button>
                </div>
              </div>
            )}

            {/* Cadastro Prestador - Step 3: Pagamento */}
            {!isLogin && step === 3 && role === "provider" && (
              <div className="space-y-5">
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-green-700 font-semibold uppercase tracking-wide">Plano selecionado</p>
                    <p className="text-lg font-black text-green-800">Plano Premium</p>
                    <p className="text-sm text-green-600">R$ 29,90/mês</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-xs text-green-600 underline hover:text-green-800"
                  >
                    Trocar plano
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Número do Cartão *</label>
                  <input
                    type="text"
                    required
                    maxLength={19}
                    placeholder="0000 0000 0000 0000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Validade *</label>
                    <input
                      type="text"
                      required
                      maxLength={5}
                      placeholder="MM/AA"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CVV *</label>
                    <input
                      type="text"
                      required
                      maxLength={3}
                      placeholder="123"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome no Cartão *</label>
                  <input
                    type="text"
                    required
                    placeholder="Como aparece no cartão"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent uppercase"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 py-3 rounded-2xl border-2 border-gray-200 font-semibold text-gray-600 hover:border-gray-300 transition-all"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] py-3 rounded-2xl bg-green-600 text-white font-bold hover:bg-green-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Finalizar Cadastro"}
                  </button>
                </div>
              </div>
            )}

            {!(role === "provider" && !isLogin && step === 2) && !(role === "provider" && !isLogin && step === 3) && (
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-${themeColor}-600 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-${themeColor}-100 mt-2`}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isLogin ? (
                  "Acessar Conta"
                ) : step === 1 && role === "provider" ? (
                  <>{"Próximo Passo"} <Sparkles className="w-4 h-4" /></>
                ) : (
                  "Finalizar"
                )}
              </button>
            )}

            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => {
                  const newMode = isLogin ? "register" : "login";
                  router.push(`/login?role=${role}&mode=${newMode}`);
                }}
                className={`text-${themeColor}-600 font-semibold text-sm hover:underline transition-all`}
              >
                {isLogin
                  ? "Ainda não tem conta? Clique aqui"
                  : role === "provider" ? "Já é nosso parceiro? Fazer Login" : "Já possui conta? Faça login"}
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

"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { useUser } from "@/app/context/UserContext";

export default function ClientLoginPage() {
  const { login, register } = useUser(); // register vindo do context
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
  });

  useEffect(() => {
    setIsLogin(searchParams.get("mode") !== "register");
    setError(""); // Limpa erro ao trocar de modo
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (isLogin) {
      const success = await login(formData.email, formData.password);
      if (success) {
        router.push("/search");
      } else {
        setError("E-mail ou senha incorretos.");
        setLoading(false);
      }
    } else {
      // Implementação do Registro
      const result = await register(formData);
      if (result.success) {
        // Após cadastrar, fazemos o login automático ou pedimos para logar
        const logged = await login(formData.email, formData.password);
        if (logged) router.push("/search");
      } else {
        setError(result.error || "Falha no cadastro");
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 font-bold text-xs uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-100">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">
              {isLogin ? "Login" : "Cadastro"}
            </h2>
          </div>

          <h1 className="text-4xl font-black text-blue-600 mb-6 leading-tight">
            {isLogin ? "Bom ver você!" : "Junte-se a nós."}
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-[11px] font-black uppercase tracking-tight rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none font-bold text-slate-700"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                    WhatsApp / Telefone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      required
                      placeholder="11999999999"
                      className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none font-bold text-slate-700"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none font-bold text-slate-700"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full pl-12 pr-12 py-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none font-bold text-slate-700"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-100"
            >
              {loading
                ? "Processando..."
                : isLogin
                  ? "Entrar Agora"
                  : "Finalizar Cadastro"}
            </button>

            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => {
                  const newMode = isLogin ? "register" : "login";
                  setIsLogin(!isLogin);
                  router.push(`/client/login?mode=${newMode}`);
                }}
                className="text-blue-600 font-black uppercase tracking-widest text-[10px] hover:underline"
              >
                {isLogin
                  ? "Ainda não tem conta? Crie aqui"
                  : "Já possui conta? Faça login"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="hidden lg:block relative w-0 flex-1 bg-blue-600 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1603714228681-b399854b8f80?q=80&w=1080"
          alt="Interface"
          className="absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-linear-to-t from-blue-900 via-transparent flex items-end p-16">
          <div className="max-w-md">
            <h3 className="text-4xl font-black text-white mb-4 uppercase tracking-tighter italic">
              Qualidade & Confiança
            </h3>
            <p className="text-blue-100 font-bold leading-relaxed">
              Conectamos você aos melhores prestadores de serviço da sua região
              com a segurança que você merece.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

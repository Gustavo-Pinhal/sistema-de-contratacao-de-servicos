"use client"; // Obrigatório no Next.js para formulários

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // Substitui react-router
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, ShoppingBag, ArrowLeft } from "lucide-react";
import { useUser } from "@/app/context/UserContext";

export default function ClientLoginPage() {
  const { login } = useUser();
  const router = useRouter(); // Hook do Next.js
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

  // Sincroniza o estado isLogin com o parâmetro da URL (?mode=register)
  useEffect(() => {
    setIsLogin(searchParams.get("mode") !== "register");
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (isLogin) {
      // Chamada real para o seu backend via Contexto
      const success = await login(formData.email, formData.password);
      if (success) {
        router.push("/"); // Redireciona para a home pós-login
      } else {
        setError("E-mail ou senha incorretos. Tente novamente.");
        setLoading(false);
      }
    } else {
      // TODO: Implementar função register no Contexto chamando POST /api/register
      alert(
        "O cadastro será implementado conectando ao seu endpoint de registro.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 font-bold"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-100">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase leading-none">
                {isLogin ? "Login" : "Cadastro"}
              </h2>
            </div>
          </div>

          <h1 className="text-4xl font-black text-blue-600 mb-2">
            {isLogin ? "Bem-vindo!" : "Criar conta"}
          </h1>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-5 py-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none font-bold"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none font-bold"
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
                  className="w-full pl-12 pr-12 py-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none font-bold"
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
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              {loading
                ? "Carregando..."
                : isLogin
                  ? "Entrar Agora"
                  : "Criar minha conta"}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  router.push(
                    `/client/login${isLogin ? "?mode=register" : ""}`,
                  );
                }}
                className="text-blue-600 font-black uppercase tracking-widest text-xs"
              >
                {isLogin
                  ? "Não tem uma conta? Cadastre-se"
                  : "Já tem uma conta? Login"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Lado Direito - Imagem (Next.js recomenda usar a tag img simples se a URL for externa ou o componente <Image />) */}
      <div className="hidden lg:block relative w-0 flex-1 bg-blue-600">
        <img
          src="https://images.unsplash.com/photo-1603714228681-b399854b8f80?q=80&w=1080"
          alt="Cliente feliz"
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent flex items-end p-12">
          <div className="text-white">
            <h3 className="text-3xl font-bold mb-2">
              Profissionais qualificados
            </h3>
            <p className="text-blue-100">
              Segurança e agilidade para o seu dia a dia.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, Building2, ArrowLeft } from "lucide-react";
import { useUser } from "@/context/UserContext";

export default function CompanyLoginPage() {
  const router = useRouter();
  const { login } = useUser();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Executa a autenticação no contexto global
      const success = await login(formData.email, formData.password);
      if (success) {
        router.push("/enterprise/dashboard");
      } else {
        setError("Credenciais corporativas inválidas ou inexistentes.");
        setLoading(false);
      }
    } catch (err) {
      setError(
        "Erro ao tentar realizar o login organizacional. Tente novamente.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex selection:bg-purple-500 selection:text-white">
      {/* Lado Esquerdo - Banner Visual Corporativo Roxo */}
      <div className="hidden lg:block relative w-0 flex-1">
        <img
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1080"
          alt="Fachada corporativa moderna espelhada"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-purple-950/90 via-purple-900/60 to-purple-700/30" />
        <div className="absolute bottom-0 p-16 text-white max-w-xl">
          <span className="bg-purple-500/30 border border-purple-400/30 text-purple-300 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 inline-block backdrop-blur-sm">
            Exclusivo para Empresas Parceiras
          </span>
          <h3 className="text-4xl font-black mb-4 leading-tight">
            Gerencie demandas organizacionais em lote.
          </h3>
          <p className="text-lg text-purple-100/90 font-medium">
            Acesse seu painel institucional para gerenciar os prestadores
            locados, pagamentos e faturamentos consolidados.
          </p>
        </div>
      </div>

      {/* Lado Direito - Formulário Simplificado de Login */}
      <div className="flex-1 flex flex-col justify-center py-12 px-6 sm:px-12 lg:px-20 bg-white lg:bg-transparent">
        <div className="mx-auto w-full max-w-md bg-white p-4 sm:p-8 rounded-2xl lg:shadow-none shadow-xl shadow-gray-200/50">
          {/* Link Voltar Home */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-bold text-sm mb-8 group transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />{" "}
            Voltar para o início
          </Link>

          {/* Cabeçalho */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                Área da Empresa
              </h2>
              <p className="text-xs text-gray-400 font-medium">
                Acesse sua conta institucional parceira
              </p>
            </div>
          </div>

          {/* Mensagem de Erro Dinâmica */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-r-xl text-xs font-bold mb-6">
              {error}
            </div>
          )}

          {/* Formulário de Login */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Campo: Email */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                E-mail Corporativo
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  placeholder="empresa@organizacao.com"
                  className="w-full pl-10 p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Campo: Senha */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                Senha de Acesso
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Botão de Ação Principal */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-purple-700 shadow-lg shadow-purple-100 transition-all disabled:opacity-50 mt-2"
            >
              {loading ? "Autenticando..." : "Entrar no Painel"}
            </button>
          </form>

          {/* Aviso Informativo sobre o fluxo corporativo */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-relaxed">
              Sua empresa não possui acesso? <br />
              <span className="text-slate-500">
                Contate um administrador global do sistema para liberar suas
                credenciais.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

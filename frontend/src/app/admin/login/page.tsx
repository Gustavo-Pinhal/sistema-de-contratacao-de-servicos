"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Shield,
  Loader2,
} from "lucide-react";
import { useUser } from "@/context/UserContext";

function AdminLoginContent() {
  const router = useRouter();
  const { login } = useUser();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const success = await login(formData.email, formData.password);

    if (success) {
      router.push("/admin/dashboard");
    } else {
      setError("E-mail ou senha de administrador incorretos.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        {/* Link de Retorno */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 mb-6 font-bold text-xs uppercase tracking-widest transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao Início
        </Link>

        {/* Card Principal */}
        <div className="bg-white rounded-3xl p-8 md:p-10 border border-slate-200 shadow-xl shadow-slate-200/50">
          {/* Cabeçalho */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                Área Restrita
              </h2>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Acesso do Administrador
              </h1>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-xs font-bold rounded-2xl border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleAdminAuth} className="space-y-5">
            {/* Campo: E-mail */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                E-mail
              </label>
              <div className="relative rounded-2xl border border-slate-200 bg-slate-50 focus-within:border-blue-600 focus-within:bg-white focus-within:shadow-md focus-within:shadow-blue-600/5 transition-all">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-transparent outline-none font-bold text-slate-800 placeholder-slate-400 text-sm"
                  placeholder="admin@exemplo.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Campo: Senha */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Senha
              </label>
              <div className="relative rounded-2xl border border-slate-200 bg-slate-50 focus-within:border-blue-600 focus-within:bg-white focus-within:shadow-md focus-within:shadow-blue-600/5 transition-all">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full pl-12 pr-12 py-4 bg-transparent outline-none font-bold text-slate-800 placeholder-slate-400 text-sm"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Botão de Envio */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 px-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-600/10 mt-6 active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>Autenticando...</span>
                </>
              ) : (
                <span>Acessar Painel</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center font-black uppercase tracking-widest text-slate-400">
          Carregando...
        </div>
      }
    >
      <AdminLoginContent />
    </Suspense>
  );
}

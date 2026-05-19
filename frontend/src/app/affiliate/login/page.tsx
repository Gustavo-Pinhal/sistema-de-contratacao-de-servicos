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
  User,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { useUser } from "@/context/UserContext";

interface Profissao {
  id: number;
  descricao: string;
}

export default function AffiliateLoginPage() {
  const router = useRouter();
  const { login } = useUser();
  const searchParams = useSearchParams();

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profissoes, setProfissoes] = useState<Profissao[]>([]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    profissaoId: "",
    cep: "",
  });

  // Alterna o modo baseado na URL (?mode=register)
  useEffect(() => {
    setIsLogin(searchParams.get("mode") !== "register");
    setError("");
  }, [searchParams]);

  // Carrega a lista de profissões do backend caso seja tela de cadastro
  useEffect(() => {
    if (!isLogin) {
      async function fetchProfissoes() {
        try {
          const res = await fetch("https://localhost/api/ui/profissoes");
          if (res.ok) {
            const data = await res.json();
            setProfissoes(data);
          }
        } catch (err) {
          console.error("Erro ao buscar profissões:", err);
        }
      }
      fetchProfissoes();
    }
  }, [isLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (isLogin) {
      // FLUXO DE LOGIN
      try {
        const success = await login(formData.email, formData.password);
        if (success) {
          router.push("/affiliate/dashboard");
        } else {
          setError("Credenciais inválidas para prestador.");
          setLoading(false);
        }
      } catch (err) {
        setError("Erro ao tentar realizar o login. Tente novamente.");
        setLoading(false);
      }
    } else {
      // FLUXO DE CADASTRO (TELA ÚNICA)
      try {
        const payload = {
          nome: formData.name,
          email: formData.email,
          profissao: Number(formData.profissaoId),
          cep: formData.cep.replace(/\D/g, ""), // Remove hifens ou espaços se houver
          senha: formData.password,
        };

        const response = await fetch(
          "https://localhost/api/cadastro/prestador",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          },
        );

        const data = await response.json();

        if (response.ok && data.success) {
          alert("Cadastro realizado com sucesso!");
          // Faz login automático ou redireciona
          const autoLogin = await login(formData.email, formData.password);
          if (autoLogin) {
            router.push("/affiliate/dashboard");
          } else {
            router.push("/affiliate/login");
          }
        } else {
          // Captura e formata erros tratados do backend
          if (data.errors) {
            const firstError = Object.values(data.errors)[0] as string;
            setError(firstError);
          } else if (data.message) {
            setError(data.message);
          } else if (data.detail) {
            setError(data.detail);
          } else {
            setError(
              "Não foi possível concluir o cadastro. Verifique os dados.",
            );
          }
        }
      } catch (err) {
        setError("Falha na conexão com o servidor.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex selection:bg-green-500 selection:text-white">
      {/* Lado Esquerdo - Banner Visual */}
      <div className="hidden lg:block relative w-0 flex-1">
        <img
          src="https://images.unsplash.com/photo-1678803262992-d79d06dd5d96?q=80&w=1080"
          alt="Profissional prestador de serviços"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-green-950/90 via-green-900/60 to-green-700/30" />
        <div className="absolute bottom-0 p-16 text-white max-w-xl">
          <span className="bg-green-500/30 border border-green-400/30 text-green-300 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 inline-block backdrop-blur-sm">
            Exclusivo para Prestadores
          </span>
          <h3 className="text-4xl font-black mb-4 leading-tight">
            Sua carreira, nossas oportunidades.
          </h3>
          <p className="text-lg text-green-100/90 font-medium">
            Aumente seu faturamento diário recebendo pedidos direto na sua
            região de atendimento.
          </p>
        </div>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="flex-1 flex flex-col justify-center py-12 px-6 sm:px-12 lg:px-20 bg-white lg:bg-transparent">
        <div className="mx-auto w-full max-w-md bg-white p-4 sm:p-8 rounded-2xl lg:shadow-none shadow-xl shadow-gray-200/50">
          {/* Link Voltar Home */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-bold text-sm mb-8 group transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />{" "}
            Voltar para o início
          </Link>

          {/* Cabeçalho */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-200">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                {isLogin ? "Área do Prestador" : "Seja um Parceiro"}
              </h2>
              <p className="text-xs text-gray-400 font-medium">
                {isLogin
                  ? "Acesse sua conta profissional"
                  : "Preencha os dados abaixo para começar"}
              </p>
            </div>
          </div>

          {/* Mensagem de Erro Dinâmica */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-r-xl text-xs font-bold mb-6">
              {error}
            </div>
          )}

          {/* Formulário Único */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {!isLogin && (
              <>
                {/* Campo: Nome (Apenas no Cadastro) */}
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      placeholder="Ex: Carlos Marceneiro"
                      className="w-full pl-10 p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Campo: Profissão Select (Apenas no Cadastro) */}
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                      Profissão
                    </label>
                    <select
                      required
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-sm appearance-none"
                      value={formData.profissaoId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          profissaoId: e.target.value,
                        })
                      }
                    >
                      <option value="">Selecione...</option>
                      {profissoes.map((prof) => (
                        <option key={prof.id} value={prof.id}>
                          {prof.descricao}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Campo: CEP (Apenas no Cadastro) */}
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                      CEP de Atendimento
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        required
                        maxLength={8}
                        placeholder="01001000"
                        className="w-full pl-9 p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-sm"
                        value={formData.cep}
                        onChange={(e) =>
                          setFormData({ ...formData, cep: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Campo: Email (Login e Cadastro) */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  placeholder="exemplo@email.com"
                  className="w-full pl-10 p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Campo: Senha (Login e Cadastro) */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
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
              className="w-full bg-green-600 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-green-700 shadow-lg shadow-green-100 transition-all disabled:opacity-50 mt-2"
            >
              {loading
                ? "Processando..."
                : isLogin
                  ? "Entrar"
                  : "Concluir Cadastro"}
            </button>
          </form>

          {/* Alternador de Modos (Login / Cadastro) */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <button
              type="button"
              onClick={() => {
                const newMode = isLogin ? "register" : "login";
                router.push(`/affiliate/login?mode=${newMode}`);
              }}
              className="text-green-600 hover:text-green-700 font-black uppercase text-[11px] tracking-widest transition-colors block w-full text-center"
            >
              {isLogin
                ? "Quero me cadastrar como parceiro →"
                : "Já tenho cadastro? Fazer Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

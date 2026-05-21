"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Star, TrendingUp, Loader2 } from "lucide-react";
import { useUser } from "@/context/UserContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost";

const planosGratis = [
  "Perfil básico",
  "1 categoria de serviço",
  "Receber solicitações",
  "Chat com clientes",
  "Atendimento padrão",
];

const planosPremium = [
  "Destaque nos resultados",
  "Múltiplas categorias (até 5)",
  "Selo de Profissional Premium",
  "Suporte prioritário",
  "Estatísticas de visitas",
  "Taxa de serviço reduzida",
];

export default function SubscriptionPage() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!user?.token) return;
    fetch(`${API_BASE_URL}/api/areaprestador/dashboard`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.filiado !== undefined) setIsPremium(!!data?.premium);
      })
      .catch(() => {});
  }, [user?.token]);

  const handleUpgrade = async () => {
    if (!user?.token) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/areaprestador/assinar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setIsPremium(true);
        setSuccessMsg(data.message || "Plano Premium ativado!");
        setTimeout(() => router.push("/affiliate/dashboard"), 2000);
      } else {
        setErrorMsg(data.message || "Erro ao ativar o plano.");
      }
    } catch {
      setErrorMsg("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Voltar */}
        <Link
          href="/affiliate/dashboard"
          className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-8 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao painel
        </Link>

        {/* Alertas */}
        {successMsg && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 font-bold text-sm">
            ✓ {successMsg} Redirecionando...
          </div>
        )}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 font-bold text-sm">
            {errorMsg}
          </div>
        )}

        {/* Título */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-gray-900">Gerenciar Assinatura</h1>
          <p className="text-gray-500 mt-2">
            Escolha o plano ideal para expandir seus negócios e conquistar mais clientes
          </p>
        </div>

        {/* Plano Atual */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 mb-8 shadow-sm">
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <p className="font-black text-gray-900">
              Plano Atual: {isPremium ? "Premium" : "Grátis"}
            </p>
            <p className="text-sm text-gray-500">
              {isPremium
                ? "Você está no plano Premium"
                : "Você está usando o plano gratuito"}
            </p>
          </div>
        </div>

        {/* Cards de Planos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Plano Grátis */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm flex flex-col">
            <div className="text-center mb-6">
              <h2 className="text-xl font-black text-gray-900 mb-3">Plano Grátis</h2>
              <div className="flex items-end justify-center gap-1">
                <span className="text-lg font-bold text-gray-500">R$</span>
                <span className="text-5xl font-black text-gray-900">0,00</span>
                <span className="text-gray-400 mb-1">/mês</span>
              </div>
            </div>

            <ul className="space-y-3 flex-1 mb-8">
              {planosGratis.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <button
              disabled
              className="w-full py-3 bg-gray-100 text-gray-400 rounded-xl font-black text-sm uppercase tracking-wider cursor-not-allowed"
            >
              Plano Atual
            </button>
          </div>

          {/* Plano Premium */}
          <div className="bg-white border-2 border-green-500 rounded-2xl p-8 shadow-lg flex flex-col relative">
            {/* Badge Mais Popular */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1.5 bg-green-600 text-white text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                <TrendingUp className="w-3.5 h-3.5" />
                Mais Popular
              </span>
            </div>

            <div className="text-center mb-6 mt-2">
              <h2 className="text-xl font-black text-gray-900 mb-3">Plano Premium</h2>
              <div className="flex items-end justify-center gap-1">
                <span className="text-lg font-bold text-gray-500">R$</span>
                <span className="text-5xl font-black text-gray-900">29,90</span>
                <span className="text-gray-400 mb-1">/mês</span>
              </div>
            </div>

            <ul className="space-y-3 flex-1 mb-8">
              {planosPremium.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            {isPremium ? (
              <button
                disabled
                className="w-full py-3 bg-gray-100 text-gray-400 rounded-xl font-black text-sm uppercase tracking-wider cursor-not-allowed"
              >
                Plano Atual
              </button>
            ) : (
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black text-sm uppercase tracking-wider transition-colors shadow-lg shadow-green-100 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Fazer Upgrade
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

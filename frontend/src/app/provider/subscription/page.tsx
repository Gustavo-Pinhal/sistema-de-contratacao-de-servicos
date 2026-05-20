"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Crown, Check, Star, Loader2 } from "lucide-react";
import { useUser } from "@/context/UserContext";

export default function SubscriptionPage() {
  const { user, login } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [providerName, setProviderName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isPremium = user?.role === "ROLE_PREMIUM";

  useEffect(() => {
    async function init() {
      if (!user?.token) return;
      try {
        const res = await fetch("/api/prestador/perfil/editar", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (res.ok) {
          const p = await res.json();
          setProviderName(p.nomeProfissional || p.nome || "");
        }
      } catch (_) {
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [user?.token]);

  const handleAssinarPremium = async () => {
    if (!user?.token) return;
    setSubscribing(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/areaprestador/assinar-premium", {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        const newRole = await login(email, password);
        if (newRole) {
          router.push("/dashboard");
        } else {
          setErrorMsg("Plano ativado! Faca login novamente para atualizar.");
        }
      } else {
        setErrorMsg("Erro ao ativar o plano. Tente novamente.");
      }
    } catch (_) {
      setErrorMsg("Erro de conexao.");
    } finally {
      setSubscribing(false);
      setShowPasswordInput(false);
    }
  };

  const freeFeatures = [
    "Aparecer nos resultados de busca",
    "Receber solicitacoes de orcamento",
    "Chat com clientes",
    "1 categoria de servico",
  ];

  const premiumFeatures = [
    "Destaque nos resultados de busca",
    "Multiplas categorias (ate 5)",
    "Selo de Profissional Premium",
    "Suporte prioritario 24h",
    "Estatisticas de visitas ao perfil",
    "Taxa de servico reduzida (5%)",
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 text-amber-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold text-xs uppercase tracking-widest mb-8"
        >
          <ArrowLeft size={14} /> Voltar ao Painel
        </Link>

        <div className="text-center mb-12">
          <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full mb-4 border font-black text-xs uppercase tracking-widest ${isPremium ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
            {isPremium ? <Crown className="w-4 h-4" /> : <Check className="w-4 h-4" />}
            {isPremium ? "Plano Premium Ativo" : "Plano Gratuito Ativo"}
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
            {providerName || user?.name}
          </h1>
          <p className="text-gray-500 font-medium">
            {isPremium
              ? "Voce esta no plano Premium. Aproveite todos os beneficios!"
              : "Eleve sua carreira com o plano Premium."}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">

          <div className={`bg-white rounded-3xl border-2 p-8 transition-all ${!isPremium ? "border-green-500 shadow-xl shadow-green-50" : "border-gray-100 opacity-60"}`}>
            {!isPremium && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500 text-white rounded-full text-[10px] font-black uppercase tracking-wider mb-4">
                <Check className="w-3 h-3" /> Plano Atual
              </div>
            )}
            <h3 className="text-lg font-black text-gray-400 uppercase tracking-widest mb-2">Gratuito</h3>
            <p className="text-5xl font-black text-gray-900 mb-6">
              R$0<span className="text-lg text-gray-400 font-bold">/mes</span>
            </p>
            <ul className="space-y-3">
              {freeFeatures.map((f, i) => (
                <li key={i} className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-green-500 shrink-0" />
                  <span className="text-sm text-gray-600 font-medium">{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={`bg-slate-900 rounded-3xl border-2 p-8 relative overflow-hidden transition-all ${isPremium ? "border-amber-400 shadow-xl shadow-amber-100" : "border-slate-700"}`}>
            {isPremium && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400 text-slate-900 rounded-full text-[10px] font-black uppercase tracking-wider mb-4">
                <Crown className="w-3 h-3" /> Plano Atual
              </div>
            )}
            {!isPremium && (
              <div className="absolute top-4 right-4 px-3 py-1 bg-amber-400 text-slate-900 rounded-full text-[10px] font-black uppercase tracking-wider">
                Recomendado
              </div>
            )}
            <h3 className="text-lg font-black text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Crown className="w-5 h-5" /> Premium
            </h3>
            <p className="text-5xl font-black text-white mb-6">
              R$29<span className="text-lg text-gray-400 font-bold">/mes</span>
            </p>
            <ul className="space-y-3 mb-8">
              {premiumFeatures.map((f, i) => (
                <li key={i} className="flex items-center gap-3">
                  <Star className="w-4 h-4 text-amber-400 shrink-0 fill-amber-400" />
                  <span className="text-sm text-gray-300 font-medium">{f}</span>
                </li>
              ))}
            </ul>
            {!isPremium && (
              <div className="space-y-3">
                {showPasswordInput ? (
                  <>
                    <input
                      type="email"
                      placeholder="Seu e-mail"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800 text-white placeholder-slate-500 border border-slate-700 focus:outline-none focus:border-amber-400 text-sm"
                    />
                    <input
                      type="password"
                      placeholder="Sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800 text-white placeholder-slate-500 border border-slate-700 focus:outline-none focus:border-amber-400 text-sm"
                    />
                    <button
                      onClick={handleAssinarPremium}
                      disabled={subscribing || !email || !password}
                      className="w-full py-4 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                    >
                      {subscribing && <Loader2 className="w-4 h-4 animate-spin" />}
                      {subscribing ? "Ativando..." : "Confirmar Ativacao"}
                    </button>
                    <button
                      onClick={() => setShowPasswordInput(false)}
                      className="w-full text-slate-500 text-xs font-bold uppercase tracking-wider hover:text-slate-300 transition-all"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowPasswordInput(true)}
                    className="w-full py-4 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest transition-all"
                  >
                    Ativar Premium
                  </button>
                )}
                {errorMsg && (
                  <p className="text-amber-400 text-xs font-bold text-center">{errorMsg}</p>
                )}
              </div>
            )}
          </div>

        </div>

        <p className="text-center text-xs text-gray-400 font-medium mt-8">
          Ativacao instantanea para fins de desenvolvimento.
        </p>

      </div>
    </div>
  );
}

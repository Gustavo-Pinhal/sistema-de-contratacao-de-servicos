"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  FileText,
  UserCheck,
  Pencil,
  Check,
  X,
  Sparkles,
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import {
  PortfolioCard,
  ProjetoPortfolioData,
} from "@/components/PortfolioCard";

interface PortifolioResponse {
  id: string;
  biografia: string | null;
  servicosConcluidos: number;
  projetos: ProjetoPortfolioData[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost";

export default function PortfolioPrestadorPage() {
  const { user, loading: userLoading } = useUser();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [portfolio, setPortfolio] = useState<PortifolioResponse | null>(null);

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState("");
  const [isSavingBio, setIsSavingBio] = useState(false);

  useEffect(() => {
    if (userLoading) return;

    if (!user?.token) {
      setError("Você precisa estar autenticado para acessar o seu portfólio.");
      setLoading(false);
      return;
    }

    const prestadorId = user?.id || user?.id;

    if (!prestadorId) {
      setError("Não foi possível identificar seu ID de prestador associado.");
      setLoading(false);
      return;
    }

    async function fetchPortfolio() {
      try {
        setLoading(true);
        const res = await fetch(
          `${API_BASE_URL}/api/prestador/${prestadorId}/portifolio`,
        );

        if (!res.ok) {
          throw new Error("Erro ao carregar os dados do seu portfólio.");
        }

        const data = (await res.json()) as PortifolioResponse;
        setPortfolio(data);
        setTempBio(data.biografia || "");
      } catch (err: any) {
        setError(err.message || "Falha na conexão.");
      } finally {
        setLoading(false);
      }
    }

    fetchPortfolio();
  }, [user?.token, user?.id, user?.id, userLoading]);

  const handleSaveBio = async () => {
    setIsSavingBio(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (portfolio) {
      setPortfolio({
        ...portfolio,
        biografia: tempBio,
      });
    }

    setIsEditingBio(false);
    setIsSavingBio(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-green-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
            Carregando sua vitrine...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-md text-center shadow-sm">
          <p className="text-red-500 font-black text-xs uppercase tracking-widest mb-3">
            Erro operacional
          </p>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <Link
            href="/affiliate/dashboard"
            className="text-xs font-bold text-green-600 underline uppercase tracking-wider"
          >
            Voltar para o Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 text-slate-800 selection:bg-green-500 selection:text-white">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        {/* Box Principal Unificada */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-gray-100">
            <div>
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-0.5">
                Visão do Profissional
              </span>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                Meu Portfólio de Projetos
              </h1>
            </div>
            <div className="flex items-center gap-3 self-start">
              <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-xl font-mono text-xs font-bold">
                <UserCheck size={14} />
                {portfolio?.servicosConcluidos} Serviços Concluídos
              </span>
            </div>
          </div>

          {/* Área de Biografia */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-1">
                <Sparkles size={12} className="text-green-600" /> Minha
                Apresentação Profissional
              </h2>

              {!isEditingBio ? (
                <button
                  type="button"
                  onClick={() => setIsEditingBio(true)}
                  className="text-xs text-gray-500 hover:text-green-600 font-bold flex items-center gap-1 transition-colors"
                >
                  <Pencil size={12} /> Editar Biografia
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingBio(false);
                      setTempBio(portfolio?.biografia || "");
                    }}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors font-medium flex items-center gap-1"
                  >
                    <X size={14} /> Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveBio}
                    disabled={isSavingBio}
                    className="text-xs text-green-600 hover:text-green-700 font-bold transition-colors flex items-center gap-1"
                  >
                    {isSavingBio ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Check size={14} />
                    )}
                    Salvar
                  </button>
                </div>
              )}
            </div>

            {isEditingBio ? (
              <div className="space-y-1">
                <textarea
                  value={tempBio}
                  onChange={(e) => setTempBio(e.target.value)}
                  maxLength={1000}
                  rows={4}
                  placeholder="Conte para seus clientes sobre sua experiência técnica..."
                  className="w-full text-sm font-medium p-3.5 border border-gray-200 rounded-xl focus:outline-none focus:border-green-600 resize-none bg-gray-50 text-gray-900"
                />
                <span className="text-[9px] text-gray-400 block text-right">
                  {tempBio.length}/1000 caracteres
                </span>
              </div>
            ) : (
              <p className="text-sm text-gray-600 leading-relaxed font-medium whitespace-pre-line bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                {portfolio?.biografia || "Nenhuma biografia cadastrada ainda."}
              </p>
            )}
          </div>
        </div>

        {/* Seção Inferior: Grid de Projetos consumindo o Componente Isolado */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black uppercase text-gray-400 tracking-widest">
              Casos de Sucesso Cadastrados ({portfolio?.projetos.length || 0})
            </h2>
          </div>

          {portfolio?.projetos.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-sm font-black text-gray-700 uppercase mb-1">
                Nenhum projeto registrado
              </h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolio?.projetos.map((projeto) => (
                <PortfolioCard
                  key={projeto.id}
                  projeto={projeto}
                  basePath="/affiliate"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

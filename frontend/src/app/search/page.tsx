"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Star,
  CheckCircle,
  SlidersHorizontal,
  Building2,
} from "lucide-react";
import Link from "next/link";

// Definição do tipo que vem do seu backend
interface Profissao {
  id: number;
  descricao: string;
}

export default function SearchProviders() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Estados para o Backend
  const [profissoes, setProfissoes] = useState<Profissao[]>([]);
  const [loadingProfissoes, setLoadingProfissoes] = useState(true);

  // Estados de Filtro
  const [searchTerm, setSearchTerm] = useState("");
  const selectedSpecialty = searchParams.get("specialty") || "all";
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [onlyBusiness, setOnlyBusiness] = useState(false);
  const [sortBy, setSortBy] = useState("rating");

  // 1. Efeito para carregar as profissões do seu endpoint real
  useEffect(() => {
    async function loadProfissoes() {
      try {
        const response = await fetch("/api/ui/profissoes");
        if (!response.ok) throw new Error("Erro ao carregar profissões");
        const data = await response.json();
        setProfissoes(data);
      } catch (error) {
        console.error("Falha ao buscar profissões:", error);
      } finally {
        setLoadingProfissoes(false);
      }
    }
    loadProfissoes();
  }, []);

  // Função para atualizar a URL (Next.js Navigation)
  const updateSpecialty = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("specialty");
    } else {
      params.set("specialty", value);
    }
    router.push(`/search?${params.toString()}`);
  };

  // Mock temporário para os profissionais (até conectarmos o próximo endpoint)
  const filteredProviders: any[] = [];

  return (
    <div className="min-h-screen bg-slate-50/50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header simplificado */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
            Buscar Profissionais
          </h1>
          <p className="text-slate-500 font-medium">
            Encontre especialistas com avaliações reais para o seu projeto.
          </p>
        </div>

        {/* Barra de Busca e Filtros Rápidos */}
        <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/20 p-6 mb-10 border border-slate-100">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold transition-all"
              />
            </div>

            <div className="flex items-center gap-6 px-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={onlyVerified}
                  onChange={(e) => setOnlyVerified(e.target.checked)}
                  className="w-5 h-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-600"
                />
                <span className="text-sm font-bold text-slate-600 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> Verificados
                </span>
              </label>
            </div>
          </div>

          {/* LISTAGEM DE PROFISSÕES (CONECTADA AO BACKEND) */}
          <div className="mt-8 border-t border-slate-100 pt-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => updateSpecialty("all")}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  selectedSpecialty === "all"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                    : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-indigo-50"
                }`}
              >
                Todos
              </button>

              {loadingProfissoes
                ? // Skeleton simples enquanto carrega
                  [1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-10 w-24 bg-slate-100 animate-pulse rounded-xl"
                    />
                  ))
                : profissoes.map((prof) => (
                    <button
                      key={prof.id}
                      onClick={() => updateSpecialty(prof.descricao)}
                      className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                        selectedSpecialty === prof.descricao
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                          : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-indigo-50"
                      }`}
                    >
                      {prof.descricao}
                    </button>
                  ))}
            </div>
          </div>
        </div>

        {/* Listagem de profissionais (vazia por enquanto) */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Cards virão aqui */}
        </div>
      </div>
    </div>
  );
}

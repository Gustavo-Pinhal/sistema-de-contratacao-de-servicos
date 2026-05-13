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
import { useUser } from "@/app/context/UserContext";

interface Usuario {
  id: string;
}

interface Profissao {
  id: number;
  descricao: string;
}

interface Prestador {
  usuario: Usuario;
  nome: string;
  profissoes: Profissao[];
  // Campos abaixo são opcionais dependendo do que seu back retorna agora,
  // adicionei mock values para manter o visual do Card.
  rating?: number;
  avatar?: string;
}

export default function SearchProviders() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser(); // Pegamos o token do contexto

  // Estados do Backend
  const [profissoes, setProfissoes] = useState<Profissao[]>([]);
  const [prestadores, setPrestadores] = useState<Prestador[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const selectedSpecialtyDesc = searchParams.get("specialty") || "all";

  // 1. Carregar Categorias (Profissões)
  useEffect(() => {
    async function loadProfissoes() {
      try {
        const response = await fetch("/api/ui/profissoes");
        const data = await response.json();
        setProfissoes(data);
      } catch (e) {
        console.error("Erro profissoes", e);
      }
    }
    loadProfissoes();
  }, []);

  // 2. Carregar Prestadores (sempre que a especialidade mudar)
  useEffect(() => {
    async function fetchPrestadores() {
      if (!user?.token) return;

      setLoading(true);
      try {
        const profId = profissoes.find(
          (p) => p.descricao === selectedSpecialtyDesc,
        )?.id;
        const url = profId
          ? `/api/prestadores/buscar?profissao=${profId}`
          : "/api/prestadores/buscar";

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${user.token}`,
            Accept: "application/json",
          },
        });

        const data = await response.json();

        // DEBUG: Veja no console do navegador o que está chegando
        console.log("Dados recebidos do back:", data);

        if (response.ok && Array.isArray(data)) {
          setPrestadores(data);
        } else {
          console.error("Back não retornou um array:", data);
          setPrestadores([]); // Garante que continue sendo um array vazio em caso de erro
        }
      } catch (e) {
        console.error("Erro na requisição:", e);
        setPrestadores([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPrestadores();
  }, [selectedSpecialtyDesc, profissoes, user?.token]);

  const updateSpecialty = (desc: string) => {
    const params = new URLSearchParams(searchParams.toString());
    desc === "all" ? params.delete("specialty") : params.set("specialty", desc);
    router.push(`/search?${params.toString()}`);
  };

  // Filtro local apenas para o nome (client-side search)
  const filteredPrestadores = prestadores.filter((p) =>
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-slate-50/50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Search Header */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-10 border border-slate-100">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nome do profissional..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold"
              />
            </div>
          </div>

          {/* Categorias Dinâmicas */}
          <div className="mt-8 border-t pt-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => updateSpecialty("all")}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  selectedSpecialtyDesc === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                Todos
              </button>
              {profissoes.map((p) => (
                <button
                  key={p.id}
                  onClick={() => updateSpecialty(p.descricao)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    selectedSpecialtyDesc === p.descricao
                      ? "bg-blue-600 text-white"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {p.descricao}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid de Resultados */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-64 bg-white animate-pulse rounded-3xl"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredPrestadores.map((prestador, idx) => (
              <ProviderCard key={idx} provider={prestador} />
            ))}
          </div>
        )}

        {!loading && filteredPrestadores.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed">
            <p className="text-slate-400 font-bold">
              Nenhum profissional encontrado.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ProviderCard({ provider }: { provider: Prestador }) {
  return (
    <div className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
      <div className="aspect-square bg-slate-100 rounded-2xl mb-4 overflow-hidden">
        <img
          src={
            provider.avatar ||
            `https://ui-avatars.com/api/?name=${provider.nome}&background=random`
          }
          className="w-full h-full object-cover"
          alt={provider.nome}
        />
      </div>

      <div className="flex-1">
        <h3 className="font-black text-slate-900 mb-1">{provider.nome}</h3>
        <div className="flex flex-wrap gap-1 mb-4">
          {provider.profissoes.map((p) => (
            <span
              key={p.id}
              className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded"
            >
              {p.descricao}
            </span>
          ))}
        </div>
      </div>

      <Link
        href={`/provider/${provider.usuario.id}/request`}
        className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-tighter hover:bg-blue-600 transition-colors text-center block"
      >
        Solicitar Orçamento
      </Link>
    </div>
  );
}

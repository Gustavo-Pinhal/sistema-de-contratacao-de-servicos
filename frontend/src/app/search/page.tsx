"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Star, CheckCircle2, User } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import Image from "next/image";

interface Profissao {
  id: number;
  descricao: string;
}

interface Prestador {
  usuario: { id: string };
  nome: string;
  profissoes: Profissao[];
  urlPerfil?: string;
}

export default function SearchProviders() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();

  const [profissoes, setProfissoes] = useState<Profissao[]>([]);
  const [prestadores, setPrestadores] = useState<Prestador[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const selectedSpecialtyDesc = searchParams.get("specialty") || "all";

  // 1. Carregar Dados Iniciais (Profissões e Serviços Ativos)
  useEffect(() => {
    async function loadInitialData() {
      try {
        const resProf = await fetch("/api/ui/profissoes");
        setProfissoes(await resProf.json());

      } catch (e) {
        console.error("Erro ao carregar dados iniciais", e);
      }
    }
    loadInitialData();
  }, [user?.token]);

  // 2. Buscar Prestadores por Especialidade
  useEffect(() => {
    async function fetchPrestadores() {
      if (!user?.token) return;
      setLoading(true);
      try {
        const profId = profissoes.find(
          (p) => p.descricao === selectedSpecialtyDesc,
        )?.id;
        const url = profId ? `/api/busca?profissao=${profId}` : "/api/busca";

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const data = await res.json();
        setPrestadores(Array.isArray(data) ? data : []);
      } catch (e) {
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

  const filteredPrestadores = prestadores.filter((p) =>
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-slate-50/50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Busca e Filtros */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-10 border border-slate-100">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nome do profissional..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold"
            />
          </div>

          <div className="mt-8 border-t pt-6 flex flex-wrap gap-2">
            <FilterButton
              label="Todos"
              active={selectedSpecialtyDesc === "all"}
              onClick={() => updateSpecialty("all")}
            />
            {profissoes.map((p) => (
              <FilterButton
                key={p.id}
                label={p.descricao}
                active={selectedSpecialtyDesc === p.descricao}
                onClick={() => updateSpecialty(p.descricao)}
              />
            ))}
          </div>
        </div>

        {/* Contagem de resultados */}
        {!loading && (
          <p className="text-sm text-slate-600 mb-6">
            <span className="font-bold text-slate-900">{filteredPrestadores.length}</span>{" "}
            {filteredPrestadores.length === 1 ? "profissional encontrado" : "profissionais encontrados"}
          </p>
        )}

        {/* Listagem de Prestadores */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="h-52 bg-slate-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                  <div className="h-10 bg-slate-100 rounded" />
                  <div className="h-10 bg-slate-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredPrestadores.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 font-bold">
            Nenhum profissional encontrado.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrestadores.map((p) => (
              <ProviderCard key={p.usuario.id} provider={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
        active
          ? "bg-blue-600 text-white"
          : "bg-slate-50 text-slate-600 hover:bg-slate-100"
      }`}
    >
      {label}
    </button>
  );
}

function getInitials(nome: string): string {
  return nome
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function ProviderCard({ provider }: { provider: Prestador }) {
  const hasPhoto = provider.urlPerfil && provider.urlPerfil !== "";
  const especialidade =
    provider.profissoes.length > 0
      ? provider.profissoes.map((p) => p.descricao).join(", ")
      : "Prestador de Serviços";

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col">
      {/* Avatar / Foto */}
      <div className="relative h-52 flex items-center justify-center bg-emerald-500 overflow-hidden">
        {hasPhoto ? (
          <Image
            src={provider.urlPerfil!}
            alt={`Foto de ${provider.nome}`}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
            unoptimized={provider.urlPerfil!.includes("localhost")}
          />
        ) : (
          <span className="text-white font-black text-5xl tracking-tight select-none">
            {getInitials(provider.nome)}
          </span>
        )}
        {/* Badge Verificado */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-emerald-600 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Verificado
        </div>
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1">
        {/* Nome + Rating */}
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-slate-900 text-base leading-tight">{provider.nome}</h3>
          <div className="flex items-center gap-1 text-sm font-bold text-amber-500 shrink-0 ml-2">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>5</span>
          </div>
        </div>

        {/* Especialidade */}
        <p className="text-sm font-semibold text-blue-600 mb-4">{especialidade}</p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 border border-slate-100 rounded-xl p-3 mb-4">
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Serviços</p>
            <p className="text-sm font-bold text-slate-900">0+</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Resposta</p>
            <p className="text-sm font-bold text-slate-900">~2 horas</p>
          </div>
        </div>

        {/* Preço + Botão */}
        <div className="flex items-end justify-between mt-auto">
          <div>
            <p className="text-[10px] text-slate-400 font-semibold">A partir de</p>
            <p className="text-sm font-bold text-slate-900">Sob orçamento</p>
          </div>
          <Link
            href={`/provider/${provider.usuario.id}`}
            className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition-colors whitespace-nowrap"
          >
            Ver Perfil
          </Link>
        </div>
      </div>
    </div>
  );
}

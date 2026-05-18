"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, User, Calendar, MapPin, Star } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import Image from "next/image";

interface ServicoAtivo {
  id: string;
  prestador: { id: string; nome: string };
  endereco: string;
  data: string;
  status: string;
  encerradoEm?: string | null;
  avaliacao?: {
    nota: number;
    data: string;
  } | null;
}

interface Profissao {
  id: number;
  descricao: string;
}

interface Prestador {
  usuario: { id: string };
  nome: string;
  profissoes: Profissao[];
  urlPerfil?: string; // Alterado de avatar para urlPerfil
}

function convertNotaParaCincoPontos(nota: number): number {
  const notaConvertida = nota / 2;
  return Math.max(0, Math.min(5, notaConvertida));
}

function formatarNotaCincoPontos(nota: number): string {
  const notaConvertida = convertNotaParaCincoPontos(nota);
  return Number.isInteger(notaConvertida)
    ? `${notaConvertida}`
    : notaConvertida.toFixed(1);
}

export default function SearchProviders() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();

  const [profissoes, setProfissoes] = useState<Profissao[]>([]);
  const [prestadores, setPrestadores] = useState<Prestador[]>([]);
  const [servicos, setServicos] = useState<ServicoAtivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const selectedSpecialtyDesc = searchParams.get("specialty") || "all";

  // 1. Carregar Dados Iniciais (Profissões e Serviços Ativos)
  useEffect(() => {
    async function loadInitialData() {
      try {
        const resProf = await fetch("/api/ui/profissoes");
        setProfissoes(await resProf.json());

        if (user?.token) {
          const resServ = await fetch("/api/cliente/servicos", {
            headers: { Authorization: `Bearer ${user.token}` },
          });
          if (resServ.ok) setServicos(await resServ.json());
        }
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

  const canReviewService = (servico: ServicoAtivo) =>
    (servico.status === "Finalizado" || servico.status === "Cancelado") &&
    servico.avaliacao == null;

  const getServiceCardColor = (servico: ServicoAtivo) => {
    if (canReviewService(servico)) {
      return {
        border: "border-amber-200 hover:border-amber-300",
        icon: "bg-amber-50 text-amber-600 group-hover:bg-amber-100",
        status: "text-amber-600",
      };
    }

    if (servico.status === "Finalizado") {
      return {
        border: "border-emerald-200 hover:border-emerald-300",
        icon: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100",
        status: "text-emerald-600",
      };
    }

    if (servico.status === "Cancelado") {
      return {
        border: "border-rose-200 hover:border-rose-300",
        icon: "bg-rose-50 text-rose-600 group-hover:bg-rose-100",
        status: "text-rose-600",
      };
    }

    return {
      border: "border-slate-200 hover:border-blue-500",
      icon: "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
      status: "text-slate-400",
    };
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Seção de Serviços Ativos (Apenas se houver algum) */}
        {user && servicos.length > 0 && (
          <div className="mb-10">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 ml-2">
              Seus Serviços Ativos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {servicos.map((serv) => {
                const colors = getServiceCardColor(serv);
                return (
                  <div
                    key={serv.id}
                    className={`bg-white p-4 rounded-2xl shadow-sm transition-all flex flex-col gap-4 group border ${colors.border}`}
                  >
                    <Link
                      href={`/service/${serv.id}`}
                      className="flex items-center justify-between gap-3 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${colors.icon}`}
                        >
                          <User size={18} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">
                            {serv.prestador.nome}
                          </h4>
                          <p
                            className={`text-[10px] font-bold uppercase ${colors.status}`}
                          >
                            {serv.status}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold mb-1 justify-end">
                          <Calendar size={12} /> {serv.data}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold justify-end">
                          <MapPin size={12} /> {serv.endereco.split("-")[0]}
                        </div>
                        {serv.avaliacao?.nota !== undefined && (
                          <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-amber-600 font-black">
                            <Star size={12} className="fill-current" />
                            {formatarNotaCincoPontos(serv.avaliacao.nota)}/5
                          </div>
                        )}
                      </div>
                    </Link>

                    {canReviewService(serv) && (
                      <Link
                        href={`/service/${serv.id}?review=1`}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-black uppercase tracking-widest text-amber-700 transition-colors hover:bg-amber-100"
                      >
                        <Star size={16} />
                        Avaliar
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

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

        {/* Listagem de Prestadores */}
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
            {filteredPrestadores.map((p) => (
              <ProviderCard key={p.usuario.id} provider={p} />
            ))}
          </div>
        )}

        {!loading && filteredPrestadores.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 font-bold">
            Nenhum profissional encontrado.
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

function ProviderCard({ provider }: { provider: Prestador }) {
  // Lógica para definir a imagem: prioriza urlPerfil, se vazio usa ui-avatars
  const imageUrl =
    provider.urlPerfil && provider.urlPerfil !== ""
      ? provider.urlPerfil
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.nome)}&background=random`;

  return (
    <div className="bg-white p-4 rounded-3l border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col h-full group">
      <div className="aspect-square bg-slate-100 rounded-2xl mb-4 overflow-hidden relative">
        <Image
          src={imageUrl}
          alt={`Foto de ${provider.nome}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          unoptimized={imageUrl.includes("localhost")} // Útil para evitar erros de SSL em dev
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

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  ChevronLeft,
  Star,
  CheckCircle2,
  MapPin,
  Clock,
  Briefcase,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@/context/UserContext";

interface Profissao {
  id: number;
  descricao: string;
}

interface Projeto {
  id: string;
  titulo: string;
  descricao: string | null;
  regiao: string;
  valor: string | null;
  concluido_em: string | null;
  urls_fotos: string[];
}

interface Portifolio {
  biografia: string | null;
  servicos_concluidos: number;
  projetos: Projeto[];
}

interface PerfilPrestador {
  id: string;
  nome: string;
  urlPerfil: string | null;
  profissoes: Profissao[];
  portifolio: Portifolio | null;
}

function getInitials(nome: string): string {
  return nome
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default function ProviderProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useUser();
  const [perfil, setPerfil] = useState<PerfilPrestador | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!user?.token || !id) return;
    fetch(`/api/prestadores/${id}/perfil`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error("Prestador não encontrado");
        return r.json();
      })
      .then(setPerfil)
      .catch((e) => setErro(e.message))
      .finally(() => setLoading(false));
  }, [id, user?.token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-5xl mx-auto px-4 space-y-6 animate-pulse">
          <div className="h-4 w-32 bg-slate-200 rounded" />
          <div className="bg-white rounded-2xl p-8 h-48 border border-slate-100" />
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 bg-white rounded-2xl h-80 border border-slate-100" />
            <div className="space-y-4">
              <div className="bg-white rounded-2xl h-36 border border-slate-100" />
              <div className="bg-white rounded-2xl h-36 border border-slate-100" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (erro || !perfil) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 font-bold">{erro || "Perfil não encontrado."}</p>
          <Link href="/search" className="mt-4 inline-block text-blue-600 font-bold text-sm hover:underline">
            Voltar para busca
          </Link>
        </div>
      </div>
    );
  }

  const especialidade =
    perfil.profissoes.length > 0
      ? perfil.profissoes.map((p) => p.descricao).join(", ")
      : "Prestador de Serviços";

  const servicosConcluidos = perfil.portifolio?.servicos_concluidos ?? 0;
  const projetos = perfil.portifolio?.projetos ?? [];
  const anoIngresso = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-5xl mx-auto px-4">
        {/* Voltar */}
        <Link
          href="/search"
          className="inline-flex items-center gap-1.5 text-slate-400 text-sm font-semibold mb-6 hover:text-slate-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar para busca
        </Link>

        {/* Card Principal */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
          {/* Badge Premium */}
          <div className="inline-flex items-center gap-1.5 bg-amber-400 text-white text-xs font-bold px-3 py-1 rounded-full mb-5">
            ⭐ PRESTADOR PREMIUM
          </div>

          <div className="flex flex-col sm:flex-row items-start gap-5">
            {/* Avatar */}
            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-emerald-500 flex items-center justify-center shrink-0">
              {perfil.urlPerfil ? (
                <Image
                  src={perfil.urlPerfil}
                  alt={perfil.nome}
                  fill
                  className="object-cover"
                  unoptimized={perfil.urlPerfil.includes("localhost")}
                />
              ) : (
                <span className="text-white font-black text-2xl select-none">
                  {getInitials(perfil.nome)}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    {perfil.nome}
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </h1>
                  <p className="text-emerald-600 font-bold text-sm uppercase tracking-wide mt-0.5">
                    {especialidade}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                    <span className="flex items-center gap-1 font-semibold">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      5 (0 avaliações)
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      Localização não informada
                    </span>
                  </div>
                </div>

                <Link
                  href={`/provider/${id}/request`}
                  className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-colors shrink-0"
                >
                  Solicitar Orçamento
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6 bg-slate-50 rounded-xl p-4">
                <div>
                  <p className="text-xs text-slate-400 font-semibold">Trabalhos</p>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">{servicosConcluidos}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold">Resposta</p>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">~2 horas</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold">Valor médio</p>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">Sob orçamento</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Corpo Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Portfólio */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-base font-bold text-slate-900 mb-5">Portfólio de Serviços</h2>

            {projetos.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-xl text-slate-400 text-sm font-semibold">
                Nenhum projeto cadastrado ainda.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {projetos.map((projeto) => (
                  <div key={projeto.id} className="border border-slate-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                    {projeto.urls_fotos.length > 0 ? (
                      <div className="relative h-40">
                        <Image
                          src={projeto.urls_fotos[0]}
                          alt={projeto.titulo}
                          fill
                          className="object-cover"
                          unoptimized={projeto.urls_fotos[0].includes("localhost")}
                        />
                      </div>
                    ) : (
                      <div className="h-40 bg-slate-100 flex items-center justify-center">
                        <Briefcase className="w-8 h-8 text-slate-300" />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-bold text-slate-900 text-sm leading-snug">{projeto.titulo}</h3>
                      {projeto.descricao && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{projeto.descricao}</p>
                      )}
                      {projeto.valor && (
                        <p className="text-emerald-600 font-bold text-sm mt-2">
                          R$ {parseFloat(projeto.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Entre em Contato */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-slate-900 mb-4">Entre em Contato</h2>
              <Link
                href={`/provider/${id}/request`}
                className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm py-3 rounded-xl transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Solicitar Orçamento
              </Link>
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-500 font-semibold">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>~2 horas</span>
                <span className="text-slate-400 font-normal text-xs">Tempo médio de resposta</span>
              </div>
            </div>

            {/* Sobre */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-slate-900 mb-4">Sobre</h2>
              <ul className="space-y-2.5 text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  Identidade verificada
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  {servicosConcluidos}+ trabalhos concluídos
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  Membro desde {anoIngresso}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

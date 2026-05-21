"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Award,
  ChevronLeft,
  Loader2,
  MapPin,
  MessageSquare,
  Star,
  User,
  CheckCircle,
  Briefcase,
} from "lucide-react";
import {
  PortfolioCard,
  ProjetoPortfolioData,
} from "@/components/PortfolioCard";

interface Profissao {
  id: number;
  descricao: string;
}

interface ProviderProfileResponse {
  nomeComercial?: string | null;
  nome: string;
  premium: boolean;
  municipio: string;
  profissoes: Profissao[];
  biografia?: string | null;
  servicosConcluidos?: number | null;
  urlPerfil?: string | null;
}

interface PortfolioResponse {
  id: string;
  biografia: string;
  servicosConcluidos: number;
  projetos: ProjetoPortfolioData[];
}

interface ReviewImage {
  id: string;
  url: string;
}

interface ReviewResponse {
  id: string;
  data: string;
  nota: number;
  comentario: string;
  imagens: ReviewImage[];
  servico: {
    data: string;
    total: number;
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost";

function formatDate(value?: string | null) {
  if (!value) return "Sem data";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatCurrency(value: number | null | undefined) {
  if (value == null) return "Sob consulta";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function convertNotaParaCincoPontos(nota: number): number {
  const convertida = nota / 2;
  return Math.max(0, Math.min(5, convertida));
}

function getProviderImage(name: string, url?: string | null) {
  return url && url !== ""
    ? url
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
}

function resolveImageUrl(url?: string | null) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;

  if (!API_BASE_URL) {
    return url;
  }

  try {
    return new URL(url, API_BASE_URL).toString();
  } catch {
    return url;
  }
}

export default function ProviderProfilePage() {
  const params = useParams();
  const providerId = params.id as string;

  const [profile, setProfile] = useState<ProviderProfileResponse | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!providerId) return;

    let mounted = true;

    async function loadProvider() {
      try {
        setLoading(true);
        setError(null);

        const profileRes = await fetch(
          `${API_BASE_URL}/api/prestador/${providerId}`,
        );

        if (profileRes.status === 404) {
          throw new Error("Prestador não encontrado.");
        }

        if (!profileRes.ok) {
          throw new Error("Erro ao carregar o perfil do prestador.");
        }

        const profileJson =
          (await profileRes.json()) as ProviderProfileResponse;

        const reviewsPromise = fetch(
          `${API_BASE_URL}/api/prestador/${providerId}/avaliacoes`,
        );
        const portfolioPromise = profileJson.premium
          ? fetch(`${API_BASE_URL}/api/prestador/${providerId}/portifolio`)
          : null;

        const [reviewsRes, portfolioRes] = await Promise.all([
          reviewsPromise,
          portfolioPromise,
        ]);

        let reviewsJson: ReviewResponse[] = [];
        if (reviewsRes.ok) {
          reviewsJson = (await reviewsRes.json()) as ReviewResponse[];
        }

        let portfolioJson: PortfolioResponse | null = null;
        if (portfolioRes) {
          if (portfolioRes.ok) {
            portfolioJson = (await portfolioRes.json()) as PortfolioResponse;
          } else if (portfolioRes.status !== 404) {
            throw new Error("Erro ao carregar o portfólio do prestador.");
          }
        }

        if (!mounted) return;

        setProfile(profileJson);
        setReviews(reviewsJson);
        setPortfolio(portfolioJson);
      } catch (loadError: any) {
        if (!mounted) return;
        setError(loadError?.message || "Falha ao carregar o perfil.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProvider();

    return () => {
      mounted = false;
    };
  }, [providerId]);

  const sortedProjects = useMemo(() => {
    return [...(portfolio?.projetos || [])].sort(
      (a, b) => a.posicao - b.posicao,
    );
  }, [portfolio?.projetos]);

  const sortedReviews = useMemo(() => {
    return [...reviews].sort(
      (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime(),
    );
  }, [reviews]);

  const activeBio = portfolio?.biografia || profile?.biografia || null;
  const serviceCount =
    portfolio?.servicosConcluidos ?? profile?.servicosConcluidos ?? null;
  const providerName = profile?.nomeComercial || profile?.nome || "Prestador";
  const providerImage = getProviderImage(providerName, profile?.urlPerfil);

  const hasProjects = sortedProjects.length > 0;

  // Média de Notas Simplificada
  const mediaAvaliacoes = useMemo(() => {
    if (reviews.length === 0) return null;
    const total = reviews.reduce(
      (acc, r) => acc + convertNotaParaCincoPontos(r.nota),
      0,
    );
    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <Loader2 className="animate-spin text-green-600 w-8 h-8" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
          Carregando perfil...
        </p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
        <p className="text-sm font-black text-red-500 uppercase tracking-widest mb-4">
          {error || "Prestador não encontrado."}
        </p>
        <Link
          href="/search"
          className="text-xs font-bold text-slate-600 underline uppercase tracking-wider"
        >
          Voltar para a busca
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-8">
      {/* Barra de Navegação Superior */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/search"
            className="flex items-center gap-2 text-slate-500 font-bold hover:text-green-600 transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="text-xs uppercase tracking-widest">Voltar</span>
          </Link>
          <div className="text-center">
            <span className="block text-[10px] font-black uppercase text-slate-400 tracking-tighter">
              Perfil Público
            </span>
            <span className="block text-xs font-mono font-bold text-slate-600">
              #{providerId?.slice(0, 8)}
            </span>
          </div>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Bloco Unificado de Apresentação e CTA Principal */}
        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start text-center sm:text-left">
              {/* Foto de Perfil */}
              <div className="relative h-24 w-24 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0 shadow-inner">
                <img
                  src={resolveImageUrl(providerImage)}
                  alt={`Foto de ${providerName}`}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="eager"
                />
              </div>

              {/* Informações de Título */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <User size={12} className="text-slate-400" />
                  <span>
                    {profile.premium ? "Membro Premium" : "Prestador Autônomo"}
                  </span>
                  {profile.premium && (
                    <span className="inline-flex items-center gap-0.5 rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.2 text-amber-700 font-bold lowercase tracking-normal">
                      <Award
                        size={10}
                        className="fill-amber-500 text-amber-600"
                      />{" "}
                      premium
                    </span>
                  )}
                </div>

                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 uppercase">
                  {providerName}
                </h1>

                <p className="text-xs font-semibold text-slate-400">
                  Nome registrado:{" "}
                  <span className="text-slate-600">{profile.nome}</span>
                </p>

                <div className="flex flex-wrap justify-center sm:justify-start items-center gap-1.5 pt-1">
                  <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600">
                    <MapPin size={12} className="text-slate-400" />
                    {profile.municipio}
                  </span>
                  {profile.profissoes.map((profissao) => (
                    <span
                      key={profissao.id}
                      className="inline-flex items-center rounded-lg border border-green-100 bg-green-50/50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-green-700"
                    >
                      {profissao.descricao}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Botão de Conversão Superior Direita (Desktop) */}
            <div className="hidden md:block shrink-0">
              <Link
                href={`/provider/${providerId}/request`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-4 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-green-700 shadow-md shadow-green-600/10 active:scale-95"
              >
                <MessageSquare size={16} />
                Solicitar Orçamento
              </Link>
            </div>
          </div>

          {/* Painel Horizontal de Métricas de Confiança */}
          <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
            <div className="py-2 border-r border-slate-200">
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                Serviços
              </p>
              <p className="text-xl font-black text-slate-900 mt-0.5">
                {serviceCount ?? "0"}
              </p>
              <p className="text-[9px] font-semibold text-slate-400">
                concluídos
              </p>
            </div>

            <div className="py-2 border-r border-slate-200">
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                Avaliações
              </p>
              <p className="text-xl font-black text-slate-900 mt-0.5">
                {sortedReviews.length}
              </p>
              <p className="text-[9px] font-semibold text-slate-400">
                de clientes
              </p>
            </div>

            <div className="py-2">
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                Reputação
              </p>
              {mediaAvaliacoes ? (
                <div className="flex items-center justify-center gap-0.5 mt-0.5 text-amber-600">
                  <p className="text-xl font-black text-slate-900">
                    {mediaAvaliacoes}
                  </p>
                  <Star size={14} className="fill-amber-500 text-amber-500" />
                </div>
              ) : (
                <p className="text-xs font-black text-slate-400 mt-1.5">Novo</p>
              )}
              <p className="text-[9px] font-semibold text-slate-400">
                média geral
              </p>
            </div>
          </div>

          {/* Apresentação Biográfica */}
          {activeBio && (
            <div className="space-y-1.5">
              <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <CheckCircle size={12} className="text-green-600" /> Resumo
                Profissional
              </h3>
              <p className="text-xs leading-relaxed font-medium text-slate-600 bg-slate-50/40 p-4 rounded-xl border border-slate-100">
                {activeBio}
              </p>
            </div>
          )}
        </section>

        {/* Seção de Portfólio Premium */}
        {profile.premium && (
          <section className="space-y-4">
            <div className="px-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">
                Galeria Comercial
              </span>
              <h2 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                Projetos e Casos de Sucesso
              </h2>
            </div>

            {hasProjects ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProjects.map((project) => (
                  <PortfolioCard
                    key={project.id}
                    projeto={project}
                    basePath={`/provider/${providerId}`}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-xs text-slate-400 font-medium">
                Este prestador ainda não anexou nenhum projeto prático ao seu
                portfólio.
              </div>
            )}
          </section>
        )}

        {/* Seção de Avaliações */}
        <section className="space-y-4">
          <div className="px-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">
              Opinião pública
            </span>
            <h2 className="text-lg font-black tracking-tight text-slate-900 uppercase">
              O que dizem os clientes
            </h2>
          </div>

          {sortedReviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedReviews.map((review) => {
                const firstImage = review.imagens?.[0];
                const reviewScore = convertNotaParaCincoPontos(review.nota);

                return (
                  <article
                    key={review.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between gap-4"
                  >
                    <div className="flex gap-4 items-start">
                      {firstImage ? (
                        <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shrink-0">
                          <img
                            src={resolveImageUrl(firstImage.url)}
                            alt="Evidência do serviço"
                            className="absolute inset-0 h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-300 shrink-0">
                          <Star size={16} />
                        </div>
                      )}

                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <div className="inline-flex items-center gap-0.5 rounded bg-amber-50 border border-amber-100 px-1.5 py-0.5 text-[10px] font-black text-amber-700">
                            <Star
                              size={10}
                              className="fill-amber-500 text-amber-500"
                            />
                            {reviewScore.toFixed(1)}
                          </div>
                          <span className="text-[9px] font-mono font-bold text-slate-400">
                            {formatDate(review.data).split(" ")[0]}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-3">
                          "{review.comentario}"
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-50 text-[9px] font-mono font-bold text-slate-400">
                      <span className="bg-slate-50 px-2 py-0.5 rounded">
                        Executado em:{" "}
                        {formatDate(review.servico.data).split(" ")[0]}
                      </span>
                      <span className="bg-slate-50 px-2 py-0.5 rounded">
                        Investimento: {formatCurrency(review.servico.total)}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-xs text-slate-400 font-medium">
              Ainda não existem registros de avaliações para este profissional.
            </div>
          )}
        </section>
      </div>

      {/* 📱 Botão Fixo de Ação na Base (Apenas telas Mobile/Tablet) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur border-t border-slate-200 z-40 shadow-xl">
        <Link
          href={`/provider/${providerId}/request`}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 py-3.5 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-green-700 shadow"
        >
          <MessageSquare size={14} />
          Solicitar Orçamento
        </Link>
      </div>
    </div>
  );
}

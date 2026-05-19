"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Award,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
  MessageSquare,
  Star,
  User,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

interface PortfolioPhoto {
  id: string;
  url: string;
  posicao: number;
}

interface PortfolioProject {
  id: string;
  titulo: string;
  descricao: string;
  regiao: string;
  valor: number | null;
  exibirValor: boolean;
  concluidoEm: string | null;
  exibirConcluidoEm: boolean;
  posicao: number;
  fotos?: PortfolioPhoto[];
  imagens?: PortfolioPhoto[];
}

interface PortfolioResponse {
  id: string;
  biografia: string;
  servicosConcluidos: number;
  projetos: PortfolioProject[];
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

function getProjectPhotos(project: PortfolioProject): PortfolioPhoto[] {
  const fotos = Array.isArray(project.fotos) ? project.fotos : [];
  const imagens = Array.isArray(project.imagens) ? project.imagens : [];
  const source = fotos.length > 0 ? fotos : imagens;

  return [...source]
    .filter((photo) => Boolean(photo?.url))
    .sort((a, b) => a.posicao - b.posicao);
}

function getProjectCoverPhoto(
  project: PortfolioProject,
): PortfolioPhoto | null {
  const photos = getProjectPhotos(project);
  if (photos.length === 0) return null;

  const priority = photos.find((photo) => photo.posicao === 0);
  return priority || photos[0];
}

export default function ProviderProfilePage() {
  const params = useParams();
  const providerId = params.id as string;

  const [profile, setProfile] = useState<ProviderProfileResponse | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] =
    useState<PortfolioProject | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

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

  const openProject = (project: PortfolioProject) => {
    setSelectedProject(project);
    setSelectedPhotoIndex(0);
  };

  const selectedPhotos = selectedProject
    ? getProjectPhotos(selectedProject)
    : [];

  const currentPhoto =
    selectedPhotos[selectedPhotoIndex] || selectedPhotos[0] || null;

  const hasProjects = sortedProjects.length > 0;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
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
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/search"
            className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900 transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="text-xs uppercase tracking-widest">Voltar</span>
          </Link>
          <div className="text-center">
            <span className="block text-[10px] font-black uppercase text-slate-400 tracking-tighter">
              Perfil do Prestador
            </span>
            <span className="block text-xs font-mono font-bold text-slate-600">
              #{providerId?.slice(0, 8)}
            </span>
          </div>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <section className="rounded-4xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="bg-slate-100 border-b border-slate-200 px-6 py-6 lg:px-8 lg:py-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
                <div className="relative h-24 w-24 rounded-3xl overflow-hidden border border-slate-200 bg-slate-200 shrink-0">
                  <img
                    src={resolveImageUrl(providerImage)}
                    alt={`Foto de ${providerName}`}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="eager"
                  />
                </div>

                <div className="space-y-4 max-w-3xl">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">
                      <User size={14} />
                      {profile.premium ? "Prestador premium" : "Prestador"}
                      {profile.premium && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-amber-700">
                          <Award size={12} />
                          Portfólio disponível
                        </span>
                      )}
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-slate-900">
                      {providerName}
                    </h1>
                    <p className="text-base font-semibold text-slate-500">
                      {profile.nome}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                      <MapPin size={14} />
                      {profile.municipio}
                    </span>
                    {profile.profissoes.map((profissao) => (
                      <span
                        key={profissao.id}
                        className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-700"
                      >
                        {profissao.descricao}
                      </span>
                    ))}
                  </div>

                  {activeBio && (
                    <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 text-slate-700 shadow-sm">
                      <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400 mb-2">
                        Biografia
                      </p>
                      <p className="text-sm leading-6 font-medium">
                        {activeBio}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 lg:min-w-70">
                {profile.premium && (
                  <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.35em] text-amber-700">
                      Portfólio
                    </p>
                    <p className="mt-2 text-2xl font-black text-amber-900">
                      {hasProjects ? sortedProjects.length : 0}
                    </p>
                    <p className="text-xs font-semibold text-amber-700/80">
                      projetos exibidos
                    </p>
                  </div>
                )}
                <div className="rounded-3xl border border-slate-200 bg-white p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">
                    Serviços
                  </p>
                  <p className="mt-2 text-2xl font-black text-slate-900">
                    {serviceCount ?? "-"}
                  </p>
                  <p className="text-xs font-semibold text-slate-500">
                    concluídos
                  </p>
                </div>
                <div className="col-span-2 rounded-3xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">
                      Avaliações
                    </p>
                    <p className="mt-2 text-2xl font-black text-slate-900">
                      {sortedReviews.length}
                    </p>
                  </div>
                  <Link
                    href={`/provider/${providerId}/request`}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-900 transition-colors hover:bg-blue-600 hover:text-white"
                  >
                    <MessageSquare size={16} />
                    Solicitar Orçamento
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {profile.premium && (
          <section className="space-y-5">
            <div className="flex items-end justify-between gap-4 px-1">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">
                  Portfólio
                </p>
                <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900">
                  Projetos em destaque
                </h2>
              </div>
              <p className="hidden md:block text-sm font-semibold text-slate-500 max-w-xl text-right">
                Clique em um projeto para ver as fotos e os detalhes completos.
              </p>
            </div>

            {hasProjects ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {sortedProjects.map((project) => {
                  const photos = getProjectPhotos(project);
                  const cover = getProjectCoverPhoto(project);

                  return (
                    <button
                      key={project.id}
                      type="button"
                      onClick={() => openProject(project)}
                      className="group text-left rounded-[28px] overflow-hidden border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                        {cover ? (
                          <img
                            src={resolveImageUrl(cover.url)}
                            alt={project.titulo}
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-slate-400">
                            Sem foto
                          </div>
                        )}
                        {photos.length > 1 && (
                          <div className="absolute bottom-4 right-4 rounded-full bg-black/70 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                            +{photos.length - 1} fotos
                          </div>
                        )}
                      </div>

                      <div className="p-5 space-y-4">
                        <div className="space-y-2">
                          <h3 className="text-lg font-black tracking-tight text-slate-900">
                            {project.titulo}
                          </h3>
                          <p className="text-sm text-slate-600 line-clamp-2">
                            {project.descricao}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
                            <CalendarDays size={12} />
                            {formatDate(project.concluidoEm)}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-amber-700">
                            {project.regiao}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-[28px] border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500">
                Este prestador ainda não adicionou projetos ao portfólio.
              </div>
            )}
          </section>
        )}

        <section className="space-y-5">
          <div className="flex items-end justify-between gap-4 px-1">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">
                Avaliações
              </p>
              <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900">
                Experiência de clientes
              </h2>
            </div>
            <p className="hidden md:block text-sm font-semibold text-slate-500 max-w-xl text-right">
              As avaliações ficam em segundo plano em relação ao portfólio, como
              definido para a experiência premium.
            </p>
          </div>

          {sortedReviews.length > 0 ? (
            <div className="space-y-4">
              {sortedReviews.map((review) => {
                const firstImage = review.imagens?.[0];
                const reviewScore = convertNotaParaCincoPontos(review.nota);

                return (
                  <article
                    key={review.id}
                    className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-5">
                      {firstImage ? (
                        <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shrink-0 opacity-85">
                          <img
                            src={resolveImageUrl(firstImage.url)}
                            alt="Imagem da avaliação"
                            className="absolute inset-0 h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-slate-300 shrink-0">
                          <Star size={18} />
                        </div>
                      )}

                      <div className="min-w-0 flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-black uppercase tracking-widest text-amber-700">
                            <Star size={14} className="fill-current" />
                            {reviewScore.toFixed(1)}/5
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">
                            {formatDate(review.data)}
                          </span>
                        </div>

                        <p className="text-sm leading-6 text-slate-700">
                          {review.comentario}
                        </p>

                        <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1">
                            Serviço em {formatDate(review.servico.data)}
                          </span>
                          <span className="rounded-full bg-slate-100 px-2.5 py-1">
                            Total {formatCurrency(review.servico.total)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500">
              Ainda não existem avaliações públicas para este prestador.
            </div>
          )}
        </section>
      </div>

      <Dialog
        open={!!selectedProject}
        onOpenChange={(open: boolean) => {
          if (!open) {
            setSelectedProject(null);
            setSelectedPhotoIndex(0);
          }
        }}
      >
        <DialogContent className="max-w-6xl border border-slate-200 bg-white p-0 shadow-2xl overflow-hidden rounded-4xl">
          {selectedProject && (
            <div className="grid lg:grid-cols-[1.2fr_0.8fr] min-h-[70vh]">
              <div className="relative bg-slate-950">
                <div className="relative aspect-4/3 lg:h-full lg:min-h-[70vh]">
                  {currentPhoto ? (
                    <img
                      src={resolveImageUrl(currentPhoto.url)}
                      alt={selectedProject.titulo}
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-300">
                      Sem fotos disponíveis
                    </div>
                  )}
                </div>

                {selectedPhotos.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedPhotoIndex((current) =>
                          current === 0
                            ? selectedPhotos.length - 1
                            : current - 1,
                        )
                      }
                      className="absolute left-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition-colors hover:bg-black/70"
                    >
                      <ChevronLeft size={22} />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedPhotoIndex(
                          (current) => (current + 1) % selectedPhotos.length,
                        )
                      }
                      className="absolute right-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition-colors hover:bg-black/70"
                    >
                      <ChevronRight size={22} />
                    </button>
                  </>
                )}

                {selectedPhotos.length > 0 && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                    <div className="rounded-full bg-black/55 px-4 py-2 text-xs font-black uppercase tracking-widest text-white backdrop-blur">
                      {selectedPhotoIndex + 1} / {selectedPhotos.length}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col bg-slate-50">
                <div className="border-b border-slate-200 px-6 py-6 lg:px-8">
                  <DialogHeader className="text-left">
                    <DialogTitle className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900 pr-8">
                      {selectedProject.titulo}
                    </DialogTitle>
                  </DialogHeader>
                  <p className="mt-3 text-sm font-semibold text-slate-500">
                    {selectedProject.regiao}
                  </p>
                </div>

                <div className="flex-1 overflow-auto px-6 py-6 lg:px-8 space-y-6">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-3xl border border-slate-200 bg-white p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">
                        Valor
                      </p>
                      <p className="mt-2 text-xl font-black text-slate-900">
                        {formatCurrency(
                          selectedProject.exibirValor
                            ? selectedProject.valor
                            : null,
                        )}
                      </p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-white p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">
                        Conclusão
                      </p>
                      <p className="mt-2 text-sm font-black text-slate-900 leading-5">
                        {selectedProject.exibirConcluidoEm
                          ? formatDate(selectedProject.concluidoEm)
                          : "Não exibida"}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400 mb-2">
                      Descrição
                    </p>
                    <p className="text-sm leading-6 text-slate-700">
                      {selectedProject.descricao}
                    </p>
                  </div>

                  {selectedPhotos.length > 1 && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400 mb-3">
                        Fotos
                      </p>
                      <div className="grid grid-cols-4 gap-3">
                        {selectedPhotos.map((photo, index) => (
                          <button
                            key={photo.id}
                            type="button"
                            onClick={() => setSelectedPhotoIndex(index)}
                            className={`relative aspect-square overflow-hidden rounded-2xl border transition-all ${index === selectedPhotoIndex ? "border-blue-500 ring-2 ring-blue-500/20" : "border-slate-200 hover:border-slate-300"}`}
                          >
                            <img
                              src={resolveImageUrl(photo.url)}
                              alt={`${selectedProject.titulo} ${index + 1}`}
                              className="absolute inset-0 h-full w-full object-cover"
                              loading="lazy"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

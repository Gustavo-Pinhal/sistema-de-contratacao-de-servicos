"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Loader2, Star } from "lucide-react";
import { useUser } from "@/context/UserContext";

interface AvaliacaoResponse {
  id: string;
  data: string;
  nota: number;
  comentario: string | null;
  imagens: Array<{
    id: string;
    url: string;
  }>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

function formatarNotaCincoPontos(notaDez: number): string {
  const notaCinco = Math.max(0, Math.min(5, notaDez / 2));
  return Number.isInteger(notaCinco) ? `${notaCinco}` : notaCinco.toFixed(1);
}

export default function ServiceReviewPage() {
  const params = useParams();
  const serviceId = params.id as string;
  const { user, loading: userLoading } = useUser();

  const [avaliacao, setAvaliacao] = useState<AvaliacaoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageBlobUrls, setImageBlobUrls] = useState<Record<string, string>>(
    {},
  );

  const resolveImageUrl = (url: string) => {
    if (/^https?:\/\//i.test(url)) {
      return url;
    }

    const baseUrl = API_BASE_URL || window.location.origin;
    return new URL(url, baseUrl).toString();
  };

  useEffect(() => {
    if (userLoading) return;

    const token = user?.token;
    if (!serviceId) {
      setError("Serviço inválido.");
      setLoading(false);
      return;
    }

    const loadAvaliacao = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/servico/${serviceId}/avaliacao`,
          {
            headers: token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : undefined,
          },
        );

        if (response.status === 404) {
          setError("Este serviço ainda não possui avaliação.");
          return;
        }

        if (!response.ok) {
          throw new Error("Não foi possível carregar a avaliação.");
        }

        const data = (await response.json()) as AvaliacaoResponse;
        setAvaliacao(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Falha na conexão.");
      } finally {
        setLoading(false);
      }
    };

    loadAvaliacao();
  }, [serviceId, user?.token, userLoading]);

  const dataFormatada = useMemo(() => {
    if (!avaliacao?.data) return "-";
    return new Date(avaliacao.data).toLocaleString("pt-BR");
  }, [avaliacao?.data]);

  useEffect(() => {
    if (!avaliacao?.imagens?.length) {
      setImageBlobUrls({});
      return;
    }

    let cancelled = false;
    const objectUrls: string[] = [];

    const loadImages = async () => {
      const entries = await Promise.all(
        avaliacao.imagens.map(async (imagem) => {
          const originalUrl = resolveImageUrl(imagem.url);

          try {
            const response = await fetch(originalUrl, {
              headers: user?.token
                ? {
                    Authorization: `Bearer ${user.token}`,
                  }
                : undefined,
            });

            if (!response.ok) {
              return [imagem.id, originalUrl] as const;
            }

            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            objectUrls.push(blobUrl);
            return [imagem.id, blobUrl] as const;
          } catch {
            return [imagem.id, originalUrl] as const;
          }
        }),
      );

      if (!cancelled) {
        setImageBlobUrls(Object.fromEntries(entries));
      }
    };

    loadImages();

    return () => {
      cancelled = true;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [avaliacao?.imagens, user?.token]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
          Carregando Avaliação...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
        <p className="text-sm font-black text-red-500 uppercase tracking-widest mb-4">
          {error}
        </p>
        <Link
          href={`/service/${serviceId}`}
          className="text-xs font-bold text-slate-600 underline uppercase tracking-wider"
        >
          Voltar para o serviço
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <Link
          href={`/service/${serviceId}`}
          className="inline-flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900 transition-colors mb-6"
        >
          <ChevronLeft size={18} />
          <span className="text-xs uppercase tracking-widest">Voltar</span>
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 bg-slate-100">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500 mb-2">
              Avaliação Completa
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-700">
                <Star size={14} className="fill-current" />
                <span className="text-sm font-black">
                  {formatarNotaCincoPontos(avaliacao?.nota || 0)}/5
                </span>
              </div>
              <div className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                Nota API: {avaliacao?.nota ?? 0}/10
              </div>
              <div className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                {dataFormatada}
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <section>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                Comentário
              </p>
              <p className="text-sm font-semibold text-slate-800 leading-relaxed whitespace-pre-wrap">
                {avaliacao?.comentario?.trim() ||
                  "Nenhum comentário informado."}
              </p>
            </section>

            <section>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">
                Fotos
              </p>

              {avaliacao?.imagens?.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {avaliacao.imagens.map((imagem) => (
                    <a
                      key={imagem.id}
                      href={imagem.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 hover:opacity-90 transition-opacity"
                    >
                      <div className="relative aspect-4/3">
                        <img
                          src={
                            imageBlobUrls[imagem.id] ||
                            resolveImageUrl(imagem.url)
                          }
                          alt="Foto da avaliação"
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  Nenhuma foto foi anexada a esta avaliação.
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

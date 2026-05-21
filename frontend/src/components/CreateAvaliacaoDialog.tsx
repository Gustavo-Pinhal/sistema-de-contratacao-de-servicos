"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Loader2, Upload, X } from "lucide-react";

interface CreateAvaliacaoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  token: string;
  onSuccess?: () => void;
}

type SubmissionStep = "idle" | "creating-review" | "uploading-images";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

function formatNotaParaExibicao(nota: number): string {
  return Number.isInteger(nota) ? `${nota}` : nota.toFixed(1);
}

export function CreateAvaliacaoDialog({
  isOpen,
  onClose,
  serviceId,
  token,
  onSuccess,
}: CreateAvaliacaoDialogProps) {
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState("");
  const [imagens, setImagens] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submissionStep, setSubmissionStep] = useState<SubmissionStep>("idle");

  const isSubmitting = submissionStep !== "idle";

  const processLabel = useMemo(() => {
    if (submissionStep === "creating-review") {
      return "Registrando avaliação...";
    }

    if (submissionStep === "uploading-images") {
      return "Enviando fotos...";
    }

    return "";
  }, [submissionStep]);

  const resetState = () => {
    setNota(0);
    setComentario("");
    setImagens([]);
    setError(null);
    setSubmissionStep("idle");
  };

  const handleOpenChange = (open: boolean) => {
    if (isSubmitting) return;

    if (!open) {
      resetState();
      onClose();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    const invalidFile = files.find((file) => !file.type.startsWith("image/"));
    if (invalidFile) {
      setError("Apenas fotos podem ser enviadas.");
      return;
    }

    setError(null);
    setImagens((prev) => [...prev, ...files]);
    event.target.value = "";
  };

  const removeImagem = (index: number) => {
    setImagens((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!token) {
      setError("Você precisa estar autenticado para avaliar este serviço.");
      return;
    }

    if (nota < 0 || nota > 5) {
      setError("A nota deve estar entre 0 e 5.");
      return;
    }

    try {
      setSubmissionStep("creating-review");

      const notaApi = nota * 2;
      const reviewRes = await fetch(
        `${API_BASE_URL}/api/servico/${serviceId}/avaliacao`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nota: notaApi,
            comentario: comentario.trim() || undefined,
          }),
        },
      );

      if (!reviewRes.ok) {
        if (reviewRes.status === 403) {
          setError("Você não tem permissão para avaliar este serviço.");
          return;
        }

        if (reviewRes.status === 404) {
          setError("Serviço não encontrado.");
          return;
        }

        if (reviewRes.status === 422) {
          const data = await reviewRes.json().catch(() => null);
          setError(data?.message || "Dados da avaliação inválidos.");
          return;
        }

        setError("Não foi possível registrar a avaliação.");
        return;
      }

      if (imagens.length > 0) {
        setSubmissionStep("uploading-images");

        const formData = new FormData();
        imagens.forEach((imagem) => {
          formData.append("imagens[]", imagem);
        });

        const uploadRes = await fetch(
          `${API_BASE_URL}/api/servico/${serviceId}/avaliacao/upload`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          },
        );

        if (!uploadRes.ok) {
          if (uploadRes.status === 400) {
            setError("Nenhuma foto válida foi enviada.");
            return;
          }

          if (uploadRes.status === 403) {
            setError(
              "Você não tem permissão para enviar fotos desta avaliação.",
            );
            return;
          }

          if (uploadRes.status === 404) {
            setError("Avaliação não encontrada para envio das fotos.");
            return;
          }

          if (uploadRes.status === 422) {
            const data = await uploadRes.json().catch(() => null);
            setError(data?.message || "Uma ou mais fotos são inválidas.");
            return;
          }

          setError(
            "A avaliação foi salva, mas ocorreu erro ao enviar as fotos.",
          );
          return;
        }
      }

      onSuccess?.();
      resetState();
      onClose();
    } catch (err: any) {
      setError(err.message || "Erro na conexão com o servidor.");
    } finally {
      setSubmissionStep("idle");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Avaliar Serviço</DialogTitle>
          <DialogDescription>
            Informe uma nota de 0 a 5 (de meio em meio) e compartilhe sua
            experiência.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">
              Nota ({formatNotaParaExibicao(nota)}/5)
            </label>
            <Input
              type="range"
              min={0}
              max={5}
              step={0.5}
              value={nota}
              disabled={isSubmitting}
              onChange={(event) => setNota(Number(event.target.value))}
              className="h-10"
            />
            <p className="mt-1 text-xs text-slate-500">
              Na API será enviada como {formatNotaParaExibicao(nota * 2)}/10.
            </p>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">
              Comentário ({comentario.length}/2000)
            </label>
            <Textarea
              rows={5}
              value={comentario}
              maxLength={2000}
              disabled={isSubmitting}
              onChange={(event) => setComentario(event.target.value)}
              placeholder="Descreva como foi o atendimento e o resultado do serviço."
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">
              Fotos da avaliação (opcional)
            </label>
            <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 cursor-pointer hover:bg-slate-100 transition-colors">
              <Upload size={16} className="text-slate-500" />
              <span className="text-sm font-semibold text-slate-700">
                Selecionar fotos
              </span>
              <Input
                type="file"
                accept="image/*"
                multiple
                disabled={isSubmitting}
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {imagens.length > 0 && (
              <div className="mt-3 space-y-2 max-h-36 overflow-auto pr-1">
                {imagens.map((imagem, index) => (
                  <div
                    key={`${imagem.name}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2"
                  >
                    <p className="text-xs font-semibold text-slate-700 truncate">
                      {imagem.name}
                    </p>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => removeImagem(index)}
                      className="text-slate-500 hover:text-rose-600 transition-colors"
                      aria-label={`Remover ${imagem.name}`}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          {isSubmitting && (
            <div className="rounded-md bg-blue-50 p-3 text-sm font-semibold text-blue-700 flex items-center gap-2">
              <Loader2 className="animate-spin" size={16} />
              {processLabel}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={16} />
                  Processando...
                </>
              ) : (
                "Enviar Avaliação"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
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
import { Loader2 } from "lucide-react";

interface CreateAgendamentoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  onSuccess?: () => void;
  token: string;
}

export function CreateAgendamentoDialog({
  isOpen,
  onClose,
  serviceId,
  onSuccess,
  token,
}: CreateAgendamentoDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    data: "",
    observacoes: "",
  });

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    if (dateValue) {
      const isoString = new Date(dateValue).toISOString();
      const atomFormat = isoString.replace(/\.\d{3}Z$/, "+00:00");
      setFormData((prev) => ({
        ...prev,
        data: atomFormat,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        data: "",
      }));
    }
  };

  const handleObservacoesChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    if (e.target.value.length <= 1000) {
      setFormData((prev) => ({
        ...prev,
        observacoes: e.target.value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.data) {
      setError("Data do agendamento é obrigatória");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/servico/${serviceId}/agendamento`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: formData.data,
            observacoes: formData.observacoes || undefined,
          }),
        },
      );

      if (!response.ok) {
        if (response.status === 403) {
          setError("Você não tem permissão para criar agendamentos.");
          return;
        }
        if (response.status === 422) {
          const data = await response.json();
          setError(data.message || "Dados inválidos. Verifique o formulário.");
          return;
        }
        setError("Erro ao criar agendamento. Tente novamente.");
        return;
      }

      onSuccess?.();
      setFormData({ data: "", observacoes: "" });
      onClose();
    } catch (err: any) {
      setError(err.message || "Erro na conexão com o servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFormData({ data: "", observacoes: "" });
      setError(null);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Agendamento</DialogTitle>
          <DialogDescription>
            Propose uma data e hora para a realização do serviço.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">
              Data e Hora *
            </label>
            <Input
              type="datetime-local"
              value={
                formData.data
                  ? new Date(formData.data).toISOString().slice(0, 16)
                  : ""
              }
              onChange={handleDateChange}
              disabled={isLoading}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">
              Observações ({formData.observacoes.length}/1000)
            </label>
            <Textarea
              value={formData.observacoes}
              onChange={handleObservacoesChange}
              disabled={isLoading}
              placeholder="Disponibilidade no período da tarde..."
              rows={4}
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={16} />
                  Enviando...
                </>
              ) : (
                "Criar Agendamento"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

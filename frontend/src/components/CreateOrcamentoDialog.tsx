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
import { Loader2, Minus } from "lucide-react";

interface CreateOrcamentoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  onSuccess?: () => void;
  token: string;
}

export function CreateOrcamentoDialog({
  isOpen,
  onClose,
  serviceId,
  onSuccess,
  token,
}: CreateOrcamentoDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDesconto, setIsDesconto] = useState(false);
  const [formData, setFormData] = useState({
    descricao: "",
    valor: "",
    observacoes: "",
  });

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

  const handleDescricaoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length <= 255) {
      setFormData((prev) => ({
        ...prev,
        descricao: e.target.value,
      }));
    }
  };

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9.,]/g, "").replace(",", ".");
    setFormData((prev) => ({
      ...prev,
      valor: value,
    }));
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

    if (!formData.descricao.trim()) {
      setError("Descrição é obrigatória");
      return;
    }

    if (!formData.valor || isNaN(parseFloat(formData.valor))) {
      setError("Valor é obrigatório e deve ser um número válido");
      return;
    }

    setIsLoading(true);

    try {
      const valor = parseFloat(formData.valor);
      const valorFinal = isDesconto ? -valor : valor;

      const response = await fetch(
        `${API_BASE_URL}/api/servico/${serviceId}/orcamento`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            descricao: formData.descricao.trim(),
            valor: valorFinal,
            observacoes: formData.observacoes || undefined,
          }),
        },
      );

      if (!response.ok) {
        if (response.status === 403) {
          setError("Você não tem permissão para criar orçamentos.");
          return;
        }
        if (response.status === 422) {
          const data = await response.json();
          setError(data.message || "Dados inválidos. Verifique o formulário.");
          return;
        }
        setError("Erro ao criar orçamento. Tente novamente.");
        return;
      }

      onSuccess?.();
      setFormData({ descricao: "", valor: "", observacoes: "" });
      setIsDesconto(false);
      onClose();
    } catch (err: any) {
      setError(err.message || "Erro na conexão com o servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFormData({ descricao: "", valor: "", observacoes: "" });
      setIsDesconto(false);
      setError(null);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isDesconto ? "Adicionar Desconto" : "Criar Orçamento"}
          </DialogTitle>
          <DialogDescription>
            {isDesconto
              ? "Adicione um desconto ao valor total do serviço."
              : "Adicione um item de orçamento ao serviço."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2 p-1 rounded-lg bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => setIsDesconto(false)}
              className={`py-2 px-4 rounded-md font-semibold text-sm transition-all ${
                !isDesconto
                  ? "bg-emerald-600 text-white shadow-md"
                  : "bg-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Orçamento
            </button>
            <button
              type="button"
              onClick={() => setIsDesconto(true)}
              className={`py-2 px-4 rounded-md font-semibold text-sm transition-all ${
                isDesconto
                  ? "bg-rose-600 text-white shadow-md"
                  : "bg-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Desconto
            </button>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">
              Descrição * ({formData.descricao.length}/255)
            </label>
            <Input
              type="text"
              value={formData.descricao}
              onChange={handleDescricaoChange}
              disabled={isLoading}
              placeholder="Ex: Instalação de disjuntor adicional"
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">
              Valor *{" "}
              {isDesconto && <span className="text-rose-600">(desconto)</span>}
            </label>
            <div className="relative">
              {isDesconto && (
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rose-600 font-semibold">
                  <Minus size={18} />
                </div>
              )}
              <Input
                type="text"
                value={formData.valor}
                onChange={handleValorChange}
                disabled={isLoading}
                placeholder="0,00"
                className={`w-full font-semibold transition-colors ${
                  isDesconto
                    ? "border-rose-500 focus-visible:border-rose-600 focus-visible:ring-rose-500/50 text-rose-700 placeholder:text-rose-400 pl-10"
                    : "border-emerald-500 focus-visible:border-emerald-600 focus-visible:ring-emerald-500/50 text-emerald-700 placeholder:text-emerald-400"
                }`}
              />
            </div>
            {formData.valor && (
              <p
                className={`text-xs mt-1 font-semibold ${
                  isDesconto ? "text-rose-600" : "text-emerald-600"
                }`}
              >
                {isDesconto ? "−" : "+"} R${" "}
                {parseFloat(formData.valor).toFixed(2).replace(".", ",")}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">
              Observações ({formData.observacoes.length}/1000)
            </label>
            <Textarea
              value={formData.observacoes}
              onChange={handleObservacoesChange}
              disabled={isLoading}
              placeholder="Material incluso no valor..."
              rows={3}
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
              ) : isDesconto ? (
                "Adicionar Desconto"
              ) : (
                "Criar Orçamento"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

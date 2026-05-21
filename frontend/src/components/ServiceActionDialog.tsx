"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface ServiceActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  token: string;
  action: "finalize" | "cancel";
  onSuccess?: () => void;
}

export function ServiceActionDialog({
  isOpen,
  onClose,
  serviceId,
  token,
  action,
  onSuccess,
}: ServiceActionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

  const isFinalize = action === "finalize";
  const endpoint = isFinalize
    ? `${API_BASE_URL}/api/servico/${serviceId}/finalizar`
    : `${API_BASE_URL}/api/servico/${serviceId}/cancelar`;
  const title = isFinalize ? "Concluir Serviço" : "Cancelar Serviço";
  const description = isFinalize
    ? "Confirme para encerrar oficialmente este serviço."
    : "Confirme para cancelar este serviço.";
  const actionLabel = isFinalize ? "Concluir" : "Cancelar";

  const handleConfirm = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          alert("Você não tem permissão para realizar esta ação.");
          onClose();
          return;
        }

        if (response.status === 404) {
          alert("Serviço não encontrado.");
          onClose();
          return;
        }

        if (response.status === 422) {
          const data = await response.json();
          alert(data.message || "Não foi possível concluir esta ação.");
          return;
        }

        throw new Error("Erro ao processar a ação do serviço.");
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      alert(err.message || "Erro na conexão com o servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex gap-2">
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={
              isFinalize
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-rose-600 hover:bg-rose-700"
            }
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={16} />
                Processando...
              </>
            ) : (
              actionLabel
            )}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

"use client";

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
import { useState } from "react";

interface ConfirmAgendamentoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  agendamentoId: string;
  data: string;
  action: "confirm" | "decline";
  onSuccess?: () => void;
  token: string;
}

export function ConfirmAgendamentoDialog({
  isOpen,
  onClose,
  serviceId,
  agendamentoId,
  data,
  action,
  onSuccess,
  token,
}: ConfirmAgendamentoDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

  const handleConfirm = async () => {
    setIsLoading(true);

    try {
      const endpoint =
        action === "confirm"
          ? `${API_BASE_URL}/api/servico/${serviceId}/agendamento/${agendamentoId}/confirmar`
          : `${API_BASE_URL}/api/servico/${serviceId}/agendamento/${agendamentoId}/declinar`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          alert("Você não tem permissão para realizar esta ação.");
          onClose();
          return;
        }
        if (response.status === 404) {
          alert("Agendamento não encontrado.");
          onClose();
          return;
        }
        throw new Error("Erro ao processar agendamento");
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      alert(err.message || "Erro na conexão com o servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  const isConfirm = action === "confirm";
  const actionTitle = isConfirm ? "Confirmar" : "Recusar";
  const actionDescription = isConfirm
    ? "Você tem certeza que deseja confirmar este agendamento?"
    : "Você tem certeza que deseja recusar este agendamento?";

  return (
    <AlertDialog open={isOpen} onOpenChange={(open: any) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{actionTitle} Agendamento</AlertDialogTitle>
          <AlertDialogDescription>
            {actionDescription}
            <p className="mt-2 font-semibold text-slate-900">Data: {data}</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex gap-2">
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={
              isConfirm
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
              actionTitle
            )}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

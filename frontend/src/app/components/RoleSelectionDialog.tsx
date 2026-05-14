"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog"; // Certifique-se que o caminho está correto
import { Button } from "../../components/ui/button";
import { ShoppingBag, Briefcase, Building2 } from "lucide-react";
import Link from "next/link";

interface RoleSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  type: "login" | "register";
}

export function RoleSelectionDialog({
  isOpen,
  onClose,
  type,
}: RoleSelectionDialogProps) {
  const isReg = type === "register";

  // Mapeamento explícito de cores para evitar classes dinâmicas que o Tailwind ignora
  const roles = [
    {
      title: "Cliente",
      desc: "Buscar e contratar serviços",
      icon: ShoppingBag,
      styles: "bg-blue-100 text-blue-600",
      href: isReg ? "/login?mode=register&role=client" : "/login?role=client",
    },
    {
      title: "Prestador",
      desc: "Oferecer serviços profissionais",
      icon: Briefcase,
      styles: "bg-green-100 text-green-600",
      href: isReg
        ? "/login?mode=register&role=provider"
        : "/login?role=provider",
    },
    {
      title: "Empresa",
      desc: "Gerenciar equipe e serviços",
      icon: Building2,
      styles: "bg-purple-100 text-purple-600",
      href: isReg
        ? "/login?mode=register&role=business"
        : "/login?role=business",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-none rounded-[32px] p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tight text-slate-900">
            {type === "login" ? "Entrar como:" : "Cadastrar como:"}
          </DialogTitle>
          <DialogDescription className="font-medium text-slate-500">
            Selecione o tipo de conta para continuar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {roles.map((role) => (
            <Link
              key={role.title}
              href={role.href}
              onClick={onClose}
              className="block group"
            >
              <div className="flex items-center gap-5 p-4 rounded-2xl border border-slate-100 hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer">
                <div
                  className={`p-3 rounded-xl transition-colors ${role.styles}`}
                >
                  <role.icon className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <div className="text-lg font-bold text-slate-900 leading-none mb-1">
                    {role.title}
                  </div>
                  <div className="text-sm font-medium text-slate-500 group-hover:text-slate-600">
                    {role.desc}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <DialogFooter className="sm:justify-center mt-6">
          <Button
            variant="ghost"
            onClick={onClose}
            className="font-bold text-slate-400 hover:text-slate-900"
          >
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

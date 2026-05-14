import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
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

  const roles = [
    {
      title: "Cliente",
      desc: "Buscar e contratar serviços",
      icon: ShoppingBag,
      color: "blue",
      href: isReg ? "/client/login?mode=register" : "/client/login",
    },
    {
      title: "Prestador",
      desc: "Oferecer serviços profissionais",
      icon: Briefcase,
      color: "green",
      href: isReg ? "/provider/login?mode=register" : "/provider/login",
    },
    {
      title: "Empresa",
      desc: "Gerenciar equipe e serviços",
      icon: Building2,
      color: "purple",
      href: isReg ? "/business/login?mode=register" : "/business/login",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {type === "login" ? "Entrar como:" : "Cadastrar como:"}
          </DialogTitle>
          <DialogDescription>
            Selecione o tipo de conta para continuar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {roles.map((role) => (
            <Link
              key={role.title}
              href={role.href}
              onClick={onClose}
              className="block"
            >
              <Button
                variant="outline"
                className="w-full justify-start gap-5 p-6 h-auto hover:bg-slate-50 transition-all"
              >
                <div className={`bg-${role.color}-100 p-3 rounded-xl`}>
                  <role.icon className={`w-8 h-8 text-${role.color}-600`} />
                </div>
                <div className="text-left">
                  <div className="text-lg font-semibold">{role.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {role.desc}
                  </div>
                </div>
              </Button>
            </Link>
          ))}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

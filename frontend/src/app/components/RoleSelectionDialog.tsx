import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { ShoppingBag, Briefcase, Building2 } from "lucide-react";
import { Link } from "react-router";

interface RoleSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  type: "login" | "register";
}

export function RoleSelectionDialog({ isOpen, onClose, type }: RoleSelectionDialogProps) {
  const title = type === "login" ? "Entrar como:" : "Cadastrar como:";
  const description = type === "login" 
    ? "Selecione o tipo de conta para fazer login" 
    : "Selecione o tipo de conta para criar seu cadastro";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3">
          <Link 
            to={type === "register" ? "/client/login?mode=register" : "/client/login"} 
            onClick={onClose}
            className="block"
          >
            <Button variant="outline" className="w-full justify-start gap-5 p-6 h-auto hover:border-blue-300 hover:bg-blue-50/50 transition-all">
              <div className="bg-blue-100 p-3 rounded-xl">
                <ShoppingBag className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-left">
                <div className="text-lg font-semibold">Cliente</div>
                <div className="text-sm text-muted-foreground mt-1 whitespace-normal">Buscar e contratar serviços</div>
              </div>
            </Button>
          </Link>
          
          <Link 
            to={type === "register" ? "/provider/login?mode=register" : "/provider/login"} 
            onClick={onClose}
            className="block"
          >
            <Button variant="outline" className="w-full justify-start gap-5 p-6 h-auto hover:border-green-300 hover:bg-green-50/50 transition-all group relative">
              <div className="absolute top-2 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                  Opção Premium Disponível
                </span>
              </div>
              <div className="bg-green-100 p-3 rounded-xl group-hover:scale-110 transition-transform">
                <Briefcase className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-left">
                <div className="text-lg font-semibold">Prestador</div>
                <div className="text-sm text-muted-foreground mt-1 whitespace-normal">Oferecer serviços profissionais</div>
              </div>
            </Button>
          </Link>
          
          <Link 
            to={type === "register" ? "/business/login?mode=register" : "/business/login"} 
            onClick={onClose}
            className="block"
          >
            <Button variant="outline" className="w-full justify-start gap-5 p-6 h-auto hover:border-purple-300 hover:bg-purple-50/50 transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0">
                <div className="bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                  Conta Paga
                </div>
              </div>
              <div className="bg-purple-100 p-3 rounded-xl group-hover:scale-110 transition-transform">
                <Building2 className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-left">
                <div className="text-lg font-semibold flex items-center gap-2">
                  Empresa
                </div>
                <div className="text-sm text-muted-foreground mt-1 whitespace-normal">Gerenciar equipe e serviços profissionais</div>
              </div>
            </Button>
          </Link>
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

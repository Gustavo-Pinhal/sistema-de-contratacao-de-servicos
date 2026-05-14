import { useState } from "react";
import { Button } from "./ui/button";
import { RoleSelectionDialog } from "./RoleSelectionDialog";

export function SimpleHome() {
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-2xl w-full">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto rounded-lg bg-blue-600 flex items-center justify-center mb-4">
            <span className="text-white font-bold text-2xl">MA</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            Marido de Aluguel
          </h1>
          <p className="text-lg text-gray-600">
            Conectando clientes e prestadores de serviços com confiança
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg"
            onClick={() => setLoginDialogOpen(true)}
            className="px-8 py-6 text-lg"
          >
            Entrar
          </Button>
          <Button 
            size="lg"
            variant="outline"
            onClick={() => setRegisterDialogOpen(true)}
            className="px-8 py-6 text-lg"
          >
            Cadastrar
          </Button>
        </div>
      </div>

      {/* Role Selection Dialogs */}
      <RoleSelectionDialog 
        isOpen={loginDialogOpen}
        onClose={() => setLoginDialogOpen(false)}
        type="login"
      />
      
      <RoleSelectionDialog 
        isOpen={registerDialogOpen}
        onClose={() => setRegisterDialogOpen(false)}
        type="register"
      />
    </div>
  );
}

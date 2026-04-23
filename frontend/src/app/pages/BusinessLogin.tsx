import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Mail, Lock, Eye, EyeOff, Building2, ArrowLeft, Phone, CreditCard, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useUser } from "../context/UserContext";
import { PricingCards } from "../components/PricingCards";
import { Button } from "../components/ui/button";

export function BusinessLogin() {
  const navigate = useNavigate();
  const { setUserRole, setIsLoggedIn, setUserPlan } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get("mode") !== "register");
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    companyName: "",
    cnpj: "",
    phone: "",
    contactName: "",
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      setUserRole('business');
      setIsLoggedIn(true);
      navigate('/business/dashboard');
    } else {
      if (step < 3) {
        setStep(step + 1);
      } else {
        // Salvar cadastro e plano
        setUserRole('business');
        setIsLoggedIn(true);
        setUserPlan(selectedPlan);
        navigate('/business/dashboard');
      }
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            {!isLogin && (
              <>
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Empresa
                  </label>
                  <input
                    id="companyName"
                    type="text"
                    required={!isLogin}
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                    placeholder="Nome da sua empresa"
                  />
                </div>

                <div>
                  <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700 mb-2">
                    CNPJ
                  </label>
                  <input
                    id="cnpj"
                    type="text"
                    required={!isLogin}
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                    placeholder="00.000.000/0000-00"
                  />
                </div>

                <div>
                  <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Responsável
                  </label>
                  <input
                    id="contactName"
                    type="text"
                    required={!isLogin}
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                    placeholder="Seu nome"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="phone"
                      type="tel"
                      required={!isLogin}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Corporativo
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="contato@empresa.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500" />
                  <span className="ml-2 text-sm text-gray-600">Lembrar de mim</span>
                </label>
                <a href="#" className="text-sm text-pink-600 hover:text-pink-700">
                  Esqueceu a senha?
                </a>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-600 to-rose-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-pink-700 hover:to-rose-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-pink-100"
            >
              {isLogin ? 'Entrar' : 'Continuar para os Planos'}
              {!isLogin && <Sparkles className="w-4 h-4" />}
            </button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Escolha seu plano</h3>
              <p className="text-sm text-gray-600 mt-1">Selecione o plano que melhor atende sua empresa</p>
            </div>
            
            <PricingCards 
              selectedPlanId={selectedPlan || undefined} 
              onSelect={setSelectedPlan} 
            />

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setStep(1)}
              >
                Voltar
              </Button>
              <Button
                type="submit"
                disabled={!selectedPlan}
                className="flex-[2] bg-pink-600 hover:bg-pink-700 text-white"
              >
                Continuar para Pagamento
              </Button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-pink-50 border border-pink-100 rounded-xl p-4 flex items-start gap-3">
              <ShieldCheck className="w-6 h-6 text-pink-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-pink-900">Pagamento Seguro</p>
                <p className="text-xs text-pink-700 mt-0.5">Seus dados estão protegidos por criptografia de ponta a ponta.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome no Cartão</label>
                <input
                  type="text"
                  required
                  value={formData.cardName}
                  onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="COMO ESTÁ NO CARTÃO"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Número do Cartão</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.cardNumber}
                    onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="0000 0000 0000 0000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Validade</label>
                  <input
                    type="text"
                    required
                    value={formData.expiry}
                    onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="MM/AA"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                  <input
                    type="text"
                    required
                    value={formData.cvv}
                    onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="123"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12 text-lg font-bold shadow-lg shadow-purple-200"
              >
                Finalizar Assinatura
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full text-gray-500"
                onClick={() => setStep(2)}
              >
                Voltar
              </Button>
            </div>
            
            <p className="text-[10px] text-center text-gray-500">
              Ao confirmar, você autoriza a cobrança mensal de {selectedPlan === 'start' ? 'R$ 49,90' : 'R$ 99,90'} no seu cartão. Você pode cancelar a qualquer momento.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className={`mx-auto w-full ${step === 2 ? 'max-w-2xl' : 'max-w-sm lg:w-96'}`}>
          <div>
            <Link to="/" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-8">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Link>

            <div className={`flex items-center gap-3 mb-8 ${step === 2 ? 'justify-center' : ''}`}>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-orange-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                  {isLogin ? 'Bem-vindo de volta!' : step === 2 ? 'Planos e Preços' : step === 3 ? 'Pagamento' : 'Criar conta empresarial'}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-gray-600 font-medium">Área Empresarial</p>
                  {!isLogin && (
                    <div className="flex items-center gap-1">
                      <span className="w-1 h-1 bg-gray-400 rounded-full" />
                      <p className="text-xs text-purple-600 font-bold uppercase tracking-wider">Passo {step} de 3</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {isLogin && (
              <p className="text-gray-600 mb-8">
                Entre com sua conta para gerenciar sua equipe de prestadores.
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            {renderStep()}

            {isLogin && (
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600">
                  Não tem uma conta?{' '}
                  <button
                    type="button"
                    onClick={() => { setIsLogin(false); setStep(1); }}
                    className="text-purple-600 font-semibold hover:text-purple-700"
                  >
                    Cadastre sua empresa
                  </button>
                </p>
              </div>
            )}

            {!isLogin && step === 1 && (
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600">
                  Já tem uma conta?{' '}
                  <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className="text-purple-600 font-semibold hover:text-purple-700"
                  >
                    Fazer login
                  </button>
                </p>
              </div>
            )}
            
            {isLogin && (
              <>
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-gray-50 text-gray-500 uppercase tracking-widest text-[10px] font-bold">Outras opções</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/client/login"
                    className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-2.5 px-3 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    Cliente
                  </Link>
                  <Link
                    to="/provider/login"
                    className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-2.5 px-3 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    Prestador
                  </Link>
                </div>
              </>
            )}
          </form>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block relative w-0 flex-1">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1556761175-b413da4baf72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwb2ZmaWNlJTIwYnVzaW5lc3N8ZW58MXx8fHwxNzc1Njk2ODA4fDA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Equipe trabalhando"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/60 to-orange-600/30"></div>
        <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
          <div className="flex items-center gap-2 mb-4">
            <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-[10px] font-bold uppercase tracking-tighter">
              Versão Business
            </div>
          </div>
          <h3 className="text-4xl font-bold mb-4 tracking-tight">
            Expanda seu negócio com inteligência.
          </h3>
          <p className="text-xl text-purple-100 max-w-lg leading-relaxed">
            Nossa plataforma empresarial permite que você gerencie múltiplos profissionais, centralize orçamentos e cresça de forma organizada.
          </p>
          
          <div className="mt-8 grid grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <CheckCircle2 className="w-5 h-5 text-purple-300 mb-2" />
              <p className="text-sm font-bold">Gestão Centralizada</p>
              <p className="text-xs text-purple-200 mt-1">Todos os seus prestadores em um só lugar.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <Sparkles className="w-5 h-5 text-purple-300 mb-2" />
              <p className="text-sm font-bold">Destaque Premium</p>
              <p className="text-xs text-purple-200 mt-1">Sua empresa no topo dos resultados.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

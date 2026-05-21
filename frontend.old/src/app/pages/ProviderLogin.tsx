import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Mail, Lock, Eye, EyeOff, Briefcase, ArrowLeft, Phone, MapPin, Sparkles, CheckCircle2, ShieldCheck, CreditCard } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useUser } from "../context/UserContext";
import { PricingCards } from "../components/PricingCards";
import { Button } from "../components/ui/button";

export function ProviderLogin() {
  const navigate = useNavigate();
  const { register, login } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get("mode") !== "register");
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    service: "",
    city: "",
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: ""
  });

  const services = [
    "Eletricista",
    "Encanador",
    "Pintor",
    "Pedreiro",
    "Marceneiro",
    "Jardineiro",
    "Diarista",
    "Técnico de Ar Condicionado",
    "Chaveiro",
    "Outro"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      const success = login(formData.email, "provider");
      if (success) {
        navigate('/dashboard');
      } else {
        alert("Prestador nao encontrado na simulacao. Tente se cadastrar ou use joao.silva@prestador.com.");
      }
    } else {
      if (step === 1) {
        setStep(2);
      } else if (step === 2) {
        const selectedProviderPlan = selectedPlan === "premium" ? "premium" : "free";
        if (selectedPlan === 'free') {
          register({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            role: "provider",
            plan: selectedProviderPlan,
            city: formData.city
          });
          alert(`Bem-vindo, ${formData.name}! Seu perfil de prestador foi criado na simulacao.`);
          navigate('/dashboard');
        } else {
          setStep(3);
        }
      } else {
        register({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: "provider",
          plan: "premium",
          city: formData.city
        });
        alert(`Assinatura premium ativada! Bem-vindo, ${formData.name}.`);
        navigate('/dashboard');
      }
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  id="name"
                  type="text"
                  required={!isLogin}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Seu nome profissional"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            {!isLogin && (
              <>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone/WhatsApp *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="phone"
                      type="tel"
                      required={!isLogin}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-2">
                    Serviço Principal *
                  </label>
                  <select
                    id="service"
                    required={!isLogin}
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Selecione seu serviço</option>
                    {services.map((service) => (
                      <option key={service} value={service}>
                        {service}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    Cidade *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="city"
                      type="text"
                      required={!isLogin}
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="São Paulo, SP"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  <input type="checkbox" className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                  <span className="ml-2 text-sm text-gray-600">Lembrar de mim</span>
                </label>
                <a href="#" className="text-sm text-green-600 hover:text-green-700">
                  Esqueceu a senha?
                </a>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-100"
            >
              {isLogin ? 'Entrar' : 'Próximo Passo'}
              {!isLogin && <Sparkles className="w-4 h-4 text-green-300" />}
            </button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 font-display">Turbine seus resultados</h3>
              <p className="text-sm text-gray-600 mt-1">Selecione o plano ideal para sua carreira</p>
            </div>

            <PricingCards
              type="provider"
              selectedPlanId={selectedPlan || undefined}
              onSelect={setSelectedPlan}
            />

            <div className="flex gap-4 pt-2">
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
                className="flex-[2] bg-green-600 hover:bg-green-700 text-white font-bold"
              >
                {selectedPlan === 'free' ? 'Finalizar Cadastro' : 'Continuar'}
              </Button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-start gap-3">
              <ShieldCheck className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900">Checkout Seguro</p>
                <p className="text-xs text-green-700 mt-0.5">Seus dados estão 100% protegidos.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome Impresso no Cartão</label>
                <input
                  type="text"
                  required
                  value={formData.cardName}
                  onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="JOAO A SILVA"
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="123"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-lg font-bold shadow-lg shadow-green-100"
              >
                Ativar Plano Premium
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full text-gray-500"
                onClick={() => setStep(2)}
              >
                Voltar para Planos
              </Button>
            </div>
            
            <p className="text-[10px] text-center text-gray-500 leading-relaxed max-w-[280px] mx-auto">
              Cobrança mensal recorrente. Cancele quando quiser na área de configurações do seu painel.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Image */}
      <div className="hidden lg:block relative w-0 flex-1">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1678803262992-d79d06dd5d96?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25zdHJ1Y3Rpb24lMjB3b3JrZXIlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzc1Njk2ODA4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Profissional trabalhando"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-green-900/60 to-green-600/30"></div>
        <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
          <div className="flex items-center gap-2 mb-4">
             <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-[10px] font-bold uppercase tracking-tighter">
                Profissional Partner
             </div>
          </div>
          <h3 className="text-4xl font-bold mb-4 tracking-tight">
            Você profissional, nós as oportunidades.
          </h3>
          <p className="text-xl text-green-50 max-w-lg leading-relaxed">
            Junte-se à maior rede de prestadores da região e multiplique seus ganhos com total flexibilidade.
          </p>
          
          <div className="mt-8 grid grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <CheckCircle2 className="w-5 h-5 text-green-300 mb-2" />
              <p className="text-sm font-bold">Solicitações Diretas</p>
              <p className="text-xs text-green-100 mt-1">Receba pedidos no seu WhatsApp.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <Sparkles className="w-5 h-5 text-green-300 mb-2" />
              <p className="text-sm font-bold">Destaque na Busca</p>
              <p className="text-xs text-green-100 mt-1">Apareça no topo para mais clientes.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className={`mx-auto w-full ${step === 2 ? 'max-w-2xl' : 'max-w-sm lg:w-96'}`}>
          <div>
            <Link to="/" className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-8">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Link>
            
            <div className={`flex items-center gap-3 mb-8 ${step === 2 ? 'justify-center text-center' : ''}`}>
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-green-100">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                  {isLogin ? 'Área do Prestador' : step === 2 ? 'Planos Disponíveis' : step === 3 ? 'Ativar Assinatura' : 'Cadastro Profissional'}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                   <p className="text-sm text-gray-600 font-medium font-semibold">Transforme sua carreira</p>
                   {!isLogin && (
                    <div className="flex items-center gap-1">
                      <span className="w-1 h-1 bg-gray-400 rounded-full" />
                      <p className="text-xs text-green-600 font-bold uppercase tracking-wider">Passo {step} de {selectedPlan === 'free' ? '2' : '3'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {renderStep()}

            {isLogin && (
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600">
                  Ainda não é parceiro?{' '}
                  <button
                    type="button"
                    onClick={() => { setIsLogin(false); setStep(1); }}
                    className="text-green-600 font-semibold hover:text-green-700 underline-offset-4 hover:underline"
                  >
                    Cadastre-se e comece hoje
                  </button>
                </p>
              </div>
            )}

            {!isLogin && step === 1 && (
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600">
                  Já é nosso parceiro?{' '}
                  <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className="text-green-600 font-semibold hover:text-green-700 underline-offset-4 hover:underline"
                  >
                    Fazer Login
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
                    <span className="px-4 bg-gray-50 text-gray-500 uppercase tracking-widest text-[10px] font-bold">Outros Acessos</span>
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
                    to="/business/login"
                    className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-2.5 px-3 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    Empresa
                  </Link>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}


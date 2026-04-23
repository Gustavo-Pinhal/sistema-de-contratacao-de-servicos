import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Mail, Lock, Eye, EyeOff, ShoppingBag, ArrowLeft } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useUser } from "../context/UserContext";

export function ClientLogin() {
  const { register, login } = useUser();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get("mode") !== "register");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      const success = login(formData.email, "client");
      if (success) {
        navigate('/search');
      } else {
        alert("Email não encontrado na simulação. Tente se cadastrar!");
      }
    } else {
      register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: "client",
        plan: "free"
      });
      alert(`Bem-vindo, ${formData.name}! Sua conta foi criada na simulação.`);
      navigate('/search');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 font-bold">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Link>
            
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-100">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">
                  {isLogin ? 'Login' : 'Cadastro'}
                </h2>
                <h1 className="text-4xl font-black text-blue-600 mb-2">
                {isLogin ? "Bem-vindo de volta!" : "Criar conta"}
              </h1>
              <p className="text-gray-600 mb-8">
                {isLogin 
                  ? "Entre para acessar seus serviços e orçamentos"
                  : "Cadastre-se para encontrar os melhores profissionais"
                }
              </p>
              </div>
            </div>

            <p className="text-gray-500 font-medium mb-8 leading-relaxed">
              {isLogin 
                ? 'Entre com sua conta para encontrar os melhores profissionais.' 
                : 'Cadastre-se para contratar serviços com segurança e agilidade.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                  Nome Completo
                </label>
                <input
                  id="name"
                  type="text"
                  required={!isLogin}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-5 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-600 outline-none font-bold transition-all"
                  placeholder="Ex: Carlos Silva"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-600 outline-none font-bold transition-all"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="phone" className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                  Telefone
                </label>
                <input
                  id="phone"
                  type="tel"
                  required={!isLogin}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-5 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-600 outline-none font-bold transition-all"
                  placeholder="(11) 99999-9999"
                />
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-12 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-600 outline-none font-bold transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                  <span className="ml-2 text-xs font-bold text-gray-600">Lembrar de mim</span>
                </label>
                <a href="#" className="text-xs font-bold text-blue-600 hover:text-blue-700">
                  Esqueceu a senha?
                </a>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 hover:-translate-y-0.5"
            >
              {isLogin ? 'Entrar Agora' : 'Criar minha conta'}
            </button>

            <div className="text-center pt-2">
              <p className="text-sm font-medium text-gray-500">
                {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-blue-600 font-black uppercase tracking-widest text-xs hover:text-blue-700 ml-1"
                >
                  {isLogin ? 'Cadastre-se' : 'Fazer login'}
                </button>
              </p>
            </div>

            
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/provider/login"
                className="flex items-center justify-center gap-2 bg-white border-2 border-gray-300 text-gray-700 py-2.5 px-3 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Prestador
              </Link>
              <Link
                to="/business/login"
                className="flex items-center justify-center gap-2 bg-white border-2 border-gray-300 text-gray-700 py-2.5 px-3 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Empresa
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block relative w-0 flex-1">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1603714228681-b399854b8f80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXN0b21lciUyMHNlcnZpY2UlMjBoYXBweSUyMHBlcnNvbnxlbnwxfHx8fDE3NzU2OTY4MDh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Cliente feliz"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-blue-600/30"></div>
        <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
          <h3 className="text-3xl font-bold mb-4">
            Encontre profissionais qualificados
          </h3>
          <p className="text-lg text-blue-100">
            Milhares de prestadores verificados prontos para atender suas necessidades.
          </p>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { 
  ChevronLeft, 
  Star, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  GripVertical,
  Eye,
  Crown,
  Award,
  Briefcase,
  CheckCircle
} from "lucide-react";
import { useUser } from "../context/UserContext";

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  category: string;
  images: string[];
  order: number;
}

export function OrganizeProfile() {
  const navigate = useNavigate();
  const { userPlan } = useUser();
  const [activeTab, setActiveTab] = useState<'portfolio' | 'highlights' | 'services'>('portfolio');
  const isPremium = userPlan === "premium";
  
  // Mock portfolio items
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([
    {
      id: "1",
      title: "Instalação Elétrica Residencial Completa",
      description: "Instalação completa de sistema elétrico em apartamento de 80m²",
      category: "Eletricista",
      images: ["https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400"],
      order: 1
    },
    {
      id: "2",
      title: "Manutenção de Quadro Elétrico",
      description: "Revisão e atualização de quadro elétrico residencial",
      category: "Eletricista",
      images: ["https://images.unsplash.com/photo-1751486289947-4f5f5961b3aa?w=400"],
      order: 2
    }
  ]);

  const [highlights, setHighlights] = useState([
    { id: "1", text: "Mais de 10 anos de experiência", enabled: true },
    { id: "2", text: "Resposta em até 2 horas", enabled: true },
    { id: "3", text: "Garantia de 6 meses em todos os serviços", enabled: true },
    { id: "4", text: "Materiais de primeira qualidade", enabled: false }
  ]);

  const [featuredServices, setFeaturedServices] = useState([
    { id: "1", name: "Instalação Elétrica", featured: true },
    { id: "2", name: "Manutenção Preventiva", featured: true },
    { id: "3", name: "Troca de Fiação", featured: false },
    { id: "4", name: "Automação Residencial", featured: true }
  ]);

  const handleDeletePortfolio = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este item do portfólio?")) {
      setPortfolioItems(items => items.filter(item => item.id !== id));
    }
  };

  const handleSave = () => {
    alert("Alterações salvas com sucesso!");
    navigate("/dashboard");
  };

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
              <Crown className="w-8 h-8 text-amber-600" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-2">Recurso Premium</h1>
            <p className="text-gray-600 mb-8">
              A opção Organizar Perfil está disponível apenas para prestadores com plano premium.
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Voltar para o painel
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar para dashboard
        </Link>

        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg shadow-sm p-6 mb-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Organizar Perfil Premium</h1>
              <p className="text-amber-100">
                Destaque seu trabalho e atraia mais clientes
              </p>
            </div>
          </div>
        </div>

        {/* Premium Benefits Banner */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border-2 border-amber-200">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600" />
            Recursos Premium Ativos
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900 text-sm">Portfólio Ilimitado</p>
                <p className="text-xs text-gray-600">Adicione quantos trabalhos quiser</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900 text-sm">Destaques Personalizados</p>
                <p className="text-xs text-gray-600">Crie badges únicos para seu perfil</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900 text-sm">Prioridade nas Buscas</p>
                <p className="text-xs text-gray-600">Apareça primeiro nos resultados</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('portfolio')}
                className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                  activeTab === 'portfolio'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Portfólio
                </div>
              </button>
              <button
                onClick={() => setActiveTab('highlights')}
                className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                  activeTab === 'highlights'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Star className="w-5 h-5" />
                  Destaques
                </div>
              </button>
              <button
                onClick={() => setActiveTab('services')}
                className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                  activeTab === 'services'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Award className="w-5 h-5" />
                  Serviços em Destaque
                </div>
              </button>
            </div>
          </div>

          {/* Portfolio Tab */}
          {activeTab === 'portfolio' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-semibold text-gray-900">Gerenciar Portfólio</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Organize seus trabalhos anteriores para impressionar clientes
                  </p>
                </div>
                <Link
                  to="/provider/edit-profile"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  <Plus className="w-5 h-5" />
                  Adicionar Trabalho
                </Link>
              </div>

              <div className="space-y-4">
                {portfolioItems.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">Nenhum item no portfólio</p>
                    <Link
                      to="/provider/edit-profile"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar Primeiro Item
                    </Link>
                  </div>
                ) : (
                  portfolioItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex gap-4">
                        {/* Drag Handle */}
                        <div className="flex items-center">
                          <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                        </div>

                        {/* Image Preview */}
                        {item.images.length > 0 && (
                          <img
                            src={item.images[0]}
                            alt={item.title}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        )}

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900">{item.title}</h3>
                              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                            </div>
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full whitespace-nowrap">
                              {item.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                            <span className="text-sm text-gray-600">
                              Posição: {index + 1}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-start gap-2">
                          <Link
                            to={`/provider/1`}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Visualizar"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => handleDeletePortfolio(item.id)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Dica:</strong> Arraste os itens para reorganizar a ordem de exibição. 
                  Os trabalhos mais impressionantes devem aparecer primeiro!
                </p>
              </div>
            </div>
          )}

          {/* Highlights Tab */}
          {activeTab === 'highlights' && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="font-semibold text-gray-900">Destaques do Perfil</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Selecione até 4 destaques para aparecer no seu perfil
                </p>
              </div>

              <div className="space-y-3">
                {highlights.map((highlight) => (
                  <div
                    key={highlight.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Star className={`w-5 h-5 ${highlight.enabled ? 'text-amber-500 fill-amber-500' : 'text-gray-400'}`} />
                      <span className={`font-medium ${highlight.enabled ? 'text-gray-900' : 'text-gray-600'}`}>
                        {highlight.text}
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={highlight.enabled}
                        onChange={() => {
                          const enabledCount = highlights.filter(h => h.enabled).length;
                          if (!highlight.enabled && enabledCount >= 4) {
                            alert("Você pode selecionar no máximo 4 destaques");
                            return;
                          }
                          setHighlights(highlights.map(h =>
                            h.id === highlight.id ? { ...h, enabled: !h.enabled } : h
                          ));
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>

              <button className="mt-6 flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <Plus className="w-4 h-4" />
                Adicionar Novo Destaque
              </button>
            </div>
          )}

          {/* Featured Services Tab */}
          {activeTab === 'services' && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="font-semibold text-gray-900">Serviços em Destaque</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Escolha até 3 serviços para destacar no seu perfil
                </p>
              </div>

              <div className="space-y-3">
                {featuredServices.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Award className={`w-5 h-5 ${service.featured ? 'text-blue-600' : 'text-gray-400'}`} />
                      <span className={`font-medium ${service.featured ? 'text-gray-900' : 'text-gray-600'}`}>
                        {service.name}
                      </span>
                      {service.featured && (
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                          Em Destaque
                        </span>
                      )}
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={service.featured}
                        onChange={() => {
                          const featuredCount = featuredServices.filter(s => s.featured).length;
                          if (!service.featured && featuredCount >= 3) {
                            alert("Você pode destacar no máximo 3 serviços");
                            return;
                          }
                          setFeaturedServices(featuredServices.map(s =>
                            s.id === service.id ? { ...s, featured: !s.featured } : s
                          ));
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Preview Button */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Visualizar Perfil</h3>
              <p className="text-sm text-gray-600">
                Veja como seu perfil aparece para os clientes
              </p>
            </div>
            <Link
              to="/provider/1"
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            >
              <Eye className="w-5 h-5" />
              Pré-visualizar
            </Link>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Link
            to="/dashboard"
            className="flex-1 text-center px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </Link>
          <button
            onClick={handleSave}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
}

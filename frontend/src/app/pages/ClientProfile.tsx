import { Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { Mail, Phone, MapPin, Edit, Star, Calendar, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useSimulation } from "../context/SimulationContext";
import { useUser } from "../context/UserContext";

export function ClientProfile() {
  const { user, isLoggedIn } = useUser();
  const navigate = useNavigate();
  
  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-gray-900 uppercase mb-2">Acesso Restrito</h2>
          <p className="text-gray-600 mb-6">Você precisa estar logado para ver seu perfil.</p>
          <button 
            onClick={() => navigate('/client/login')}
            className="px-8 py-3 bg-green-600 text-white rounded-xl font-black text-xs uppercase tracking-widest"
          >
            Fazer Login
          </button>
        </div>
      </div>
    );
  }

  // Buscar serviços diretamente do localStorage para garantir dados atualizados
  const [serviceRequests, setServiceRequests] = useState<any[]>([]);
  
  useEffect(() => {
    const loadServices = () => {
      try {
        const services = JSON.parse(localStorage.getItem('serviceRequests') || '[]');
        console.log('DEBUG - ClientProfile - Carregando serviços diretamente do localStorage:', services);
        setServiceRequests(services);
      } catch (error) {
        console.error('Erro ao carregar serviços:', error);
        setServiceRequests([]);
      }
    };
    
    loadServices();
    
    // Forçar reload quando a página for focada (caso o usuário volte após avaliar)
    const handleFocus = () => loadServices();
    window.addEventListener('focus', handleFocus);
    
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Filter for the current client ID
  const clientServices = serviceRequests.filter((s: any) => s.clientId === user.id);
  
  console.log('DEBUG - ClientProfile - Todos os serviços do cliente:', clientServices);
  console.log('DEBUG - ClientProfile - ID do usuário:', user.id);
  
  const activeServices = clientServices.filter(s => s.status === 'active');
  const quoteServices = clientServices.filter(s => s.status === 'quote');
  const completedServices = clientServices.filter(s => s.status === 'completed');
  
  console.log('DEBUG - ClientProfile - Serviços concluídos:', completedServices);
  
  const pendingReview = completedServices.filter(s => !s.clientReview);
  const reviewedServices = completedServices.filter(s => s.clientReview).slice(0, 3);
  
  console.log('DEBUG - ClientProfile - Serviços com avaliação (clientReview):', reviewedServices);
  console.log('DEBUG - ClientProfile - Serviços pendentes de avaliação:', pendingReview);

  const averageRating = reviewedServices.length > 0
    ? (reviewedServices.reduce((sum, s) => sum + (s.clientReview?.rating || 0), 0) / reviewedServices.length).toFixed(1)
    : "5.0";

  const clientData = {
    ...user,
    totalServices: clientServices.length,
    rating: parseFloat(averageRating),
    avatar: user.avatar
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Meu Perfil</h1>
          <p className="text-gray-600 mt-2 font-medium">Gerencie suas informações pessoais e histórico de serviços</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              {/* Avatar */}
              <div className="text-center mb-6">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl mx-auto mb-4 bg-gray-100">
                  <img src={clientData.avatar} alt={clientData.name} className="w-full h-full object-cover" />
                </div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">{clientData.name}</h2>
                <p className="text-green-600 text-xs font-black uppercase tracking-widest mt-1">Cliente VIP</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b">
                <div className="text-center">
                  <div className="text-2xl font-black text-green-600 tracking-tight">{clientData.totalServices}</div>
                  <div className="text-xs text-gray-600">Serviços</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="text-2xl font-bold text-gray-900">{clientData.rating}</span>
                  </div>
                  <div className="text-xs text-gray-600">Avaliação</div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-gray-900">{clientData.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Telefone</p>
                    <p className="text-gray-900">{clientData.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Endereço</p>
                    <p className="text-gray-900">{clientData.address}</p>
                    <p className="text-gray-900">{clientData.city} - {clientData.state}</p>
                    <p className="text-gray-600 text-sm">CEP: {clientData.zipCode}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Membro desde</p>
                    <p className="text-gray-900">
                      {new Date(clientData.memberSince).toLocaleDateString('pt-BR', {
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <Link
                to="/client/edit-profile"
                className="mt-6 w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg font-black text-xs uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg shadow-green-100"
              >
                <Edit className="w-4 h-4" />
                Editar Perfil
              </Link>
            </div>

            {/* Badges */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Conquistas</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Cliente Verificado</p>
                    <p className="text-xs text-gray-600">Perfil completo e verificado</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Star className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Avaliador Premium</p>
                    <p className="text-xs text-gray-600">10+ avaliações feitas</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Cliente Pontual</p>
                    <p className="text-xs text-gray-600">Sempre presente nos agendamentos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Services Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pending Quotes */}
            {quoteServices.length > 0 && (
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-sm border border-yellow-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Orçamentos em Aberto</h2>
                    <p className="text-sm text-yellow-700">Aguardando proposta do prestador ou sua aprovação</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {quoteServices.map((service) => (
                    <div
                      key={service.id}
                      className="bg-white border border-yellow-200 rounded-lg p-5"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-lg mb-1">
                            {service.description}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {service.providerName} • {service.serviceType}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>Solicitado em {new Date(service.createdAt).toLocaleDateString('pt-BR')}</span>
                            {service.proposedValue && (
                              <span className="font-semibold text-green-600 text-lg">{service.proposedValue}</span>
                            )}
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                          <Clock className="w-4 h-4" />
                          Orçamento
                        </span>
                      </div>

                      <div className="flex gap-3 mt-4 pt-4 border-t">
                        <Link
                          to={`/service/${service.id}`}
                          className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition-colors text-center tracking-wide"
                        >
                          Ver Proposta / Chat
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active Services */}
            {activeServices.length > 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Serviços em Andamento</h2>
                    <p className="text-sm text-blue-700">Acompanhe os serviços que estão sendo executados no momento</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {activeServices.map((service) => (
                    <div
                      key={service.id}
                      className="bg-white border border-blue-200 rounded-lg p-5"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-lg mb-1">
                            {service.description}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {service.providerName} • {service.serviceType}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>Iniciado em {new Date(service.createdAt).toLocaleDateString('pt-BR')}</span>
                            {service.proposedValue && (
                              <span className="font-semibold text-blue-600">{service.proposedValue}</span>
                            )}
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          <Clock className="w-4 h-4" />
                          Em execução
                        </span>
                      </div>

                      <div className="flex gap-3 mt-4 pt-4 border-t">
                        <Link
                          to={`/service/${service.id}`}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center tracking-wide"
                        >
                          Acompanhar Serviço
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pending Reviews */}
            {pendingReview.length > 0 && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl shadow-sm border border-amber-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Serviços Concluídos</h2>
                    <p className="text-sm text-amber-700">Avalie os serviços concluídos para ajudar outros clientes</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {pendingReview.map((service) => (
                    <div
                      key={service.id}
                      className="bg-white border border-amber-200 rounded-lg p-5"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-lg mb-1">
                            {service.description}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {service.providerName} • {service.serviceType}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>Concluído em {new Date(service.completedAt!).toLocaleDateString('pt-BR')}</span>
                            {service.proposedValue && (
                              <span className="font-semibold text-blue-600">{service.proposedValue}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-4 pt-4 border-t">
                        <Link
                          to={`/service/${service.id}`}
                          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-center"
                        >
                          Ver Detalhes
                        </Link>
                        <Link
                          to={`/review/${service.id}`}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center flex items-center justify-center gap-2"
                        >
                          <Star className="w-4 h-4" />
                          Avaliar Serviço
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Reviewed Services */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Avaliações Realizadas</h2>

              {reviewedServices.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">Você ainda não avaliou nenhum serviço</p>
                  <Link
                    to="/search"
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Buscar Prestadores
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviewedServices.map((service) => (
                    <div
                      key={service.id}
                      className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg mb-1">
                            {service.description}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {service.providerName} • {service.serviceType}
                          </p>
                          <p className="text-sm text-gray-500">
                            Concluído em {new Date(service.completedAt!).toLocaleDateString('pt-BR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          <CheckCircle className="w-4 h-4" />
                          Concluído
                        </span>
                      </div>

                      {service.clientReview && (
                        <div className="border-t pt-3 mt-3">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-gray-700">Sua avaliação:</span>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < service.clientReview!.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 italic">"{service.clientReview.comment}"</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Preferences */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Preferências</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b">
                  <div>
                    <p className="font-medium text-gray-900">Notificações por Email</p>
                    <p className="text-sm text-gray-600">Receba atualizações dos seus serviços</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between pb-4 border-b">
                  <div>
                    <p className="font-medium text-gray-900">Notificações por WhatsApp</p>
                    <p className="text-sm text-gray-600">Atualizações via mensagem</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Newsletter</p>
                    <p className="text-sm text-gray-600">Novidades e promoções</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

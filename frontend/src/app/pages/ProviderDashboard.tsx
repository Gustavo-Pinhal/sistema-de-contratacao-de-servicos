import { useState } from "react";
import { Link } from "react-router";
import { Calendar, DollarSign, MapPin, User, Crown, Star, XCircle, CheckCircle2 } from "lucide-react";
import { useUser } from "../context/UserContext";
import { useSimulation } from "../context/SimulationContext";

export function ProviderDashboard() {
  const { userPlan, user } = useUser();
  const { serviceRequests } = useSimulation();
  const [activeTab, setActiveTab] = useState<'quotes' | 'active' | 'completed' | 'cancelled'>('quotes');

  const isPremium = userPlan === 'premium' || !userPlan; // Default to premium for mock consistency
  const planName = isPremium ? 'Plano Premium' : 'Plano Grátis';

  const currentProviderId = user?.id || "1";
  const myRequests = serviceRequests.filter(s => s.providerId === currentProviderId);

  const quoteRequests = myRequests.filter(s => s.status === 'quote');
  const activeServices = myRequests.filter(s => s.status === 'active');
  const completedServices = myRequests.filter(s => s.status === 'completed');
  const cancelledServices = myRequests.filter(s => s.status === 'cancelled');

  const getCurrentServices = () => {
    switch (activeTab) {
      case 'quotes': return quoteRequests;
      case 'active': return activeServices;
      case 'completed': return completedServices;
      case 'cancelled': return cancelledServices;
      default: return [];
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${isPremium ? 'bg-gradient-to-br from-green-600 to-teal-500 shadow-green-100' : 'bg-gray-400 shadow-gray-100'}`}>
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Meus Serviços</h1>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border shadow-sm ${isPremium ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                  {isPremium && <Star className="w-3.5 h-3.5 fill-green-600" />}
                  <span className="text-[10px] font-black uppercase tracking-wider">{planName}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-gray-600 font-medium tracking-tight">{user?.name || "João Silva"} • Eletricista</p>
                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                <p className="text-xs text-green-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Profissional Verificado
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/provider/subscription"
              className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition-all shadow-sm"
            >
              <DollarSign className="w-4 h-4" />
              Assinatura
            </Link>
            {isPremium && (
              <Link
                to="/provider/organize-profile"
                className="flex items-center gap-2 bg-amber-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-amber-700 transition-all shadow-lg shadow-amber-100"
              >
                <Crown className="w-4 h-4" />
                Organizar Perfil
              </Link>
            )}
            <Link
              to="/provider/edit-profile"
              className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-green-700 transition-all shadow-lg shadow-green-100"
            >
              <User className="w-4 h-4" />
              Editar Perfil
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600">Orçamentos Pendentes</p>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{quoteRequests.length}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600">Serviços Ativos</p>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{activeServices.length}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600">Concluídos (Mês)</p>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{completedServices.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('quotes')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'quotes'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Orçamentos Solicitados ({quoteRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'active'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Serviços Ativos ({activeServices.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'completed'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Concluídos ({completedServices.length})
            </button>
            <button
              onClick={() => setActiveTab('cancelled')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'cancelled'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Cancelados ({cancelledServices.length})
            </button>
          </div>
        </div>

        {/* Services List */}
        <div className="space-y-4">
          {getCurrentServices().map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}

          {getCurrentServices().length === 0 && (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Calendar className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nenhum serviço encontrado
              </h3>
              <p className="text-gray-600">
                {activeTab === 'quotes' && "Você não tem solicitações de orçamento pendentes"}
                {activeTab === 'active' && "Você não tem serviços ativos no momento"}
                {activeTab === 'completed' && "Você ainda não concluiu nenhum serviço"}
                {activeTab === 'cancelled' && "Você não tem nenhum serviço cancelado"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ServiceCard({ service }: { service: any }) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'quote':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">Orçamento</span>;
      case 'active':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">Ativo</span>;
      case 'completed':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">Concluído</span>;
      case 'cancelled':
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">Cancelado</span>;
      default:
        return null;
    }
  };

  return (
    <Link
      to={`/manage-service/${service.id}`}
      className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6 text-gray-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-gray-900">{service.clientName}</h3>
              {getStatusBadge(service.status)}
            </div>
            <p className="text-green-600 font-black uppercase tracking-widest text-[10px] mb-1">{service.serviceType}</p>
            <p className="text-gray-600 text-sm">{service.description}</p>
          </div>
        </div>

        {service.proposedValue && (
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">Valor</p>
            <p className="text-2xl font-black text-green-600 tracking-tighter">{service.proposedValue}</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          {service.address}
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          {service.status === 'completed' && service.completedAt
            ? `Concluído: ${new Date(service.completedAt).toLocaleDateString('pt-BR')}`
            : `Criado: ${new Date(service.createdAt).toLocaleDateString('pt-BR')}`
          }
        </div>
      </div>

      {service.status === 'completed' && service.clientReview && (
        <div className="border-t pt-4 mt-2">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span className="font-semibold text-gray-900">Avaliação do Cliente</span>
            </div>
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < service.clientReview.rating
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="ml-2 text-sm font-semibold text-gray-700">
                {service.clientReview.rating}.0
              </span>
            </div>
            <p className="text-sm text-gray-700 italic">"{service.clientReview.comment}"</p>
            <p className="text-xs text-gray-500 mt-2">
              Avaliado em {new Date(service.clientReview.createdAt).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
      )}

      {service.status === 'completed' && !service.clientReview && (
        <div className="border-t pt-4 mt-2">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-sm text-gray-600 text-center">
              Aguardando avaliação do cliente
            </p>
          </div>
        </div>
      )}
    </Link>
  );
}
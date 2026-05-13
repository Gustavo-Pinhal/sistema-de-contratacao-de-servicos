import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { 
  ChevronLeft, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  Clock, 
  MapPin, 
  FileText,
  User,
  AlertCircle,
  MessageCircle
} from "lucide-react";
import { useSimulation } from "../context/SimulationContext";
import { mockProviders } from "../data/mockData";

export function QuoteDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { serviceRequests, updateRequestStatus } = useSimulation();
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);

  const { user } = useUser();
  const request = serviceRequests.find((req) => req.id === id);
  const provider = request ? mockProviders.find(p => p.id === request.providerId) : null;

  if (!request || !request.quoteDetails || request.clientId !== user?.id) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-black text-gray-900 mb-4 uppercase tracking-tight">Orçamento não encontrado</h1>
          <Link to="/client/profile" className="text-green-600 font-bold hover:underline">
            Voltar para o perfil
          </Link>
        </div>
      </div>
    );
  }

  const quote = request.quoteDetails;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleAccept = () => {
    updateRequestStatus(request.id, 'active');
    alert("Orçamento aceito com sucesso! O serviço agora está em andamento.");
    navigate("/client/profile");
  };

  const handleDecline = () => {
    updateRequestStatus(request.id, 'cancelled');
    alert("Orçamento recusado.");
    navigate("/client/profile");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/client/profile"
          className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-6 font-bold"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar ao perfil
        </Link>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Detalhes do Orçamento</h1>
              <p className="text-gray-600">ID: {quote.id}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Valor Total</p>
              <p className="text-3xl font-bold text-green-600">{quote.value}</p>
            </div>
          </div>

          {/* Quick Info */}
          <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Duração Estimada</p>
                <p className="font-semibold text-gray-900">{quote.estimatedDuration}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Válido Até</p>
                <p className="font-semibold text-gray-900">{formatDate(quote.validUntil)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Criado em</p>
                <p className="font-semibold text-gray-900">
                  {new Date(quote.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600" />
                Descrição do Serviço
              </h2>
              <p className="text-gray-700">{quote.description}</p>
            </div>

            {/* Service Request Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Informações da Solicitação</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Tipo de Serviço</p>
                  <p className="font-semibold text-gray-900">{request.serviceType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Sua Descrição</p>
                  <p className="text-gray-900">{request.description}</p>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Endereço</p>
                    <p className="text-gray-900">{request.address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {quote.notes && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                <h2 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Observações do Prestador
                </h2>
                <p className="text-amber-800">{quote.notes}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Provider Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Prestador</h3>
              <div className="flex items-center gap-3 mb-4">
                {provider ? (
                  <img 
                    src={provider.avatar} 
                    alt={request.providerName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-600" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900">{request.providerName}</p>
                  <p className="text-sm text-gray-600">{request.serviceType}</p>
                  {provider && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-amber-500">★</span>
                      <span className="text-sm font-semibold">{provider.rating}</span>
                      <span className="text-xs text-gray-600">({provider.reviewCount})</span>
                    </div>
                  )}
                </div>
              </div>
              <Link
                to={`/provider/${request.providerId}`}
                className="block w-full text-center px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors font-semibold"
              >
                Ver Perfil Completo
              </Link>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Ações</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowAcceptDialog(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  <CheckCircle className="w-5 h-5" />
                  Aceitar Orçamento
                </button>
                <button
                  onClick={() => setShowDeclineDialog(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-semibold"
                >
                  <XCircle className="w-5 h-5" />
                  Recusar Orçamento
                </button>
                <Link
                  to={`/service/${request.id}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  <MessageCircle className="w-5 h-5" />
                  Conversar
                </Link>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-900">
                <span className="font-semibold">Dica:</span> Você pode conversar 
                com o prestador para esclarecer dúvidas antes de aceitar o orçamento.
              </p>
            </div>
          </div>
        </div>

        {/* Accept Dialog */}
        {showAcceptDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Aceitar Orçamento</h2>
              </div>
              <p className="text-gray-600 mb-6">
                Tem certeza que deseja aceitar este orçamento de <strong>{quote.value}</strong>? 
                O prestador será notificado e o serviço passará para o status ativo.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAcceptDialog(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAccept}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Decline Dialog */}
        {showDeclineDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Recusar Orçamento</h2>
              </div>
              <p className="text-gray-600 mb-6">
                Tem certeza que deseja recusar este orçamento? O prestador será notificado 
                e você poderá solicitar um novo orçamento se desejar.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeclineDialog(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDecline}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Recusar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

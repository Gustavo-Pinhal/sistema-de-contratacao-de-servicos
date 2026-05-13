import { Link } from "react-router";
import { ChevronLeft, Calendar, Clock, MapPin, FileText, CheckCircle, XCircle, Eye } from "lucide-react";
import { useSimulation } from "../context/SimulationContext";
import { useUser } from "../context/UserContext";

export function ViewQuotes() {
  const { serviceRequests } = useSimulation();
  const { user } = useUser();

  // Filter service requests that have quotes (status = 'quote' and belong to current user ID)
  const quotesReceived = serviceRequests.filter(
    (req) => req.status === 'quote' && req.clientId === user?.id
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusBadge = (validUntil?: string) => {
    if (!validUntil) return <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Válido</span>;
    
    const today = new Date();
    const expiryDate = new Date(validUntil);
    const daysRemaining = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysRemaining < 0) {
      return <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">Expirado</span>;
    } else if (daysRemaining <= 3) {
      return <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">Expira em breve</span>;
    }
    return <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Válido</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/client/profile"
          className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-6 font-bold"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar ao perfil
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tight">Meus Orçamentos</h1>
          <p className="text-gray-600 font-medium font-medium">
            Visualize e gerencie os orçamentos recebidos dos prestadores para {user?.name}
          </p>
        </div>

        {/* Quotes List */}
        {quotesReceived.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">
              Nenhum orçamento encontrado
            </h3>
            <p className="text-gray-500 font-medium mb-8 max-w-sm mx-auto">
              Sua conta é nova ou você ainda não solicitou novos serviços nesta simulação.
            </p>
            <Link
              to="/search"
              className="inline-block px-8 py-4 bg-green-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg shadow-green-100"
            >
              Buscar Prestadores
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {quotesReceived.map((request) => {
              const quote = request.quoteDetails;
              
              return (
                <div
                  key={request.id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all overflow-hidden border border-gray-100 group"
                >
                  {/* Card Header */}
                  <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-black text-gray-900 mb-1 uppercase tracking-tight text-lg">
                          {request.providerName}
                        </h3>
                        <p className="text-xs font-black uppercase tracking-widest text-green-600">{request.serviceType}</p>
                      </div>
                      {getStatusBadge(quote?.validUntil)}
                    </div>
                    
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-3xl font-black text-green-600 tracking-tighter">
                        {request.proposedValue || quote?.value || "A definir"}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-500 font-medium line-clamp-2">
                      {request.description}
                    </p>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-3">
                    {/* Service Details */}
                    <div className="space-y-2 text-sm font-medium">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4 flex-shrink-0 text-green-500" />
                        <span>Duração: {quote?.estimatedDuration || "Estimativa no chat"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4 flex-shrink-0 text-green-500" />
                        <span className="line-clamp-1">{request.address || "Endereço não informado"}</span>
                      </div>
                      {quote?.validUntil && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4 flex-shrink-0 text-green-500" />
                          <span>Válido até {formatDate(quote.validUntil)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="p-6 pt-0 space-y-2">
                    <Link
                      to={`/service/${request.id}`}
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-black text-xs uppercase tracking-widest shadow-lg shadow-green-100"
                    >
                      <Eye className="w-4 h-4" />
                      Ver Chat e Detalhes
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-semibold text-green-900 mb-2">
            Dicas para avaliar orçamentos
          </h3>
          <ul className="text-sm text-green-800 space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Compare os itens inclusos em cada orçamento</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Verifique a reputação e avaliações do prestador</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Fique atento à validade do orçamento</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Entre em contato com o prestador para esclarecer dúvidas</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

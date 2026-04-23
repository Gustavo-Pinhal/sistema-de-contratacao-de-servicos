import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { ChevronLeft, Send, User, CheckCircle, XCircle, Calendar, Clock, Wrench, Check, CheckCheck } from "lucide-react";
import { useSimulation } from "../context/SimulationContext";
import { useUser } from "../context/UserContext";

export function ServiceTracking() {
  const { id } = useParams();
  const { serviceRequests, addChatMessage, markMessagesAsRead, updateRequestStatus } = useSimulation();
  const { user } = useUser();
  const service = serviceRequests.find(s => s.id === id);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (id) {
      markMessagesAsRead(id, "client");
    }
  }, [id]);

  if (!service || service.clientId !== user?.id) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-black text-gray-900 mb-4 uppercase tracking-tight">Serviço não encontrado</h1>
          <Link to="/client/profile" className="text-green-600 font-bold hover:underline">
            Voltar para o perfil
          </Link>
        </div>
      </div>
    );
  }

  const handleSendMessage = () => {
    if (message.trim()) {
      addChatMessage(service.id, "client", message);
      setMessage("");
    }
  };

  const handleAcceptQuote = () => {
    if (confirm("Deseja aceitar este orçamento?")) {
      updateRequestStatus(service.id, "active");
      alert("Orçamento aceito! O serviço agora está em andamento.");
    }
  };

  const handleDeclineQuote = () => {
    if (confirm("Deseja recusar este orçamento?")) {
      updateRequestStatus(service.id, "cancelled");
      alert("Orçamento recusado.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'quote': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'quote': return 'Orçamento';
      case 'active': return 'Ativo';
      case 'completed': return 'Concluído';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/search"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar
        </Link>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Acompanhar Serviço</h1>
              <p className="text-gray-600">ID: {service.id}</p>
            </div>
            <div className={`inline-flex items-center px-4 py-2 rounded-lg border font-semibold ${getStatusColor(service.status)}`}>
              {getStatusText(service.status)}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tipo de Serviço</p>
              <p className="font-semibold text-gray-900">{service.serviceType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Data de Criação</p>
              <p className="font-semibold text-gray-900">
                {new Date(service.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Endereço</p>
              <p className="font-semibold text-gray-900">{service.address}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Descrição</p>
              <p className="font-semibold text-gray-900">{service.description}</p>
            </div>
          </div>
        </div>

        {/* Service Progress/Status Section - Only for Active and Completed */}
        {(service.status === 'active' || service.status === 'completed') && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              {service.status === 'active' ? (
                <>
                  <Wrench className="w-6 h-6 text-green-600" />
                  Serviço em Andamento
                </>
              ) : (
                <>
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  Serviço Concluído
                </>
              )}
            </h2>
            
            {service.status === 'active' && (
              <div className="space-y-4">
                <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded-r-lg">
                  <p className="font-semibold text-green-900 mb-2">Status Atual</p>
                  <p className="text-green-800 text-sm">
                    O prestador está executando o serviço. Você pode acompanhar o progresso através do chat
                    e visualizar as informações da visita agendada.
                  </p>
                </div>
                
                {service.visitScheduled && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-5 h-5 text-gray-600" />
                        <p className="font-semibold text-gray-900">Data da Visita</p>
                      </div>
                      <p className="text-gray-700">
                        {new Date(service.visitScheduled.date).toLocaleDateString('pt-BR')} às {service.visitScheduled.time}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-5 h-5 text-gray-600" />
                        <p className="font-semibold text-gray-900">Valor Acordado</p>
                      </div>
                      <p className="text-gray-700 text-lg font-bold">{service.proposedValue}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {service.status === 'completed' && (
              <div className="space-y-4">
                <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded-r-lg">
                  <p className="font-semibold text-green-900 mb-2">Serviço Finalizado</p>
                  <p className="text-green-800 text-sm">
                    O serviço foi concluído em {service.completedAt && new Date(service.completedAt).toLocaleDateString('pt-BR')}.
                    {!service.clientReview && ' Não esqueça de avaliar o prestador!'}
                  </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Valor Final</p>
                    <p className="text-xl font-bold text-gray-900">{service.proposedValue}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Data de Conclusão</p>
                    <p className="font-semibold text-gray-900">
                      {service.completedAt && new Date(service.completedAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Status da Avaliação</p>
                    <p className="font-semibold text-gray-900">
                      {service.clientReview ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Avaliado
                        </span>
                      ) : (
                        <span className="text-yellow-600">Pendente</span>
                      )}
                    </p>
                  </div>
                </div>

                {service.clientReview && (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <p className="font-semibold text-gray-900">Sua Avaliação</p>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={i < service.clientReview!.rating ? 'text-yellow-500' : 'text-gray-300'}>
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm italic">"{service.clientReview.comment}"</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Avaliado em {new Date(service.clientReview.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chat */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm flex flex-col h-[600px]">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Conversa</h2>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {service.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'client' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        msg.sender === 'client'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm font-semibold mb-1">
                        {msg.sender === 'client' ? 'Você' : service.providerName}
                      </p>
                      <p>{msg.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs opacity-70">
                          {new Date(msg.timestamp).toLocaleString('pt-BR')}
                        </p>
                        {msg.sender === 'client' && (
                          <span className={`text-xs flex items-center gap-1 ${msg.readByProvider ? 'text-green-300' : 'text-gray-300'}`}>
                            {msg.readByProvider ? (
                              <>
                                <CheckCheck className="w-3 h-3" />
                                Lida
                              </>
                            ) : (
                              <>
                                <Check className="w-3 h-3" />
                                Enviada
                              </>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Provider Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Prestador</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{service.providerName}</p>
                  <p className="text-sm text-gray-600">{service.serviceType}</p>
                </div>
              </div>
              <Link
                to={`/provider/${service.providerId}`}
                className="block w-full text-center px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
              >
                Ver Perfil
              </Link>
            </div>

            {/* Actions Panel */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Ações do Serviço</h3>

              {service.proposedValue && (
                <div className="mb-4 p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Valor Proposto</p>
                  <p className="text-2xl font-bold text-green-600">{service.proposedValue}</p>
                </div>
              )}

              {/* Schedule Visit Button */}
              {!service.visitScheduled && service.status !== 'completed' && (
                <Link
                  to={`/service/${service.id}/schedule-visit`}
                  className="block w-full mb-3 text-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  Agendar Visita
                </Link>
              )}

              {/* Visit Scheduled Info */}
              {service.visitScheduled && (
                <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <p className="font-semibold text-purple-900">Visita Agendada</p>
                  </div>
                  <p className="text-sm text-purple-800">
                    {new Date(service.visitScheduled.date).toLocaleDateString('pt-BR')} às {service.visitScheduled.time}
                  </p>
                  <Link
                    to={`/service/${service.id}/schedule-visit`}
                    className="text-sm text-purple-600 hover:text-purple-800 font-semibold mt-2 inline-block"
                  >
                    Ver detalhes →
                  </Link>
                </div>
              )}

              {service.status === 'quote' && service.proposedValue && (
                <div className="space-y-3">
                  <Link
                    to={`/quote/${service.id}`}
                    className="block w-full text-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                  >
                    Ver Orçamento Completo
                  </Link>
                  <button
                    onClick={handleAcceptQuote}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Aceitar Orçamento
                  </button>
                  <button
                    onClick={handleDeclineQuote}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-semibold"
                  >
                    <XCircle className="w-5 h-5" />
                    Declinar
                  </button>
                </div>
              )}

              {service.status === 'quote' && !service.proposedValue && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Aguardando o prestador enviar uma proposta de valor
                  </p>
                </div>
              )}

              {service.status === 'active' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    Serviço em andamento. Converse com o prestador pelo chat para acompanhar o progresso.
                  </p>
                </div>
              )}

              {service.status === 'completed' && (
                <Link
                  to={`/review/${service.id}`}
                  className="block w-full text-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  Avaliar Serviço
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
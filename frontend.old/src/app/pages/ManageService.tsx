import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { ChevronLeft, Send, User, DollarSign, Star, CheckCircle, Check, CheckCheck, Calendar } from "lucide-react";
import { useUser } from "../context/UserContext";
import { useSimulation } from "../context/SimulationContext";

export function ManageService() {
  const { id } = useParams();
  const { userRole } = useUser();
  const { serviceRequests, addChatMessage, markMessagesAsRead, updateRequestStatus, updateProposedValue } = useSimulation();
  
  const service = serviceRequests.find(s => s.id === id);
  const [message, setMessage] = useState("");
  const [proposedValue, setProposedValue] = useState("");
  const [showValueInput, setShowValueInput] = useState(false);

  useEffect(() => {
    if (service) {
      setProposedValue(service.proposedValue || "");
    }
  }, [service]);

  useEffect(() => {
    if (id && (userRole === "provider" || userRole === "client")) {
      markMessagesAsRead(id, userRole);
    }
  }, [id, userRole]);

  const themeColor = userRole === 'business' ? 'pink' : 'green';

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 font-black uppercase">Serviço não encontrado</h1>
          <Link to="/dashboard" className={`text-${themeColor}-600 hover:underline font-bold`}>
            Voltar para dashboard
          </Link>
        </div>
      </div>
    );
  }

  const handleSendMessage = () => {
    if (message.trim()) {
      addChatMessage(service.id, userRole === 'client' ? 'client' : 'provider', message);
      setMessage("");
    }
  };

  const handleSubmitValue = () => {
    if (proposedValue.trim()) {
      updateProposedValue(service.id, proposedValue);
      setShowValueInput(false);
    }
  };

  const handleCompleteService = () => {
    if (confirm("Deseja marcar este serviço como concluído?")) {
      updateRequestStatus(service.id, "completed");
    }
  };

  const handleCancelService = () => {
    const reason = prompt("Por favor, informe o motivo do cancelamento:");
    if (reason !== null) {
      updateRequestStatus(service.id, "cancelled");
    }
  };

  const handleAcceptQuote = () => {
    if (confirm("Deseja aceitar este orçamento?")) {
      updateRequestStatus(service.id, "active");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'quote': return 'bg-yellow-100 text-yellow-800 border-yellow-200 shadow-sm shadow-yellow-50';
      case 'active': return `bg-${themeColor}-100 text-${themeColor}-800 border-${themeColor}-200 shadow-sm shadow-${themeColor}-50`;
      case 'completed': return 'bg-green-100 text-green-800 border-green-200 shadow-sm shadow-green-50';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200 shadow-sm shadow-red-50';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'quote': return 'Aguardando Orçamento';
      case 'active': return 'Serviço em Andamento';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to={userRole === 'client' ? "/client/profile" : "/dashboard"}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-bold transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar para {userRole === 'client' ? "Perfil" : "Dashboard"}
        </Link>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-100 p-8 mb-8 border border-gray-50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tight">Gerenciar Serviço</h1>
              <p className="text-gray-500 font-medium">Protocolo: <span className="font-bold text-gray-900">#{service.id}</span></p>
            </div>
            <div className={`inline-flex items-center px-6 py-2.5 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest ${getStatusColor(service.status)}`}>
              {getStatusText(service.status)}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                {userRole === 'client' ? 'Prestador' : 'Cliente'}
              </p>
              <p className="font-black text-gray-900">{userRole === 'client' ? service.providerName : service.clientName}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Especialidade</p>
              <p className="font-black text-gray-900">{service.serviceType}</p>
            </div>
            <div className="md:col-span-2 p-4 bg-gray-50 rounded-xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Endereço</p>
              <p className="font-black text-gray-900 truncate">{service.address}</p>
            </div>
            <div className="md:col-span-4 p-5 bg-white border-2 border-gray-100 rounded-xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Descrição da Solicitação</p>
              <p className="text-gray-700 font-medium leading-relaxed">{service.description}</p>
              
              {service.photos && service.photos.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Fotos Anexadas</p>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {service.photos.map((photo, index) => (
                      <div key={index} className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200">
                        <img src={photo} alt={`Foto anexa ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Chat */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-100 flex flex-col h-[650px] border border-gray-50 overflow-hidden">
              <div className="p-6 border-b flex items-center justify-between bg-white/50 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 bg-${themeColor}-500 rounded-full animate-pulse`}></div>
                  <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Canal de Atendimento</h2>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
                {service.messages.map((msg) => {
                  const isMe = (userRole === 'client' && msg.sender === 'client') || 
                               (userRole === 'provider' && msg.sender === 'provider');
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-5 py-3 shadow-md ${
                          isMe
                            ? `bg-${themeColor}-600 text-white`
                            : 'bg-white text-gray-900 border border-gray-100'
                        }`}
                      >
                        <p className={`text-[10px] font-black uppercase tracking-widest mb-1 opacity-70`}>
                          {msg.sender === 'provider' ? service.providerName : service.clientName}
                        </p>
                        <p className="font-medium text-sm md:text-base">{msg.message}</p>
                        <p className="text-[9px] mt-2 opacity-60 font-medium">
                          {new Date(msg.timestamp).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {isMe && (userRole === "provider" || userRole === "client") && (
                          <p className={`text-[10px] mt-1 flex items-center gap-1 ${
                            userRole === "provider"
                              ? (msg.readByClient ? "text-green-100" : "text-white/80")
                              : (msg.readByProvider ? "text-green-100" : "text-white/80")
                          }`}>
                            {(userRole === "provider" ? msg.readByClient : msg.readByProvider) ? (
                              <>
                                <CheckCheck className="w-3 h-3" />
                                Lida
                              </>
                            ) : (
                              <>
                                <Check className="w-3 h-3" />
                                Mensagem Recebida
                              </>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Message Input */}
              <div className="p-6 border-t bg-white">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Escreva sua mensagem..."
                    className={`flex-1 px-5 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-${themeColor}-500 outline-none font-medium transition-all`}
                  />
                  <button
                    onClick={handleSendMessage}
                    className={`p-4 bg-${themeColor}-600 text-white rounded-xl hover:bg-${themeColor}-700 transition-all shadow-xl shadow-${themeColor}-100 hover:-translate-y-0.5 active:translate-y-0`}
                  >
                    <Send className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Actions Panel */}
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-100 p-8 border border-gray-50">
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-6">Painel de Controle</h3>

              {/* Current Value Display */}
              {service.proposedValue && !showValueInput && (
                <div className={`mb-6 p-6 bg-${themeColor}-50 rounded-2xl border-2 border-${themeColor}-100 shadow-md shadow-${themeColor}-50/50`}>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Valor do Orçamento</p>
                  <div className="flex items-center justify-between">
                    <p className={`text-3xl font-black text-${themeColor}-600 tracking-tighter`}>{service.proposedValue}</p>
                    {userRole === 'provider' && (
                      <button
                        onClick={() => setShowValueInput(true)}
                        className={`text-xs font-black uppercase tracking-widest text-${themeColor}-600 hover:bg-${themeColor}-100 px-3 py-1.5 rounded-lg transition-colors`}
                      >
                        Alterar
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Value Input Form (Provider Only) */}
              {userRole === 'provider' && (!service.proposedValue || showValueInput) && service.status === 'quote' && (
                <div className="mb-6 space-y-4">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Propor Valor Final
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={proposedValue}
                      onChange={(e) => setProposedValue(e.target.value)}
                      placeholder="Ex: R$ 500,00"
                      className={`w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-${themeColor}-500 outline-none font-black text-lg transition-all`}
                    />
                  </div>
                  <button
                    onClick={handleSubmitValue}
                    className={`w-full py-4 bg-${themeColor}-600 text-white rounded-xl hover:bg-${themeColor}-700 transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-${themeColor}-100`}
                  >
                    Enviar Proposta Oficial
                  </button>
                  {showValueInput && (
                    <button
                      onClick={() => setShowValueInput(false)}
                      className="w-full py-3 text-gray-500 font-bold hover:text-gray-900 text-sm transition-colors"
                    >
                      Manter valor anterior
                    </button>
                  )}
                </div>
              )}

              {/* Client Acceptance Action */}
              {userRole === 'client' && service.status === 'quote' && service.proposedValue && (
                <div className="mb-6 p-6 bg-yellow-50 border-2 border-yellow-100 rounded-2xl">
                  <p className="text-sm text-yellow-800 font-bold mb-4 leading-relaxed">
                    O prestador enviou uma proposta de <span className="text-xl block mt-1">{service.proposedValue}</span>
                  </p>
                  <button
                    onClick={handleAcceptQuote}
                    className="w-full py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-green-100 mb-3"
                  >
                    Aceitar e Confirmar
                  </button>
                </div>
              )}

              {/* Status Specific Buttons */}
              <div className="space-y-3">
                {/* Schedule Visit Button (Provider Only) */}
                {userRole === 'provider' && !service.visitScheduled && service.status !== 'completed' && service.status !== 'active' && (
                  <Link
                    to={`/manage-service/${service.id}/schedule-visit`}
                    className={`w-full py-4 bg-${themeColor}-100 text-${themeColor}-700 rounded-xl hover:bg-${themeColor}-200 transition-all font-black text-xs uppercase tracking-widest shadow-sm flex items-center justify-center gap-2`}
                  >
                    <Calendar className="w-5 h-5" />
                    Agendar Visita com Cliente
                  </Link>
                )}

                {/* Visit Scheduled Info */}
                {service.visitScheduled && (
                  <div className={`p-6 border-2 rounded-2xl ${
                    service.visitScheduled.status === 'confirmed' ? 'bg-green-50 border-green-100' :
                    service.visitScheduled.status === 'cancelled' ? 'bg-red-50 border-red-100' :
                    `bg-${themeColor}-50 border-${themeColor}-100`
                  }`}>
                    <div className={`flex items-center gap-2 mb-2 ${
                      service.visitScheduled.status === 'confirmed' ? 'text-green-600' :
                      service.visitScheduled.status === 'cancelled' ? 'text-red-600' :
                      `text-${themeColor}-600`
                    }`}>
                      <Calendar className="w-5 h-5" />
                      <p className="font-black uppercase text-xs">
                        {service.visitScheduled.status === 'confirmed' ? 'Visita Confirmada' :
                         service.visitScheduled.status === 'cancelled' ? 'Visita Cancelada' :
                         'Aguardando Confirmação'}
                      </p>
                    </div>
                    <p className={`text-sm font-medium mb-3 ${
                      service.visitScheduled.status === 'confirmed' ? 'text-green-800' :
                      service.visitScheduled.status === 'cancelled' ? 'text-red-800' :
                      `text-${themeColor}-800`
                    }`}>
                      {new Date(service.visitScheduled.date).toLocaleDateString('pt-BR')} às {service.visitScheduled.time}
                    </p>
                    {userRole === 'provider' && service.status !== 'completed' && service.visitScheduled.status !== 'cancelled' && (
                      <Link
                        to={`/manage-service/${service.id}/schedule-visit`}
                        className={`text-xs font-black uppercase tracking-widest ${
                          service.visitScheduled.status === 'confirmed' ? 'text-green-600 hover:bg-green-100' :
                          `text-${themeColor}-600 hover:bg-${themeColor}-100`
                        } px-3 py-1.5 rounded-lg transition-colors inline-block`}
                      >
                        Gerenciar Visita
                      </Link>
                    )}
                  </div>
                )}

                {service.status === 'active' && userRole === 'provider' && (
                  <button
                    onClick={handleCompleteService}
                    className="w-full py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-green-100"
                  >
                    Concluir e Finalizar Trabalho
                  </button>
                )}

                {service.status !== 'completed' && service.status !== 'cancelled' && (
                  <button
                    onClick={handleCancelService}
                    className="w-full py-4 border-2 border-red-100 text-red-500 rounded-xl hover:bg-red-50 hover:border-red-200 transition-all font-black text-xs uppercase tracking-widest"
                  >
                    {userRole === 'client' ? 'Cancelar Solicitação' : 'Recusar Serviço'}
                  </button>
                )}

                {service.status === 'completed' && (
                  <div className="p-6 bg-green-50 border-2 border-green-100 rounded-2xl text-center">
                    <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-3" />
                    <h4 className="text-green-900 font-black uppercase text-sm mb-1">Serviço Concluído</h4>
                    <p className="text-xs text-green-700 font-medium">Obrigado por usar nossa plataforma!</p>
                  </div>
                )}

                {service.status === 'cancelled' && (
                  <div className="p-6 bg-red-50 border-2 border-red-100 rounded-2xl text-center">
                    <h4 className="text-red-900 font-black uppercase text-sm mb-1">Serviço Cancelado</h4>
                    <p className="text-xs text-red-700 font-medium">Esta solicitação foi encerrada.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Safety Tips */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                  <h4 className="text-lg font-black uppercase tracking-tight mb-4">Dicas de Segurança</h4>
                  <ul className="space-y-4 text-xs font-medium text-gray-300 leading-relaxed list-disc pl-4">
                    <li>Recomendamos não realizar pagamentos antecipados. O pagamento deve ser feito diretamente ao prestador após a conclusão do serviço.</li>
                    <li>Sempre verifique o perfil e as avaliações do prestador.</li>
                    <li>Em caso de irregularidades, denuncie imediatamente.</li>
                  </ul>
                </div>
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <CheckCircle className="w-24 h-24" />
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

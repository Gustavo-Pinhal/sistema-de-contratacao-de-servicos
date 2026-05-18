"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  CalendarPlus,
  ChevronLeft,
  CircleDollarSign,
  Clock,
  FileText,
  Loader2,
  MessageSquare,
  User,
} from "lucide-react";
import ChatRoom from "@/components/ChatRoom";
import { useUser } from "@/context/UserContext";
import { CreateAgendamentoDialog } from "@/components/CreateAgendamentoDialog";
import { CreateOrcamentoDialog } from "@/components/CreateOrcamentoDialog";
import { ServiceActionDialog } from "@/components/ServiceActionDialog";

type ServiceStatus =
  | "Orçamento"
  | "Ativo"
  | "Finalizado"
  | "Cancelado"
  | string;

interface Agendamento {
  id: string;
  criadoEm: string;
  data: string;
  status: "proposta" | "confirmado" | "recusado" | string;
}

interface Orcamento {
  criadoEm: string;
  valor: number;
  observacoes: string | null;
}

interface ServicoDetalhado {
  id: string;
  prestador: {
    id: string;
    nome: string;
    nomeComercial: string | null;
  };
  cliente?: {
    id: string;
    nome: string;
  };
  endereco: string;
  enderecoCompleto?: {
    id: string;
    endereco: string;
    cep: string;
    municipio: string;
  };
  data: string;
  status: ServiceStatus;
}

interface ServiceResponse {
  servico: ServicoDetalhado;
  agendamentos: Agendamento[];
  orcamentos: Orcamento[];
  total: number;
}

interface FileMetadata {
  id: string;
  mime_type: string;
}

interface ChatMessage {
  id: string;
  enviado_por: string;
  tipo: "texto" | "arquivo";
  texto: string | null;
  enviado_em: string;
  arquivo: FileMetadata | null;
}

interface ChatResponse {
  idServico: string;
  mercureToken: string;
  topico: string;
  participantes: {
    cliente: { id: string; nome: string };
    prestador: { id: string; nome: string };
  };
  messagens: ChatMessage[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function ProviderServicePage() {
  const params = useParams();
  const serviceId = params.id as string;
  const { user, loading: userLoading } = useUser();

  const [serviceData, setServiceData] = useState<ServiceResponse | null>(null);
  const [chatData, setChatData] = useState<ChatResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateAgendamentoDialogOpen, setIsCreateAgendamentoDialogOpen] =
    useState(false);
  const [isCreateOrcamentoDialogOpen, setIsCreateOrcamentoDialogOpen] =
    useState(false);
  const [serviceActionDialogState, setServiceActionDialogState] = useState<{
    isOpen: boolean;
    action: "finalize" | "cancel";
  }>({
    isOpen: false,
    action: "finalize",
  });

  const loadData = async (token: string) => {
    try {
      const [serviceRes, chatRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/servico/${serviceId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/servico/${serviceId}/chat`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (serviceRes.status === 403 || chatRes.status === 403) {
        setError("Você não tem permissão para acessar este serviço.");
        return;
      }

      if (serviceRes.status === 404) {
        setError("Serviço não encontrado.");
        return;
      }

      if (!serviceRes.ok) {
        throw new Error("Erro ao carregar dados do serviço.");
      }

      if (!chatRes.ok) {
        throw new Error("Erro ao carregar dados do chat.");
      }

      const [serviceJson, chatJson] = (await Promise.all([
        serviceRes.json(),
        chatRes.json(),
      ])) as [ServiceResponse, ChatResponse];

      setServiceData(serviceJson);
      setChatData(chatJson);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Falha na conexão.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userLoading) return;

    const token = user?.token;
    if (!token || !serviceId) {
      setError("Você precisa estar autenticado para acessar este serviço.");
      setLoading(false);
      return;
    }

    loadData(token);
  }, [serviceId, user?.token, userLoading]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  const getServiceStatusClass = (status: ServiceStatus) => {
    switch (status) {
      case "Ativo":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Finalizado":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Cancelado":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "Orçamento":
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  const getAgendamentoStatusClass = (status: Agendamento["status"]) => {
    switch (status) {
      case "confirmado":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "recusado":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "proposta":
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  const handleCriarAgendamento = () => {
    setIsCreateAgendamentoDialogOpen(true);
  };

  const handleSuccessAgendamento = () => {
    const token = user?.token;
    if (token) {
      setLoading(true);
      loadData(token);
    }
  };

  const handleCriarOrcamento = () => {
    setIsCreateOrcamentoDialogOpen(true);
  };

  const handleSuccessOrcamento = () => {
    const token = user?.token;
    if (token) {
      setLoading(true);
      loadData(token);
    }
  };

  const handleFinalizarServico = () => {
    setServiceActionDialogState({ isOpen: true, action: "finalize" });
  };

  const handleCancelarServico = () => {
    setServiceActionDialogState({ isOpen: true, action: "cancel" });
  };

  const handleSuccessServiceAction = () => {
    const token = user?.token;
    if (token) {
      setLoading(true);
      loadData(token);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
          Carregando Serviço...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
        <p className="text-sm font-black text-red-500 uppercase tracking-widest mb-4">
          {error}
        </p>
        <Link
          href="/affiliate/dashboard"
          className="text-xs font-bold text-slate-600 underline uppercase tracking-wider"
        >
          Voltar para o dashboard
        </Link>
      </div>
    );
  }

  const servico = serviceData?.servico;
  const agendamentos = serviceData?.agendamentos ?? [];
  const orcamentos = serviceData?.orcamentos ?? [];
  const chatHeaderAddress = servico?.enderecoCompleto
    ? `${servico.enderecoCompleto.endereco} • CEP ${servico.enderecoCompleto.cep} • ${servico.enderecoCompleto.municipio}`
    : servico?.endereco || "-";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/affiliate/dashboard"
            className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900 transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="text-xs uppercase tracking-widest">Voltar</span>
          </Link>
          <div className="text-center">
            <span className="block text-[10px] font-black uppercase text-slate-400 tracking-tighter">
              Serviço do Prestador
            </span>
            <span className="block text-xs font-mono font-bold text-slate-600">
              #{serviceId?.slice(0, 8)}
            </span>
          </div>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.9fr] gap-8 items-start">
          <section className="space-y-6">
            <div className="rounded-3xl border border-slate-200 overflow-hidden bg-white shadow-sm">
              <div className="border-b border-slate-200 bg-slate-100 text-slate-900 px-6 py-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">
                      <MessageSquare size={14} />
                      Chat do Serviço
                    </div>
                    <h1 className="text-2xl font-black tracking-tight">
                      {chatHeaderAddress}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
                      <span className="inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 px-3 py-1 font-mono text-xs">
                        <span className="font-black uppercase tracking-widest text-slate-500">
                          ID
                        </span>
                        {servico?.id}
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 px-3 py-1 font-semibold">
                        <User size={14} />
                        {servico?.cliente?.nome || "Cliente"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-start lg:items-end gap-3">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-black uppercase tracking-widest ${getServiceStatusClass(servico?.status || "")}`}
                    >
                      {servico?.status || "-"}
                    </span>
                    <div className="text-left lg:text-right text-slate-700">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Prestador
                      </p>
                      <p className="text-base font-semibold text-slate-900">
                        {servico?.prestador.nomeComercial ||
                          servico?.prestador.nome ||
                          "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50">
                {chatData ? (
                  <ChatRoom
                    serviceId={serviceId}
                    initialMessages={chatData.messagens}
                    topic={chatData.topico}
                    mercureToken={chatData.mercureToken}
                  />
                ) : (
                  <div className="min-h-160 flex items-center justify-center text-slate-500">
                    Carregando chat...
                  </div>
                )}
              </div>
            </div>
          </section>

          <aside className="space-y-6 xl:sticky xl:top-24">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
                Ações do Prestador
              </h2>
              <div className="grid grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={handleCriarAgendamento}
                  className="flex items-center justify-center gap-3 bg-blue-600 text-white p-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
                >
                  <CalendarPlus size={18} /> Criar Agendamento
                </button>
                <button
                  type="button"
                  onClick={handleCriarOrcamento}
                  className="flex items-center justify-center gap-3 bg-white text-slate-900 border-2 border-slate-200 p-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all"
                >
                  <CircleDollarSign size={18} /> Criar Orçamento
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center">
                  <Clock className="text-blue-600" size={20} />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">
                    Agendamentos
                  </h2>
                  <p className="text-sm text-slate-400">
                    Histórico e status dos agendamentos.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {agendamentos.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                    Nenhum agendamento cadastrado para este serviço.
                  </div>
                )}

                {agendamentos.map((agendamento) => (
                  <div
                    key={agendamento.id}
                    className="rounded-2xl border border-slate-200 p-5 bg-slate-50"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${getAgendamentoStatusClass(agendamento.status)}`}
                        >
                          {agendamento.status}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          {agendamento.id}
                        </span>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Criado em
                        </p>
                        <p className="font-black text-slate-900">
                          {agendamento.criadoEm}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Data marcada
                        </p>
                        <p className="font-black text-slate-900">
                          {agendamento.data}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center">
                  <FileText className="text-amber-600" size={20} />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">
                    Orçamentos
                  </h2>
                  <p className="text-sm text-slate-400">
                    Histórico dos valores enviados para este serviço.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {orcamentos.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                    Nenhum orçamento cadastrado para este serviço.
                  </div>
                )}

                {orcamentos.map((orcamento, index) => (
                  <div
                    key={`${orcamento.criadoEm}-${index}`}
                    className="rounded-2xl border border-slate-200 p-5 bg-slate-50"
                  >
                    <div className="flex flex-col gap-4">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Criado em
                        </p>
                        <p className="font-black text-slate-900">
                          {orcamento.criadoEm}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Observações
                        </p>
                        <p className="font-semibold text-slate-900">
                          {orcamento.observacoes || "Sem observações"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Valor
                        </p>
                        <p className="text-2xl font-black text-slate-900">
                          {formatCurrency(orcamento.valor)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-100 p-5 text-slate-900">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Total geral
                </p>
                <p className="mt-2 text-3xl font-black">
                  {formatCurrency(serviceData?.total || 0)}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">
                  Ações do serviço
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={handleFinalizarServico}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-emerald-700"
                  >
                    Concluir Serviço
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelarServico}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-white px-4 py-3 text-xs font-black uppercase tracking-widest text-rose-700 transition-colors hover:bg-rose-50"
                  >
                    Cancelar Serviço
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <CreateAgendamentoDialog
        isOpen={isCreateAgendamentoDialogOpen}
        onClose={() => setIsCreateAgendamentoDialogOpen(false)}
        serviceId={serviceId}
        onSuccess={handleSuccessAgendamento}
        token={user?.token || ""}
      />

      <CreateOrcamentoDialog
        isOpen={isCreateOrcamentoDialogOpen}
        onClose={() => setIsCreateOrcamentoDialogOpen(false)}
        serviceId={serviceId}
        onSuccess={handleSuccessOrcamento}
        token={user?.token || ""}
      />

      <ServiceActionDialog
        isOpen={serviceActionDialogState.isOpen}
        onClose={() =>
          setServiceActionDialogState((prev) => ({ ...prev, isOpen: false }))
        }
        serviceId={serviceId}
        token={user?.token || ""}
        action={serviceActionDialogState.action}
        onSuccess={handleSuccessServiceAction}
      />
    </div>
  );
}

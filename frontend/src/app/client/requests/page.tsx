"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  MessageCircle,
  ChevronRight,
  Clock,
  User,
  Loader2,
  Inbox,
} from "lucide-react";
import { useUser } from "@/context/UserContext";

interface BudgetRequest {
  id: string;
  prestador: {
    id: string;
    nome: string;
  };
}

export default function ClientRequestsPage() {
  const { user } = useUser();
  const [requests, setRequests] = useState<BudgetRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchRequests() {
      try {
        setLoading(true);
        const response = await fetch(
          "https://localhost/api/cliente/orcamentos",
          {
            headers: {
              Authorization: `Bearer ${user?.token}`,
            },
          },
        );

        if (!response.ok) throw new Error("Falha ao buscar orçamentos");

        const data = await response.json();
        setRequests(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    if (user?.token) fetchRequests();
  }, [user?.token]);

  const filteredRequests = requests.filter(
    (req) =>
      req.prestador.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.id.includes(searchTerm),
  );

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">
          Sincronizando orçamentos...
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50/50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic mb-2">
            Minhas Solicitações
          </h1>
          <p className="text-slate-500 font-medium">
            Acompanhe seus orçamentos e conversas com profissionais.
          </p>
        </div>

        {/* Barra de Busca */}
        <div className="relative mb-8">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Buscar por prestador ou ID do pedido..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-slate-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Lista de Cards */}
        <div className="grid gap-4">
          {filteredRequests.map((req) => (
            <Link
              key={req.id}
              href={`/service/${req.id}`} // Rota da tela de chat/acompanhamento do cliente
              className="group bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-500 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                  <User
                    className="text-blue-600 group-hover:text-white transition-colors"
                    size={24}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      ID: {req.id.slice(0, 8)}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <Clock size={10} /> Aguardando Resposta
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                    {req.prestador.nome}
                  </h3>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-4 md:pt-0">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Status do Chat
                  </span>
                  <div className="flex items-center gap-2 text-green-600 font-bold text-sm">
                    <MessageCircle size={16} />
                    Conversa Ativa
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
                  <ChevronRight size={24} />
                </div>
              </div>
            </Link>
          ))}

          {filteredRequests.length === 0 && (
            <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-16 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Inbox className="text-slate-300" size={40} />
              </div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">
                Nenhum orçamento encontrado
              </h3>
              <p className="text-slate-500 mb-6">
                Você ainda não realizou pedidos ou sua busca não retornou
                resultados.
              </p>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
              >
                Buscar Profissionais
              </Link>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <p className="text-center mt-12 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
          Total de {requests.length} solicitações realizadas
        </p>
      </div>
    </div>
  );
}

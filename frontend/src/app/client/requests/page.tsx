"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  ChevronLeft,
  Clock,
  MapPin,
  Calendar,
  Eye,
  FileText,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useUser } from "@/context/UserContext";

interface Servico {
  id: string;
  prestador: { id: string; nome: string };
  endereco: string | null;
  data: string;
  status: string;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    "Em Orçamento": "bg-blue-100 text-blue-700",
    "Em Andamento": "bg-yellow-100 text-yellow-700",
    "Concluído":    "bg-green-100 text-green-700",
    "Cancelado":    "bg-red-100 text-red-700",
  };
  const cls = map[status] ?? "bg-slate-100 text-slate-500";
  return (
    <span className={`text-xs px-2 py-1 rounded-full font-bold ${cls}`}>
      {status}
    </span>
  );
}

export default function ClientRequestsPage() {
  const { user } = useUser();
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!user?.token) return;
    fetch("/api/cliente/servicos", {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((r) => r.json())
      .then((data) => setServicos(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.token]);

  const filtered = servicos.filter(
    (s) =>
      s.prestador.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.includes(searchTerm),
  );

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">
          Carregando orçamentos...
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">

        {/* Voltar */}
        <Link
          href="/search"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-bold"
        >
          <ChevronLeft size={16} />
          Voltar para busca
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tight">
            Meus Orçamentos
          </h1>
          <p className="text-gray-600 font-medium">
            Visualize e gerencie os orçamentos solicitados aos prestadores.
          </p>
        </div>

        {/* Busca */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por prestador ou ID..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-600 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Cards */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">
              Nenhum orçamento encontrado
            </h3>
            <p className="text-gray-500 font-medium mb-8 max-w-sm mx-auto">
              {searchTerm
                ? "Nenhum resultado para sua busca."
                : "Você ainda não solicitou nenhum serviço."}
            </p>
            <Link
              href="/search"
              className="inline-block px-8 py-4 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
            >
              Buscar Prestadores
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all overflow-hidden border border-gray-100 group flex flex-col"
              >
                {/* Card Header */}
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0 pr-2">
                      <h3 className="font-black text-gray-900 uppercase tracking-tight text-lg leading-tight truncate">
                        {s.prestador.nome}
                      </h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
                        #{s.id.slice(0, 8)}
                      </p>
                    </div>
                    <StatusBadge status={s.status} />
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-3 flex-1">
                  {s.endereco && (
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                      <MapPin size={14} className="text-blue-500 shrink-0" />
                      <span className="line-clamp-1">{s.endereco}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                    <Calendar size={14} className="text-blue-500 shrink-0" />
                    <span>Solicitado em {s.data}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                    <Clock size={14} className="text-blue-500 shrink-0" />
                    <span>
                      {s.status === "Em Orçamento"
                        ? "Aguardando resposta do prestador"
                        : s.status === "Em Andamento"
                        ? "Serviço em execução"
                        : s.status === "Concluído"
                        ? "Serviço finalizado"
                        : "Serviço encerrado"}
                    </span>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-6 pt-0">
                  <Link
                    href={`/service/${s.id}`}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-slate-900 text-white rounded-xl hover:bg-blue-600 transition-all font-black text-xs uppercase tracking-widest shadow-sm"
                  >
                    <Eye size={14} />
                    Ver Chat e Detalhes
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dicas */}
        <div className="mt-10 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-blue-900 mb-3">Dicas para avaliar orçamentos</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle size={16} className="mt-0.5 shrink-0" />
              <span>Compare os itens inclusos em cada orçamento</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={16} className="mt-0.5 shrink-0" />
              <span>Verifique a reputação e avaliações do prestador</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={16} className="mt-0.5 shrink-0" />
              <span>Entre em contato com o prestador para esclarecer dúvidas</span>
            </li>
          </ul>
        </div>

        <p className="text-center mt-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
          Total de {servicos.length} solicitações
        </p>
      </div>
    </div>
  );
}

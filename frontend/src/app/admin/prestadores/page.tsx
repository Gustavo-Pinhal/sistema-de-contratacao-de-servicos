"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Award,
  ShieldAlert,
  RotateCcw,
  X,
  AlertCircle,
  Lock,
  CheckCircle,
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import { apiRequest } from "@/lib/api";
import AdminSidebar from "@/components/admin/AdminSidebar";

interface Prestador {
  id: string;
  nome: string;
  premium: boolean;
}

export default function AdminPrestadoresPage() {
  const { user } = useUser();
  const isAdmin = user?.role === "admin" || user?.role === "ROLE_ADMIN";

  const [prestadores, setPrestadores] = useState<Prestador[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchPrestadores = async () => {
    setLoading(true);
    try {
      // Endpoint: GET /admin/prestador
      const data = await apiRequest("/admin/prestador", "GET", user?.token);
      setPrestadores(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar a lista de prestadores.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.token || !isAdmin) {
      setLoading(false);
      return;
    }
    fetchPrestadores();
  }, [user?.token, isAdmin]);

  const handleTogglePremium = async (prestador: Prestador) => {
    if (!isAdmin) {
      setError("Acesso restrito a administradores.");
      return;
    }

    const acao = prestador.premium ? "demover" : "promover";
    const msgConfirmacao = prestador.premium
      ? `Deseja remover o status Premium de ${prestador.nome}? O usuário perderá os privilégios elevados.`
      : `Deseja promover ${prestador.nome} para Premium? Isso injetará credenciais elevadas e criará seu portfólio caso não exista.`;

    if (!confirm(msgConfirmacao)) return;

    setActionLoadingId(prestador.id);
    try {
      // Endpoints: POST /admin/prestador/{id}/promover OU /admin/prestador/{id}/demover
      await apiRequest(
        `/admin/prestador/${prestador.id}/${acao}`,
        "POST",
        user?.token,
      );

      // Atualiza o estado local para poupar uma nova requisição completa à API
      setPrestadores((prev) =>
        prev.map((p) =>
          p.id === prestador.id ? { ...p, premium: !prestador.premium } : p,
        ),
      );
      setError(null);
    } catch (err: any) {
      setError(err.message || `Erro ao ${acao} o prestador.`);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtro de pesquisa em tempo real por nome
  const filteredPrestadores = prestadores.filter((p) =>
    p.nome.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Estado de Fallback: Sem Autenticação ou Acesso Negado
  if (!user?.token || !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-sm w-full text-center shadow-xl shadow-slate-200/50 space-y-4">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
            <Lock size={22} />
          </div>
          <div className="space-y-1">
            <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight">
              Acesso Bloqueado
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              {!user?.token
                ? "Sua sessão expirou ou você não realizou a autenticação prévia."
                : "Seu nível de conta não possui privilégios de moderação global."}
            </p>
          </div>
          <Link
            href="/admin/login"
            className="block w-full text-xs font-black text-white bg-blue-600 hover:bg-blue-700 transition-colors py-3 rounded-xl uppercase tracking-widest"
          >
            Ir para Autenticação
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800">
      {/* Barra Lateral Reaproveitada */}
      <AdminSidebar />

      {/* Conteúdo Central */}
      <main className="flex-1 flex flex-col overflow-x-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Controle de Usuários
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-black text-slate-900 uppercase leading-none">
                Administrador
              </p>
              <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mt-0.5">
                Moderação de Contas
              </p>
            </div>
            <div className="w-8 h-8 bg-slate-100 rounded-lg overflow-hidden border">
              <img
                src="https://ui-avatars.com/api/?name=Admin&background=2563EB&color=fff"
                alt="Avatar"
              />
            </div>
          </div>
        </header>

        {/* Corpo Interno */}
        <div className="p-8 max-w-5xl w-full mx-auto space-y-6">
          {/* Alinhamento de Título e Filtro de Pesquisa */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">
                Gestão de Prestadores
              </h1>
              <p className="text-slate-400 text-xs font-bold">
                Promova ou remova acessos premium e gerencie privilégios na
                plataforma.
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Buscar prestador por nome..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-bold text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Banner de Mensagens de Erro */}
          {error && (
            <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-2xl border border-red-100 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="flex-1">{error}</p>
              <button
                onClick={() => setError(null)}
                className="p-1 hover:bg-red-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Tabela de Listagem de Dados */}
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-16 text-center text-slate-400 space-y-2">
                <RotateCcw className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                <p className="text-[10px] font-black uppercase tracking-widest">
                  Consultando base de prestadores...
                </p>
              </div>
            ) : filteredPrestadores.length === 0 ? (
              <div className="p-16 text-center text-slate-400 space-y-2">
                <p className="text-xs font-bold">
                  Nenhum prestador encontrado para os critérios informados.
                </p>
                <p className="text-[9px] font-bold uppercase tracking-wider">
                  Verifique os termos digitados na busca.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-200">
                      <th className="px-6 py-4 font-black text-slate-400 text-[10px] uppercase tracking-widest">
                        Nome do Profissional / ID único
                      </th>
                      <th className="px-6 py-4 font-black text-slate-400 text-[10px] uppercase tracking-widest">
                        Plano Atual
                      </th>
                      <th className="px-6 py-4 font-black text-slate-400 text-[10px] uppercase tracking-widest text-right">
                        Alterar Nível de Conta
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPrestadores.map((p) => (
                      <tr
                        key={p.id}
                        className="hover:bg-slate-50/40 transition-colors"
                      >
                        <td className="px-6 py-4 space-y-1">
                          <p className="text-xs font-black text-slate-800 uppercase tracking-tight">
                            {p.nome}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono select-all">
                            {p.id}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          {p.premium ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100 shadow-sm shadow-blue-50">
                              <Award size={12} />
                              Premium
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                              Básico
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleTogglePremium(p)}
                            disabled={actionLoadingId === p.id}
                            className={`inline-flex items-center gap-2 px-4 py-2 border rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-50 ${
                              p.premium
                                ? "text-red-600 bg-white border-slate-200 hover:bg-red-50 hover:border-red-100"
                                : "text-white bg-blue-600 border-transparent hover:bg-blue-700 shadow-sm"
                            }`}
                          >
                            {actionLoadingId === p.id ? (
                              <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                            ) : p.premium ? (
                              <ShieldAlert className="w-3.5 h-3.5" />
                            ) : (
                              <CheckCircle className="w-3.5 h-3.5" />
                            )}
                            <span>
                              {p.premium ? "Demover" : "Tornar Premium"}
                            </span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

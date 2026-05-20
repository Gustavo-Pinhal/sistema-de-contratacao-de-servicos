"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Users,
  UserCheck,
  UserX,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import { apiRequest } from "@/lib/api";

interface UsuarioAdmin {
  id: string;
  nome: string;
  email: string;
  perfil: "Cliente" | "Prestador" | "Administrador";
}

export default function AdminUsuariosPage() {
  const { user } = useUser();
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<"Todos" | "Cliente" | "Prestador" | "Administrador">("Todos");
  const [toast, setToast] = useState<{ message: string; type: "success" | "warning" } | null>(null);

  useEffect(() => {
    const fetchUsuarios = async () => {
      if (!user?.token) return;
      setLoading(true);
      try {
        const data = await apiRequest("/admin/usuarios", "GET", user.token);
        setUsuarios(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Erro ao carregar usuários");
      } finally {
        setLoading(false);
      }
    };
    fetchUsuarios();
  }, [user?.token]);

  const showToast = (message: string, type: "success" | "warning" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    const matchesSearch =
      u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === "Todos" ? true : u.perfil === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 relative">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border animate-in slide-in-from-bottom-5 duration-300 ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-amber-50 border-amber-200 text-amber-800"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          )}
          <span className="text-sm font-bold tracking-tight">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Gerenciamento de Usuários</h1>
        <p className="text-slate-500 text-sm mt-1">
          Busque, filtre e altere o status das contas de Clientes, Prestadores e Administradores cadastrados.
        </p>
      </div>

      {/* Filtros e Barra de Pesquisa */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Barra de Pesquisa */}
          <div className="relative w-full md:max-w-md group">
            <input
              type="text"
              placeholder="Buscar por nome, e-mail ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-5 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 font-semibold"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
          </div>

          {/* Filtros Rápidos (Desktop) */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {(["Todos", "Cliente", "Prestador", "Administrador"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                  activeFilter === filter
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/50"
                }`}
              >
                {filter === "Todos" ? "Todos os Perfis" : `${filter}s`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabela de Resultados */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center">
            <RotateCcw className="w-8 h-8 text-slate-300 mb-4 animate-spin" />
            <p className="text-sm font-semibold">Carregando usuários...</p>
          </div>
        ) : error ? (
          <div className="p-16 text-center text-red-400 flex flex-col items-center justify-center">
            <p className="text-sm font-semibold">{error}</p>
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center">
            <Users className="w-12 h-12 text-slate-300 mb-4 stroke-[1.5]" />
            <h3 className="font-bold text-slate-700 mb-1">Nenhum usuário encontrado</h3>
            <p className="text-sm text-slate-400 max-w-xs">
              Tente redefinir sua busca ou alterar as opções de filtragem de perfil.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Usuário</th>
                  <th className="px-6 py-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Perfil</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usuariosFiltrados.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl font-black text-xs uppercase flex items-center justify-center shadow-sm ${
                            u.perfil === "Administrador"
                              ? "bg-indigo-50 text-indigo-600"
                              : u.perfil === "Prestador"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-blue-50 text-blue-600"
                          }`}
                        >
                          {u.nome[0]}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-sm text-slate-800 truncate leading-none mb-1">{u.nome}</div>
                          <div className="text-xs text-slate-400 font-semibold truncate leading-none">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${
                          u.perfil === "Administrador"
                            ? "bg-indigo-50 text-indigo-700"
                            : u.perfil === "Prestador"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {u.perfil}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

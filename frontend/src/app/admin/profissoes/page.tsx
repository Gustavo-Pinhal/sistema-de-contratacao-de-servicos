"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Plus,
  Pencil,
  Trash2,
  RotateCcw,
  Check,
  X,
  AlertCircle,
  Lock,
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import { apiRequest } from "@/lib/api";
import AdminSidebar from "@/components/admin/AdminSidebar";

interface Profissao {
  id: number;
  descricao: string;
  excluidoEm: string | null;
}

export default function AdminProfissoesPage() {
  const { user } = useUser();
  const isAdmin = user?.role === "admin" || user?.role === "ROLE_ADMIN";

  const [profissoes, setProfissoes] = useState<Profissao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showExcluidos, setShowExcluidos] = useState(false);

  // Estados de formulário
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [formData, setFormData] = useState({ descricao: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProfissoes = async () => {
    setLoading(true);
    try {
      const data = await apiRequest(
        `/admin/cadastro/profissoes?excluidos=${showExcluidos}`,
        "GET",
        user?.token,
      );
      setProfissoes(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar profissões");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.token || !isAdmin) {
      setLoading(false);
      return;
    }
    fetchProfissoes();
  }, [user?.token, showExcluidos, isAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      setError("Acesso restrito a administradores.");
      return;
    }
    if (!formData.descricao.trim()) return;

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await apiRequest(
          `/admin/cadastro/profissoes/${isEditing}`,
          "PUT",
          user?.token,
          formData,
        );
      } else {
        await apiRequest(
          "/admin/cadastro/profissoes",
          "POST",
          user?.token,
          formData,
        );
      }
      setFormData({ descricao: "" });
      setIsEditing(null);
      fetchProfissoes();
    } catch (err: any) {
      setError(err.message || "Erro ao salvar profissão");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (profissao: Profissao) => {
    setIsEditing(profissao.id);
    setFormData({ descricao: profissao.descricao });
  };

  const handleDelete = async (id: number) => {
    if (!isAdmin) {
      setError("Acesso restrito a administradores.");
      return;
    }
    if (!confirm("Tem certeza que deseja desativar esta profissão?")) return;
    try {
      await apiRequest(
        `/admin/cadastro/profissoes/${id}`,
        "DELETE",
        user?.token,
      );
      fetchProfissoes();
    } catch (err: any) {
      setError(err.message || "Erro ao excluir profissão");
    }
  };

  const handleRestore = async (id: number) => {
    if (!isAdmin) {
      setError("Acesso restrito a administradores.");
      return;
    }
    try {
      await apiRequest(
        `/admin/cadastro/profissoes/${id}/restaurar`,
        "POST",
        user?.token,
      );
      fetchProfissoes();
    } catch (err: any) {
      setError(err.message || "Erro ao restaurar profissão");
    }
  };

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
              Acesso Blocado
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
            <Briefcase size={16} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Configurações Avançadas
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-black text-slate-900 uppercase leading-none">
                Administrador
              </p>
              <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mt-0.5">
                Módulo de Ativos
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
          {/* Alinhamento de Título e Filtro Alternador */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">
                Gerenciar Profissões
              </h1>
              <p className="text-slate-400 text-xs font-bold">
                Mapeamento de categorias e escopos profissionais do sistema.
              </p>
            </div>
            <div className="shrink-0">
              <label className="inline-flex items-center gap-3 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/70 transition-all text-xs font-black text-slate-600 uppercase tracking-widest">
                <input
                  type="checkbox"
                  checked={showExcluidos}
                  onChange={(e) => setShowExcluidos(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 bg-white"
                />
                <span>Exibir Arquivados</span>
              </label>
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

          {/* Bloco de Ação: Inserção e Atualização */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
              {isEditing
                ? "Modificar Categoria Selecionada"
                : "Registrar Nova Categoria"}
            </h2>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={formData.descricao}
                  onChange={(e) =>
                    setFormData({ ...formData, descricao: e.target.value })
                  }
                  placeholder="Ex: Encanador Hidráulico, Eletricista de Alta Tensão..."
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-xs font-bold text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:shadow-md focus:shadow-blue-600/5 transition-all"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest text-white flex items-center justify-center gap-2 transition-all shrink-0 active:scale-[0.99] disabled:opacity-50 ${
                    isEditing
                      ? "bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/10"
                      : "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/10"
                  }`}
                >
                  {isSubmitting ? (
                    <RotateCcw className="w-4 h-4 animate-spin" />
                  ) : isEditing ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  <span>{isEditing ? "Salvar" : "Adicionar"}</span>
                </button>

                {isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(null);
                      setFormData({ descricao: "" });
                    }}
                    className="px-4 py-3.5 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-2xl transition-colors text-xs font-black uppercase tracking-widest"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Tabela de Listagem de Dados */}
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-16 text-center text-slate-400 space-y-2">
                <RotateCcw className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                <p className="text-[10px] font-black uppercase tracking-widest">
                  Buscando dados no banco...
                </p>
              </div>
            ) : profissoes.length === 0 ? (
              <div className="p-16 text-center text-slate-400 space-y-2">
                <p className="text-xs font-bold">
                  Nenhum registro encontrado nesta exibição.
                </p>
                <p className="text-[9px] font-bold uppercase tracking-wider">
                  Crie uma nova profissão acima.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-200">
                      <th className="px-6 py-4 font-black text-slate-400 text-[10px] uppercase tracking-widest">
                        Nome da Profissão
                      </th>
                      <th className="px-6 py-4 font-black text-slate-400 text-[10px] uppercase tracking-widest">
                        Estado Operacional
                      </th>
                      <th className="px-6 py-4 font-black text-slate-400 text-[10px] uppercase tracking-widest text-right">
                        Ações de Controle
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {profissoes.map((p) => (
                      <tr
                        key={p.id}
                        className={`hover:bg-slate-50/40 transition-colors ${p.excluidoEm ? "bg-slate-50/20" : ""}`}
                      >
                        <td className="px-6 py-4 text-xs font-black text-slate-800 uppercase tracking-tight">
                          {p.descricao}
                        </td>
                        <td className="px-6 py-4">
                          {p.excluidoEm ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-red-50 text-red-700 border border-red-100">
                              Arquivado
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-green-50 text-green-700 border border-green-100">
                              Ativo público
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                          {p.excluidoEm ? (
                            <button
                              onClick={() => handleRestore(p.id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-xl transition-all"
                              title="Restaurar Profissão"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEdit(p)}
                                className="p-2 text-amber-600 hover:bg-amber-50 border border-transparent hover:border-amber-100 rounded-xl transition-all"
                                title="Editar Nome"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(p.id)}
                                className="p-2 text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-xl transition-all"
                                title="Arquivar Categoria"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
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

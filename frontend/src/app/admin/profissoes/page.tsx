"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, RotateCcw, Check, X, AlertCircle } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { apiRequest } from "@/lib/api";

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

  // State for new/edit
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [formData, setFormData] = useState({ descricao: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProfissoes = async () => {
    setLoading(true);
    try {
      const data = await apiRequest(`/admin/cadastro/profissoes?excluidos=${showExcluidos}`, "GET", user?.token);
      setProfissoes(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar profissões");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.token) {
      setLoading(false);
      return;
    }

    if (!isAdmin) {
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
        await apiRequest(`/admin/cadastro/profissoes/${isEditing}`, "PUT", user?.token, formData);
      } else {
        await apiRequest("/admin/cadastro/profissoes", "POST", user?.token, formData);
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
    if (!confirm("Tem certeza que deseja excluir esta profissão?")) return;
    try {
      await apiRequest(`/admin/cadastro/profissoes/${id}`, "DELETE", user?.token);
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
      await apiRequest(`/admin/cadastro/profissoes/${id}/restaurar`, "POST", user?.token);
      fetchProfissoes();
    } catch (err: any) {
      setError(err.message || "Erro ao restaurar profissão");
    }
  };

  if (!user?.token) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="p-4 bg-amber-50 border-l-4 border-amber-500 text-amber-700 rounded-r-lg">
          Faça login para acessar esta página.
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg">
          Acesso negado. Esta área é exclusiva para administradores.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Gerenciar Profissões</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600 flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showExcluidos}
              onChange={(e) => setShowExcluidos(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Mostrar excluídos
          </label>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Form Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4 text-slate-800">
          {isEditing ? "Editar Profissão" : "Nova Profissão"}
        </h2>
        <form onSubmit={handleSubmit} className="flex gap-4">
          <input
            type="text"
            value={formData.descricao}
            onChange={(e) => setFormData({ descricao: e.target.value })}
            placeholder="Ex: Eletricista, Encanador..."
            className="flex-1 rounded-lg border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            required
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 rounded-lg font-bold text-white flex items-center gap-2 transition-all ${
              isEditing ? "bg-amber-500 hover:bg-amber-600" : "bg-blue-600 hover:bg-blue-700"
            } disabled:opacity-50`}
          >
            {isSubmitting ? (
              <RotateCcw className="w-4 h-4 animate-spin" />
            ) : isEditing ? (
              <Check className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {isEditing ? "Atualizar" : "Adicionar"}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={() => {
                setIsEditing(null);
                setFormData({ descricao: "" });
              }}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          )}
        </form>
      </div>

      {/* List Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <RotateCcw className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Carregando profissões...</p>
          </div>
        ) : profissoes.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p>Nenhuma profissão encontrada.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 font-bold text-slate-700 text-sm uppercase tracking-wider">Descrição</th>
                <th className="px-6 py-4 font-bold text-slate-700 text-sm uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-bold text-slate-700 text-sm uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {profissoes.map((p) => (
                <tr key={p.id} className={`hover:bg-slate-50/50 transition-colors ${p.excluidoEm ? "bg-slate-50/30" : ""}`}>
                  <td className="px-6 py-4 text-slate-700 font-medium">{p.descricao}</td>
                  <td className="px-6 py-4">
                    {p.excluidoEm ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Excluído
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Ativo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {p.excluidoEm ? (
                      <button
                        onClick={() => handleRestore(p.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Restaurar"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(p)}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir"
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
        )}
      </div>
    </div>
  );
}

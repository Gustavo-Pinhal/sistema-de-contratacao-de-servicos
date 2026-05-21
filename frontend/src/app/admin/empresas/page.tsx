"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Plus,
  RotateCcw,
  X,
  AlertCircle,
  Lock,
  Mail,
  Calendar,
  Briefcase,
  KeyRound,
  CheckCircle,
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import { apiRequest } from "@/lib/api";
import AdminSidebar from "@/components/admin/AdminSidebar";

interface Empresa {
  id: string;
  nome: string;
  email: string;
  criadoEm: string;
}

export default function AdminEmpresasPage() {
  const { user } = useUser();
  const isAdmin = user?.role === "admin" || user?.role === "ROLE_ADMIN";

  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Estados do Formulário de Criação
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Buscar empresas cadastradas
  const fetchEmpresas = async () => {
    setLoading(true);
    try {
      // Endpoint: GET /admin/empresas
      const data = await apiRequest("/admin/empresas", "GET", user?.token);
      setEmpresas(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar a lista de empresas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.token || !isAdmin) {
      setLoading(false);
      return;
    }
    fetchEmpresas();
  }, [user?.token, isAdmin]);

  // Submissão do Cadastro de Nova Empresa
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      setError("Acesso restrito a administradores.");
      return;
    }

    // Validações client-side básicas antes do envio
    if (formData.nome.trim().length < 3) {
      setError("O nome da empresa deve ter pelo menos 3 caracteres.");
      return;
    }
    if (formData.senha.length < 6) {
      setError("A senha deve conter no mínimo 6 caracteres.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      // Endpoint: POST /admin/empresas
      await apiRequest("/admin/empresas", "POST", user?.token, formData);

      setSuccessMsg(`Empresa "${formData.nome}" registrada com sucesso!`);
      setFormData({ nome: "", email: "", senha: "" });

      // Recarrega a lista atualizada
      fetchEmpresas();
    } catch (err: any) {
      // Mapeamento amigável de status HTTP documentados
      if (err.status === 409) {
        setError(
          "Conflito: Este endereço de e-mail já está vinculado a outra empresa no sistema.",
        );
      } else if (err.status === 422) {
        setError(
          "Erro de validação: Verifique o formato do e-mail ou se os tamanhos dos campos estão corretos.",
        );
      } else {
        setError(err.message || "Não foi possível registrar a empresa.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Formatação de data ISO para legível local
  const formatarData = (dataIso: string) => {
    try {
      return new Date(dataIso).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dataIso;
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
            <Building2 size={16} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Estruturas Parceiras
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-black text-slate-900 uppercase leading-none">
                Administrador
              </p>
              <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mt-0.5">
                Módulo Corporativo
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
          {/* Alinhamento de Título */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">
              Ecossistema de Empresas
            </h1>
            <p className="text-slate-400 text-xs font-bold">
              Cadastre novas corporações parceiras e controle as contas ativas
              do sistema.
            </p>
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

          {/* Banner de Mensagens de Sucesso */}
          {successMsg && (
            <div className="p-4 bg-green-50 text-green-700 text-xs font-bold rounded-2xl border border-green-100 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 shrink-0" />
              <p className="flex-1">{successMsg}</p>
              <button
                onClick={() => setSuccessMsg(null)}
                className="p-1 hover:bg-green-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Bloco de Ação: Cadastro de Empresa */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
              Inserir Nova Conta Corporativa
            </h2>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-3 gap-3"
            >
              <div className="relative">
                <Briefcase
                  size={16}
                  className="absolute left-4 top-4 text-slate-400"
                />
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                  placeholder="Nome Fantasia / Razão Social"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-xs font-bold text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:shadow-md focus:shadow-blue-600/5 transition-all"
                  required
                />
              </div>

              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-4 top-4 text-slate-400"
                />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="E-mail exclusivo corporativo"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-xs font-bold text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:shadow-md focus:shadow-blue-600/5 transition-all"
                  required
                />
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <KeyRound
                    size={16}
                    className="absolute left-4 top-4 text-slate-400"
                  />
                  <input
                    type="password"
                    value={formData.senha}
                    onChange={(e) =>
                      setFormData({ ...formData, senha: e.target.value })
                    }
                    placeholder="Senha de acesso"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-xs font-bold text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:shadow-md focus:shadow-blue-600/5 transition-all"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/10 font-black text-xs uppercase tracking-widest text-white flex items-center justify-center gap-2 transition-all shrink-0 active:scale-[0.99] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <RotateCcw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  <span>Adicionar</span>
                </button>
              </div>
            </form>
          </div>

          {/* Tabela de Listagem de Empresas */}
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-16 text-center text-slate-400 space-y-2">
                <RotateCcw className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                <p className="text-[10px] font-black uppercase tracking-widest">
                  Processando dados das corporações...
                </p>
              </div>
            ) : empresas.length === 0 ? (
              <div className="p-16 text-center text-slate-400 space-y-2">
                <p className="text-xs font-bold">
                  Nenhuma empresa parceira cadastrada.
                </p>
                <p className="text-[9px] font-bold uppercase tracking-wider">
                  Insira os dados organizacionais acima para iniciar.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-200">
                      <th className="px-6 py-4 font-black text-slate-400 text-[10px] uppercase tracking-widest">
                        Nome Organizacional / ID Interno
                      </th>
                      <th className="px-6 py-4 font-black text-slate-400 text-[10px] uppercase tracking-widest">
                        Contato Digital
                      </th>
                      <th className="px-6 py-4 font-black text-slate-400 text-[10px] uppercase tracking-widest">
                        Data de Ingresso
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {empresas.map((emp) => (
                      <tr
                        key={emp.id}
                        className="hover:bg-slate-50/40 transition-colors"
                      >
                        <td className="px-6 py-4 space-y-1">
                          <p className="text-xs font-black text-slate-800 uppercase tracking-tight">
                            {emp.nome}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono select-all">
                            {emp.id}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                            <Mail size={14} className="text-slate-400" />
                            <span>{emp.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                            <Calendar size={14} className="text-slate-400" />
                            <span>{formatarData(emp.criadoEm)}</span>
                          </div>
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

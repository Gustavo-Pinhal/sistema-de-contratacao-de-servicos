"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  Mail,
  User as UserIcon, // Renomeado aqui para evitar colisão com o construtor nativo
  KeyRound,
  Briefcase,
  MapPin,
  Plus,
  RotateCcw,
  X,
  AlertCircle,
  CheckCircle,
  Award,
  UserX,
  Lock,
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import { apiRequest } from "@/lib/api";
import CompanySidebar from "@/components/enterprise/CompanySidebar";

interface Prestador {
  id: string;
  nome: string;
  premium: boolean;
}

interface Profissao {
  id: number;
  descricao: string;
}

export default function CompanyPrestadoresPage() {
  const { user } = useUser();
  const [prestadores, setPrestadores] = useState<Prestador[]>([]);
  const [profissoes, setProfissoes] = useState<Profissao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Formulário de Criação
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    profissao: "",
    cep: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchPrestadores = async () => {
    try {
      const data = await apiRequest(
        "/empresarial/prestador",
        "GET",
        user?.token,
      );
      setPrestadores(data);
    } catch (err: any) {
      setError(err.message || "Erro ao listar prestadores vinculados.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProfissoes = async () => {
    try {
      const res = await fetch("https://localhost/api/ui/profissoes");
      if (res.ok) setProfissoes(await res.json());
    } catch (err) {
      console.error("Erro ao carregar profissões.");
    }
  };

  useEffect(() => {
    if (!user?.token) return;
    fetchPrestadores();
    fetchProfissoes();
  }, [user?.token]);

  const handleCreatePrestador = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        profissao: Number(formData.profissao),
        cep: formData.cep.replace(/\D/g, ""),
      };

      await apiRequest(
        "/empresarial/prestador/criar",
        "POST",
        user?.token,
        payload,
      );
      setSuccess(`Prestador ${formData.nome} criado e associado com sucesso.`);
      setFormData({ nome: "", email: "", senha: "", profissao: "", cep: "" });
      fetchPrestadores();
    } catch (err: any) {
      if (err.status === 409) {
        setError(
          "Conflito: Este endereço de e-mail já está cadastrado no sistema.",
        );
      } else if (err.status === 400) {
        setError(
          "Erro de validação: Verifique se o CEP é válido ou se a profissão existe.",
        );
      } else {
        setError(err.message || "Erro ao processar requisição.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDesfiliar = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja remover o vínculo com ${nome}?`))
      return;
    setActionId(id);
    setError(null);
    setSuccess(null);

    try {
      await apiRequest(
        "/empresarial/prestador/desfiliar",
        "POST",
        user?.token,
        { prestadorId: id },
      );
      setSuccess(`Vínculo com ${nome} encerrado.`);
      setPrestadores((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      setError(err.message || "Não foi possível desfiliar o prestador.");
    } finally {
      setActionId(null);
    }
  };

  if (!user?.token) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl border text-center shadow-xl max-w-sm space-y-4">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
            <Lock size={22} />
          </div>
          <h1 className="text-md font-black uppercase tracking-tight text-slate-900">
            Acesso Restrito
          </h1>
          <Link
            href="/company/login"
            className="block w-full py-3 bg-purple-600 text-white rounded-xl text-xs font-black uppercase tracking-widest"
          >
            Autenticar Empresa
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800">
      <CompanySidebar />

      <main className="flex-1 flex flex-col overflow-x-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Painel Operacional
            </span>
          </div>
          <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-3 py-1 rounded-full uppercase tracking-widest">
            Ambiente Corporativo
          </span>
        </header>

        <div className="p-8 max-w-5xl w-full mx-auto space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">
              Prestadores Vinculados
            </h1>
            <p className="text-slate-400 text-xs font-bold">
              Monitore sua equipe ativa e cadastre novos profissionais na
              plataforma.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-2xl border border-red-100 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="flex-1">{error}</p>
              <button onClick={() => setError(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 text-green-700 text-xs font-bold rounded-2xl border border-green-100 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 shrink-0" />
              <p className="flex-1">{success}</p>
              <button onClick={() => setSuccess(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Form: Criar e Vincular */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5">
              <UserPlus size={14} className="text-purple-600" /> Cadastrar e
              Alocar Novo Prestador
            </h2>
            <form
              onSubmit={handleCreatePrestador}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
            >
              <div className="relative">
                {/* Alterado de User para UserIcon */}
                <UserIcon
                  size={16}
                  className="absolute left-4 top-4 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Nome Completo"
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border rounded-2xl outline-none text-xs font-bold focus:border-purple-600 focus:bg-white transition-all"
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
                  placeholder="E-mail do Prestador"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border rounded-2xl outline-none text-xs font-bold focus:border-purple-600 focus:bg-white transition-all"
                  required
                />
              </div>
              <div className="relative">
                <KeyRound
                  size={16}
                  className="absolute left-4 top-4 text-slate-400"
                />
                <input
                  type="password"
                  placeholder="Senha Provisória"
                  value={formData.senha}
                  onChange={(e) =>
                    setFormData({ ...formData, senha: e.target.value })
                  }
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border rounded-2xl outline-none text-xs font-bold focus:border-purple-600 focus:bg-white transition-all"
                  required
                />
              </div>
              <div className="relative col-span-1">
                <select
                  value={formData.profissao}
                  onChange={(e) =>
                    setFormData({ ...formData, profissao: e.target.value })
                  }
                  className="w-full px-4 py-3.5 bg-slate-50 border rounded-2xl outline-none text-xs font-bold focus:border-purple-600 focus:bg-white transition-all text-slate-700 h-[46px]"
                  required
                >
                  <option value="">Selecione a Profissão...</option>
                  {profissoes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.descricao}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative flex gap-2 col-span-1 md:col-span-1 lg:col-span-2">
                <div className="relative flex-1">
                  <MapPin
                    size={16}
                    className="absolute left-4 top-4 text-slate-400"
                  />
                  <input
                    type="text"
                    maxLength={8}
                    placeholder="CEP de Atendimento"
                    value={formData.cep}
                    onChange={(e) =>
                      setFormData({ ...formData, cep: e.target.value })
                    }
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border rounded-2xl outline-none text-xs font-bold focus:border-purple-600 focus:bg-white transition-all"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
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

          {/* Listagem */}
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-16 text-center text-slate-400 space-y-2">
                <RotateCcw className="w-8 h-8 animate-spin mx-auto text-purple-600" />
                <p className="text-[10px] font-black uppercase tracking-widest">
                  Carregando prestadores alocados...
                </p>
              </div>
            ) : prestadores.length === 0 ? (
              <div className="p-16 text-center text-slate-400">
                <p className="text-xs font-bold">
                  Sua empresa ainda não possui prestadores vinculados.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-200">
                      <th className="px-6 py-4 font-black text-slate-400 text-[10px] uppercase tracking-widest">
                        Profissional / ID
                      </th>
                      <th className="px-6 py-4 font-black text-slate-400 text-[10px] uppercase tracking-widest">
                        Categoria
                      </th>
                      <th className="px-6 py-4 font-black text-slate-400 text-[10px] uppercase tracking-widest text-right">
                        Ação
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {prestadores.map((p) => (
                      <tr
                        key={p.id}
                        className="hover:bg-slate-50/40 transition-colors"
                      >
                        <td className="px-6 py-4 space-y-0.5">
                          <p className="text-xs font-black text-slate-800 uppercase tracking-tight">
                            {p.nome}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono select-all">
                            {p.id}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          {p.premium ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-50 border border-purple-100 text-[9px] font-black text-purple-700 uppercase">
                              <Award size={10} /> Premium
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-[9px] font-black text-slate-600 uppercase">
                              Regular
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDesfiliar(p.id, p.nome)}
                            disabled={actionId === p.id}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-100 transition-colors"
                            title="Desfiliar da Empresa"
                          >
                            {actionId === p.id ? (
                              <RotateCcw className="w-4 h-4 animate-spin" />
                            ) : (
                              <UserX className="w-4 h-4" />
                            )}
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

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  UserPlus,
  Mail,
  Send,
  RotateCcw,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  Lock,
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import { apiRequest } from "@/lib/api";
import CompanySidebar from "@/components/enterprise/CompanySidebar";

interface ConvitePendente {
  id: string;
  destinatario: {
    id: string;
    nome: string;
    email: string;
  };
  criadoEm: string;
}

export default function CompanyConvitesPage() {
  const { user } = useUser();
  const [pendentes, setPendentes] = useState<ConvitePendente[]>([]);
  const [emailConvite, setEmailConvite] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchPendentes = async () => {
    try {
      const data = await apiRequest(
        "/empresarial/prestador/pendentes",
        "GET",
        user?.token,
      );
      setPendentes(data);
    } catch (err: any) {
      setError(err.message || "Não foi possível resgatar convites em aberto.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.token) return;
    fetchPendentes();
  }, [user?.token]);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailConvite.trim()) return;

    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      await apiRequest("/empresarial/prestador/convidar", "POST", user?.token, {
        email: emailConvite,
      });
      setSuccess(
        `Convite de filiação emitido com sucesso para ${emailConvite}.`,
      );
      setEmailConvite("");
      fetchPendentes();
    } catch (err: any) {
      if (err.status === 404) {
        setError(
          "Não localizado: Nenhum usuário foi encontrado com o e-mail informado.",
        );
      } else if (err.status === 400) {
        setError(
          "Requisição inválida: O usuário foi localizado, mas não possui um perfil ativo de prestador.",
        );
      } else if (err.status === 409) {
        setError(
          "Conflito: Este prestador já possui um vínculo ativo com outra empresa parceira.",
        );
      } else if (err.status === 403) {
        setError(
          "Proibido: Sua conta empresarial encontra-se temporariamente inativa.",
        );
      } else {
        setError(err.message || "Erro desconhecido ao processar convite.");
      }
    } finally {
      setIsSubmitting(false);
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
            <UserPlus size={16} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Gestão de Vínculos
            </span>
          </div>
        </header>

        <div className="p-8 max-w-5xl w-full mx-auto space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">
              Convidar Prestador Existente
            </h1>
            <p className="text-slate-400 text-xs font-bold">
              Envie solicitações de afiliação para profissionais já registrados
              no sistema central.
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

          {/* Form Convite */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
              Emitir Nova Solicitação por E-mail
            </h2>
            <form
              onSubmit={handleSendInvite}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="flex-1 relative">
                <Mail
                  size={16}
                  className="absolute left-4 top-4 text-slate-400"
                />
                <input
                  type="email"
                  placeholder="Insira o e-mail exato cadastrado pelo prestador..."
                  value={emailConvite}
                  onChange={(e) => setEmailConvite(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border rounded-2xl outline-none text-xs font-bold focus:border-purple-600 focus:bg-white focus:shadow-md transition-all"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 font-black text-xs uppercase tracking-widest text-white flex items-center justify-center gap-2 transition-all shrink-0"
              >
                {isSubmitting ? (
                  <RotateCcw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Disparar Convite</span>
              </button>
            </form>
          </div>

          {/* Listagem Pendentes */}
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
              <Clock size={14} className="text-amber-500" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Aguardando Resposta do Profissional
              </h3>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <RotateCcw className="w-6 h-6 animate-spin mx-auto text-purple-600" />
                <p className="text-[9px] font-black uppercase tracking-wider">
                  Buscando convites pendentes...
                </p>
              </div>
            ) : pendentes.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <p className="text-xs font-bold">
                  Nenhum convite pendente de visualização.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/20 border-b border-slate-100">
                      <th className="px-6 py-3 font-black text-slate-400 text-[10px] uppercase tracking-widest">
                        Destinatário
                      </th>
                      <th className="px-6 py-3 font-black text-slate-400 text-[10px] uppercase tracking-widest">
                        E-mail Cadastrado
                      </th>
                      <th className="px-6 py-3 font-black text-slate-400 text-[10px] uppercase tracking-widest">
                        Enviado Em
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendentes.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/30 transition-colors"
                      >
                        <td className="px-6 py-4 text-xs font-black text-slate-800 uppercase tracking-tight">
                          {item.destinatario.nome}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600 font-bold">
                          {item.destinatario.email}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400 font-bold">
                          {new Date(item.criadoEm).toLocaleDateString("pt-BR")}
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

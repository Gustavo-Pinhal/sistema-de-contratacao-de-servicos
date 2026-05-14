"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Briefcase,
  MapPin,
  Camera,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useUser } from "@/context/UserContext";

interface Profissao {
  id: number;
  descricao: string;
}

export default function EditProviderProfile() {
  const router = useRouter();
  const { user } = useUser();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profissoes, setProfissoes] = useState<Profissao[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nome: "",
    nomeProfissional: "",
    email: "",
    cep: "",
    numero: "",
    profissoesIds: [] as number[],
    urlPerfil: "",
  });

  const [addressPreview, setAddressPreview] = useState("");

  // 1. Carregar dados iniciais (Profissões e Perfil)
  useEffect(() => {
    async function init() {
      if (!user?.token) return;
      try {
        const [resProf, resPerfil] = await Promise.all([
          fetch("/api/ui/profissoes"),
          fetch("https://localhost/api/prestador/perfil/editar", {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
        ]);

        const profs = await resProf.json();
        const perfil = await resPerfil.json();

        setProfissoes(profs);
        setFormData({
          nome: perfil.nome || "",
          nomeProfissional: perfil.nomeProfissional || "",
          email: perfil.email || "",
          cep: perfil.cep || "",
          numero: perfil.numero || "",
          profissoesIds: perfil.profissoes || [],
          urlPerfil: perfil.urlPerfil || "",
        });

        if (perfil.cep) fetchAddress(perfil.cep);
      } catch (err) {
        setError("Falha ao carregar dados do perfil.");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [user?.token]);

  // 2. Busca de CEP
  const fetchAddress = async (cep: string) => {
    if (cep.length !== 8 || !user?.token) return;
    try {
      const res = await fetch(`https://localhost/api/ui/endereco?cep=${cep}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setAddressPreview(
          `${data.rua}, ${data.bairro} - ${data.municipio.nome}/${data.municipio.uf}`,
        );
      } else {
        setAddressPreview("CEP não encontrado");
      }
    } catch (err) {
      setAddressPreview("");
    }
  };

  // 3. Upload de Foto
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.token) return;

    const body = new FormData();
    body.append("perfil", file);

    try {
      setSaving(true);
      const res = await fetch("https://localhost/api/prestador/perfil/foto", {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}` },
        body,
      });
      const data = await res.json();
      if (res.ok) setFormData((prev) => ({ ...prev, urlPerfil: data.url }));
    } catch (err) {
      alert("Erro ao enviar imagem.");
    } finally {
      setSaving(false);
    }
  };

  // 4. Salvar Dados Textuais
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.token) return;
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("https://localhost/api/prestador/perfil/editar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: formData.nome,
          nomeProfissional: formData.nomeProfissional,
          cep: formData.cep,
          profissoes: formData.profissoesIds,
        }),
      });

      if (res.ok) {
        router.push("/dashboard");
      } else {
        const errData = await res.json();
        setError(errData.detail || "Erro ao validar dados.");
      }
    } catch (err) {
      setError("Erro de conexão com o servidor.");
    } finally {
      setSaving(false);
    }
  };

  const toggleProfissao = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      profissoesIds: prev.profissoesIds.includes(id)
        ? prev.profissoesIds.filter((pid) => pid !== id)
        : [...prev.profissoesIds, id],
    }));
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 font-bold text-xs uppercase tracking-widest"
        >
          <ArrowLeft size={16} /> Voltar ao Painel
        </Link>

        <header className="mb-10">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic">
            EDITAR PERFIL
          </h1>
          <p className="text-slate-500 font-medium">
            Gerencie sua identidade visual e profissional na plataforma.
          </p>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold">
            <AlertCircle size={20} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Foto de Perfil */}
          <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col items-center">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-slate-100 relative">
                {formData.urlPerfil ? (
                  <img
                    src={formData.urlPerfil}
                    className="w-full h-full object-cover"
                    alt="Perfil"
                  />
                ) : (
                  <User className="w-full h-full p-6 text-slate-300" />
                )}
                {saving && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                    <Loader2 className="animate-spin" />
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 shadow-xl border-2 border-white transition-transform hover:scale-110">
                <Camera size={18} />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
            <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Foto de Perfil
            </p>
          </section>

          {/* Dados Pessoais */}
          <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <User className="text-blue-600" size={20} />
              <h2 className="font-black text-slate-900 uppercase tracking-tight">
                Informações Básicas
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-600/10 outline-none font-bold"
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                  Nome Profissional (Apelido)
                </label>
                <input
                  type="text"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-600/10 outline-none font-bold"
                  value={formData.nomeProfissional}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nomeProfissional: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                  E-mail (Não editável)
                </label>
                <input
                  type="email"
                  className="w-full px-5 py-4 bg-slate-100 border border-slate-200 rounded-2xl font-bold text-slate-400 cursor-not-allowed"
                  value={formData.email}
                  disabled
                />
              </div>
            </div>
          </section>

          {/* Especialidades */}
          <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Briefcase className="text-blue-600" size={20} />
              <h2 className="font-black text-slate-900 uppercase tracking-tight">
                Minhas Especialidades
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {profissoes.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggleProfissao(p.id)}
                  className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                    formData.profissoesIds.includes(p.id)
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                      : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {p.descricao}
                </button>
              ))}
            </div>
          </section>

          {/* Localização */}
          <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="text-blue-600" size={20} />
              <h2 className="font-black text-slate-900 uppercase tracking-tight">
                Localização
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                  CEP
                </label>
                <input
                  type="text"
                  maxLength={8}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-600/10 outline-none font-bold"
                  value={formData.cep}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setFormData({ ...formData, cep: val });
                    if (val.length === 8) fetchAddress(val);
                  }}
                  required
                />
              </div>
              <div className="flex items-end pb-4 text-xs font-bold text-slate-500">
                {addressPreview && (
                  <span className="flex items-center gap-2 bg-slate-50 px-4 py-4 rounded-2xl w-full border border-slate-100">
                    <CheckCircle2 size={14} className="text-green-500" />{" "}
                    {addressPreview}
                  </span>
                )}
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-4 pt-4">
            <Link
              href="/dashboard"
              className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                "Salvar Alterações"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

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
        router.push("/affiliate/dashboard");
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
        <Loader2 className="animate-spin text-green-600" size={40} />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/affiliate/dashboard"
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-4"
          >
            <ArrowLeft size={16} />
            Voltar ao painel
          </Link>
          <h1 className="text-3xl font-black text-gray-900">Editar Meu Perfil</h1>
          <p className="text-gray-600 mt-2 font-medium">Mantenha suas informações e foto sempre atualizadas</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm font-bold">
            <AlertCircle size={20} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Foto de Perfil */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gray-100 relative">
                {formData.urlPerfil ? (
                  <img src={formData.urlPerfil} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-full h-full p-8 text-gray-300" />
                )}
                {saving && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                    <Loader2 className="animate-spin" />
                  </div>
                )}
              </div>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-green-700 transition-all shadow-lg border-2 border-white"
              >
                <Camera size={18} />
                <input
                  id="avatar-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">Foto de Perfil</h3>
              <p className="text-xs text-gray-500 mt-1">Sua foto aparecerá nos resultados de busca</p>
            </div>
          </div>

          {/* Informações Pessoais */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <User className="w-5 h-5" />
              Informações Pessoais
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome Profissional *</label>
                <input
                  type="text"
                  required
                  value={formData.nomeProfissional}
                  onChange={(e) => setFormData({ ...formData, nomeProfissional: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">E-mail (não editável)</label>
                <input
                  type="email"
                  disabled
                  value={formData.email}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Especialidades */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Especialidades
            </h2>
            <div className="flex flex-wrap gap-2">
              {profissoes.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggleProfissao(p.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    formData.profissoesIds.includes(p.id)
                      ? "bg-green-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {p.descricao}
                </button>
              ))}
            </div>
          </div>

          {/* Localização */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Localização
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CEP *</label>
                <input
                  type="text"
                  required
                  maxLength={8}
                  placeholder="Somente números"
                  value={formData.cep}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setFormData({ ...formData, cep: val });
                    if (val.length === 8) fetchAddress(val);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>
              {addressPreview && (
                <div className="flex items-end">
                  <span className="flex items-center gap-2 text-sm font-medium text-gray-600 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 w-full">
                    <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                    {addressPreview}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Botões */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <Link
              href="/affiliate/dashboard"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader2 className="animate-spin" size={16} /> : null}
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

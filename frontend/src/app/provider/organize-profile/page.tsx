"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft, Crown, CheckCircle2, ImageIcon, Trash2, Eye,
  Plus, Star, Briefcase, GripVertical, X, Upload,
} from "lucide-react";
import { useUser } from "@/context/UserContext";

const API = process.env.NEXT_PUBLIC_API_URL || "https://localhost";

interface Foto { id: string; url: string; posicao: number; }
interface Projeto { id: string; titulo: string; descricao: string; posicao: number; fotos: Foto[]; }
interface Destaque { id: string; icone: string; titulo: string; descricao: string; }

const ICONES = ["⭐", "🏆", "🔧", "💼", "🕐", "📍", "✅", "🎯", "💡", "🛠️"];

export default function OrganizeProfilePage() {
  const { user } = useUser();
  const [tab, setTab] = useState<"portfolio" | "destaques">("portfolio");

  // Portfólio
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loadingPort, setLoadingPort] = useState(true);
  const [showAddProjeto, setShowAddProjeto] = useState(false);
  const [novoProjeto, setNovoProjeto] = useState({ titulo: "", descricao: "" });
  const [savingProjeto, setSavingProjeto] = useState(false);
  const [projetoError, setProjetoError] = useState("");
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTargetId, setUploadTargetId] = useState<string | null>(null);
  const [novoProjetoFotos, setNovoProjetoFotos] = useState<File[]>([]);
  const [novoProjetoPreview, setNovoProjetoPreview] = useState<string[]>([]);

  // Destaques (localStorage)
  const [destaques, setDestaques] = useState<Destaque[]>([]);
  const [showAddDestaque, setShowAddDestaque] = useState(false);
  const [novoDestaque, setNovoDestaque] = useState({ icone: "⭐", titulo: "", descricao: "" });

  useEffect(() => {
    if (!user?.token) return;
    fetch(`${API}/api/portifolio/projeto/meu`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((r) => r.json())
      .then((d) => setProjetos(d.projetos || []))
      .catch(() => {})
      .finally(() => setLoadingPort(false));

    const saved = localStorage.getItem(`@destaques:${user.id}`);
    if (saved) setDestaques(JSON.parse(saved));
  }, [user?.token]);

  const salvarDestaques = (list: Destaque[]) => {
    setDestaques(list);
    if (user?.id) localStorage.setItem(`@destaques:${user.id}`, JSON.stringify(list));
  };

  const handleNovoProjetoFotos = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    setNovoProjetoFotos((prev) => [...prev, ...arr]);
    arr.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (e) => setNovoProjetoPreview((prev) => [...prev, e.target?.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const handleRemoveNovaFoto = (idx: number) => {
    setNovoProjetoFotos((prev) => prev.filter((_, i) => i !== idx));
    setNovoProjetoPreview((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddProjeto = async () => {
    if (!novoProjeto.titulo || !novoProjeto.descricao) {
      setProjetoError("Preencha título e descrição.");
      return;
    }
    setSavingProjeto(true);
    setProjetoError("");
    try {
      const res = await fetch(`${API}/api/portifolio/projeto`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user!.token}`, "Content-Type": "application/json" },
        body: JSON.stringify(novoProjeto),
      });
      const data = await res.json();
      if (res.ok) {
        let fotos: Foto[] = [];
        if (novoProjetoFotos.length > 0) {
          const form = new FormData();
          novoProjetoFotos.forEach((f) => form.append("imagens", f));
          const upRes = await fetch(`${API}/api/portifolio/projeto/${data.id}/upload`, {
            method: "POST",
            headers: { Authorization: `Bearer ${user!.token}` },
            body: form,
          });
          if (upRes.ok) {
            const upData = await upRes.json();
            fotos = upData.imagens || [];
          }
        }
        setProjetos((prev) => [...prev, { ...data, fotos }]);
        setNovoProjeto({ titulo: "", descricao: "" });
        setNovoProjetoFotos([]);
        setNovoProjetoPreview([]);
        setShowAddProjeto(false);
      } else {
        setProjetoError(data.error || "Erro ao criar projeto.");
      }
    } catch {
      setProjetoError("Erro de conexão.");
    } finally {
      setSavingProjeto(false);
    }
  };

  const handleDeleteProjeto = async (id: string) => {
    if (!confirm("Remover este trabalho do portfólio?")) return;
    await fetch(`${API}/api/portifolio/projeto/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${user!.token}` },
    });
    setProjetos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleUploadFoto = async (projetoId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingId(projetoId);
    const form = new FormData();
    Array.from(files).forEach((f) => form.append("imagens", f));
    try {
      const res = await fetch(`${API}/api/portifolio/projeto/${projetoId}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user!.token}` },
        body: form,
      });
      const data = await res.json();
      if (res.ok) {
        setProjetos((prev) =>
          prev.map((p) =>
            p.id === projetoId ? { ...p, fotos: [...p.fotos, ...data.imagens] } : p
          )
        );
      }
    } finally {
      setUploadingId(null);
    }
  };

  const handleDeleteFoto = async (fotoId: string, projetoId: string) => {
    await fetch(`${API}/api/portifolio/projeto/foto/${fotoId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${user!.token}` },
    });
    setProjetos((prev) =>
      prev.map((p) =>
        p.id === projetoId ? { ...p, fotos: p.fotos.filter((f) => f.id !== fotoId) } : p
      )
    );
  };

  const handleAddDestaque = () => {
    if (!novoDestaque.titulo || !novoDestaque.descricao) return;
    const novo: Destaque = { id: crypto.randomUUID(), ...novoDestaque };
    salvarDestaques([...destaques, novo]);
    setNovoDestaque({ icone: "⭐", titulo: "", descricao: "" });
    setShowAddDestaque(false);
  };

  const handleDeleteDestaque = (id: string) => {
    salvarDestaques(destaques.filter((d) => d.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header laranja */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 px-6 py-8">
        <Link href="/affiliate/dashboard" className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm mb-4">
          <ArrowLeft className="w-4 h-4" /> Voltar para dashboard
        </Link>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Organizar Perfil Premium</h1>
            <p className="text-white/80 text-sm">Destaque seu trabalho e atraia mais clientes</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-2">
        {/* Recursos Premium */}
        <div className="bg-white border border-orange-100 rounded-2xl p-5 mb-6 shadow-sm">
          <p className="text-sm font-black text-orange-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Crown className="w-4 h-4" /> Recursos Premium Ativos
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: <ImageIcon className="w-4 h-4 text-green-500" />, title: "Portfólio Ilimitado", sub: "Adicione quantos trabalhos quiser" },
              { icon: <Star className="w-4 h-4 text-blue-500" />, title: "Destaques Personalizados", sub: "Crie badges únicos para seu perfil" },
              { icon: <Briefcase className="w-4 h-4 text-purple-500" />, title: "Prioridade nas Buscas", sub: "Apareça primeiro nos resultados" },
            ].map((r) => (
              <div key={r.title} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-black text-gray-900">{r.title}</p>
                  <p className="text-xs text-gray-500">{r.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6">
          <div className="flex border-b border-gray-100">
            {(["portfolio", "destaques"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-4 text-sm font-black uppercase tracking-widest transition-all ${
                  tab === t
                    ? "text-orange-500 border-b-2 border-orange-500"
                    : "text-gray-400 hover:text-gray-700"
                }`}
              >
                {t === "portfolio" ? "📁 Portfólio" : "⭐ Destaques"}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* === PORTFÓLIO === */}
            {tab === "portfolio" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-black text-gray-900">Gerenciar Portfólio</h2>
                    <p className="text-sm text-gray-500">Organize seus trabalhos anteriores para impressionar clientes</p>
                  </div>
                  <button
                    onClick={() => setShowAddProjeto(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-sm transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Adicionar Trabalho
                  </button>
                </div>

                {/* Modal adicionar projeto */}
                {showAddProjeto && (
                  <div className="mb-6 p-5 bg-blue-50 border border-blue-100 rounded-2xl space-y-3">
                    <h3 className="font-black text-gray-900">Novo Trabalho</h3>
                    {projetoError && <p className="text-red-500 text-sm">{projetoError}</p>}
                    <input
                      type="text"
                      placeholder="Título do trabalho"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                      value={novoProjeto.titulo}
                      onChange={(e) => setNovoProjeto({ ...novoProjeto, titulo: e.target.value })}
                    />
                    <textarea
                      rows={3}
                      placeholder="Descreva o trabalho realizado..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium resize-none"
                      value={novoProjeto.descricao}
                      onChange={(e) => setNovoProjeto({ ...novoProjeto, descricao: e.target.value })}
                    />

                    {/* Upload de fotos no modal */}
                    <div>
                      <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Fotos do trabalho</p>
                      <div className="flex flex-wrap gap-2">
                        {novoProjetoPreview.map((src, i) => (
                          <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden group">
                            <img src={src} alt="" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemoveNovaFoto(i)}
                              className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center"
                            >
                              <X className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        ))}
                        <label className="w-20 h-20 rounded-xl border-2 border-dashed border-blue-200 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors gap-1">
                          <Upload className="w-5 h-5 text-blue-400" />
                          <span className="text-[10px] text-blue-400 font-bold">Adicionar</span>
                          <input type="file" className="hidden" accept="image/*" multiple onChange={(e) => handleNovoProjetoFotos(e.target.files)} />
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleAddProjeto}
                        disabled={savingProjeto}
                        className="px-5 py-2 bg-blue-600 text-white rounded-xl font-black text-sm hover:bg-blue-700 disabled:opacity-50"
                      >
                        {savingProjeto ? "Salvando..." : "Salvar"}
                      </button>
                      <button
                        onClick={() => { setShowAddProjeto(false); setProjetoError(""); setNovoProjetoFotos([]); setNovoProjetoPreview([]); }}
                        className="px-5 py-2 bg-gray-100 text-gray-600 rounded-xl font-black text-sm hover:bg-gray-200"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {loadingPort ? (
                  <p className="text-center text-gray-400 py-8">Carregando...</p>
                ) : projetos.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-bold">Nenhum trabalho adicionado ainda</p>
                    <p className="text-sm">Clique em "Adicionar Trabalho" para começar</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projetos.map((p) => (
                      <div key={p.id} className="border border-gray-100 rounded-2xl p-4 bg-white shadow-sm">
                        <div className="flex items-start gap-3">
                          <GripVertical className="w-5 h-5 text-gray-300 mt-1 shrink-0" />
                          {/* Thumbnail */}
                          <div className="w-20 h-16 bg-gray-100 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                            {p.fotos[0] ? (
                              <img src={p.fotos[0].url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-6 h-6 text-gray-300" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-gray-900 truncate">{p.titulo}</p>
                            <p className="text-sm text-gray-500 line-clamp-2">{p.descricao}</p>
                            <p className="text-xs text-gray-400 mt-1">Posição: {p.posicao}</p>
                            {/* Fotos */}
                            <div className="flex flex-wrap gap-2 mt-2">
                              {p.fotos.map((f) => (
                                <div key={f.id} className="relative w-12 h-12 rounded-lg overflow-hidden group">
                                  <img src={f.url} alt="" className="w-full h-full object-cover" />
                                  <button
                                    onClick={() => handleDeleteFoto(f.id, p.id)}
                                    className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center"
                                  >
                                    <X className="w-3 h-3 text-white" />
                                  </button>
                                </div>
                              ))}
                              <label className="w-12 h-12 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors">
                                {uploadingId === p.id ? (
                                  <span className="text-[9px] text-gray-400">...</span>
                                ) : (
                                  <Upload className="w-4 h-4 text-gray-400" />
                                )}
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  multiple
                                  onChange={(e) => handleUploadFoto(p.id, e.target.files)}
                                />
                              </label>
                            </div>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                              <Eye className="w-4 h-4 text-gray-400" />
                            </button>
                            <button
                              onClick={() => handleDeleteProjeto(p.id)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="p-4 bg-blue-50 rounded-xl text-sm text-blue-700">
                      <span className="font-black">Dica:</span> Arraste os itens para reorganizar a ordem de exibição. Os trabalhos mais impressionantes devem aparecer primeiro!
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* === DESTAQUES === */}
            {tab === "destaques" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-black text-gray-900">Meus Destaques</h2>
                    <p className="text-sm text-gray-500">Crie badges personalizados para destacar seus diferenciais</p>
                  </div>
                  <button
                    onClick={() => setShowAddDestaque(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-black text-sm transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Novo Destaque
                  </button>
                </div>

                {/* Modal adicionar destaque */}
                {showAddDestaque && (
                  <div className="mb-6 p-5 bg-orange-50 border border-orange-100 rounded-2xl space-y-3">
                    <h3 className="font-black text-gray-900">Novo Destaque</h3>
                    <div>
                      <p className="text-xs font-black text-gray-500 uppercase mb-2">Ícone</p>
                      <div className="flex flex-wrap gap-2">
                        {ICONES.map((ic) => (
                          <button
                            key={ic}
                            onClick={() => setNovoDestaque({ ...novoDestaque, icone: ic })}
                            className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                              novoDestaque.icone === ic ? "bg-orange-500 shadow-md scale-110" : "bg-gray-100 hover:bg-gray-200"
                            }`}
                          >
                            {ic}
                          </button>
                        ))}
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="Título (ex: 10 anos de experiência)"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-400 font-medium"
                      value={novoDestaque.titulo}
                      onChange={(e) => setNovoDestaque({ ...novoDestaque, titulo: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="Descrição (ex: Atuando desde 2014 na região)"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-400 font-medium"
                      value={novoDestaque.descricao}
                      onChange={(e) => setNovoDestaque({ ...novoDestaque, descricao: e.target.value })}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddDestaque}
                        className="px-5 py-2 bg-orange-500 text-white rounded-xl font-black text-sm hover:bg-orange-600"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => setShowAddDestaque(false)}
                        className="px-5 py-2 bg-gray-100 text-gray-600 rounded-xl font-black text-sm hover:bg-gray-200"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {destaques.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Star className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-bold">Nenhum destaque criado</p>
                    <p className="text-sm">Adicione badges para mostrar seus diferenciais aos clientes</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {destaques.map((d) => (
                      <div key={d.id} className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm group">
                        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-2xl shrink-0">
                          {d.icone}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-gray-900 truncate">{d.titulo}</p>
                          <p className="text-sm text-gray-500 truncate">{d.descricao}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteDestaque(d.id)}
                          className="p-2 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Pré-visualizar */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="font-black text-gray-900">Visualizar Perfil</p>
            <p className="text-sm text-gray-500">Veja como seu perfil aparece para os clientes</p>
          </div>
          <Link
            href={`/provider/${user?.id}`}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-black text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-4 h-4" /> Pré-visualizar
          </Link>
        </div>
      </div>
    </div>
  );
}

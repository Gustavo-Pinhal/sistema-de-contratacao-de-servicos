"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ChevronLeft,
  Upload,
  X,
  Loader2,
  MapPin,
  CheckCircle2,
  Home,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@/context/UserContext";

interface EnderecoSalvo {
  id: string;
  endereco: string;
  cep: string;
  municipio: string;
}

export default function RequestQuotePage() {
  const params = useParams();
  const providerId = params.id as string;
  const router = useRouter();
  const { user } = useUser();

  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [enderecosSalvos, setEnderecosSalvos] = useState<EnderecoSalvo[]>([]);
  const [selectedEnderecoId, setSelectedEnderecoId] = useState<string | null>(
    null,
  );
  const [municipioInfo, setMunicipioInfo] = useState("");

  const [formData, setFormData] = useState({
    descricao: "",
    cep: "",
    rua: "",
    numero: "",
    complemento: "",
    photos: [] as File[],
  });

  // 1. Carregar endereços salvos do cliente
  useEffect(() => {
    if (user?.token) {
      fetch("/api/cliente/enderecos", {
        headers: { Authorization: `Bearer ${user.token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setEnderecosSalvos(data);
        });
    }
  }, [user?.token]);

  // 2. Autocomplete de CEP
  useEffect(() => {
    const cepLimpado = formData.cep.replace(/\D/g, "");
    if (cepLimpado.length === 8 && !selectedEnderecoId) {
      handleCepLookup(cepLimpado);
    }
  }, [formData.cep]);

  const handleCepLookup = async (cep: string) => {
    setCepLoading(true);
    try {
      const res = await fetch(`/api/ui/endereco?cep=${cep}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      const data = await res.json();

      if (res.ok) {
        setFormData((prev) => ({
          ...prev,
          rua: data.rua || "",
          complemento: data.bairro || "",
        }));
        setMunicipioInfo(`${data.municipio.nome} - ${data.municipio.uf}`);
      } else {
        setMunicipioInfo("CEP não encontrado");
      }
    } catch (err) {
      setMunicipioInfo("Erro ao buscar CEP");
    } finally {
      setCepLoading(false);
    }
  };

  const selectSavedAddress = (addr: EnderecoSalvo) => {
    if (selectedEnderecoId === addr.id) {
      setSelectedEnderecoId(null);
      setFormData({
        ...formData,
        cep: "",
        rua: "",
        numero: "",
        complemento: "",
      });
      setMunicipioInfo("");
    } else {
      setSelectedEnderecoId(addr.id);
      setFormData({
        ...formData,
        cep: addr.cep,
        rua: addr.endereco.split(",")[0],
        numero: addr.endereco.split(",")[1]?.trim() || "",
        complemento: "",
      });
      setMunicipioInfo(addr.municipio);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos = Array.from(e.target.files);
      setFormData((prev) => ({
        ...prev,
        photos: [...prev.photos, ...newPhotos],
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.token) return alert("Sessão expirada. Logue novamente.");
    setLoading(true);

    try {
      // Corpo da requisição muda se for endereço salvo ou novo
      const body = selectedEnderecoId
        ? { descricao: formData.descricao, idEndereco: selectedEnderecoId }
        : {
            descricao: formData.descricao,
            cep: formData.cep,
            rua: formData.rua,
            numero: formData.numero,
            complemento: formData.complemento,
          };

      const response = await fetch(`/api/prestadores/${providerId}/solicitar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Erro na solicitação");

      const idServico = data.idServico;

      // Upload de Imagens Sequencial
      for (const photo of formData.photos) {
        const imgFormData = new FormData();
        imgFormData.append("file", photo);
        await fetch(`/api/servico/${idServico}/chat/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${user.token}` },
          body: imgFormData,
        });
      }

      router.push(`/service/${idServico}`);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link
          href={`/search`}
          className="inline-flex items-center gap-2 text-slate-400 font-bold mb-8 hover:text-blue-600 transition-colors uppercase text-[10px] tracking-widest"
        >
          <ChevronLeft className="w-4 h-4" /> Voltar para busca
        </Link>

        <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-10 border-b border-slate-100 bg-slate-50/50">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
              Solicitar Orçamento
            </h1>
            <p className="text-slate-500 font-bold mt-2">
              Descreva o serviço e confirme o local de atendimento.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-10 space-y-10">
            {/* Descrição */}
            <section>
              <label className="label-caps">Descrição do Problema *</label>
              <textarea
                required
                className="input-base min-h-30 resize-none"
                placeholder="Detalhe o que precisa ser feito..."
                value={formData.descricao}
                onChange={(e) =>
                  setFormData({ ...formData, descricao: e.target.value })
                }
              />
            </section>

            {/* Endereços Salvos */}
            {enderecosSalvos.length > 0 && (
              <section className="animate-in fade-in slide-in-from-top-2">
                <label className="label-caps">Seus Endereços Salvos</label>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {enderecosSalvos.map((addr) => (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => selectSavedAddress(addr)}
                      className={`shrink-0 p-4 rounded-2xl border-2 transition-all text-left w-64 ${
                        selectedEnderecoId === addr.id
                          ? "border-blue-600 bg-blue-50"
                          : "border-slate-100 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <Home
                          className={
                            selectedEnderecoId === addr.id
                              ? "text-blue-600"
                              : "text-slate-400"
                          }
                          size={20}
                        />
                        {selectedEnderecoId === addr.id && (
                          <CheckCircle2 size={16} className="text-blue-600" />
                        )}
                      </div>
                      <p className="font-black text-slate-900 text-sm mt-3 truncate">
                        {addr.endereco}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                        {addr.municipio}
                      </p>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Formulário de Endereço */}
            <section
              className={`space-y-4 transition-opacity ${selectedEnderecoId ? "opacity-50 pointer-events-none" : "opacity-100"}`}
            >
              <label className="label-caps">
                Onde será o serviço?{" "}
                {selectedEnderecoId && "(Usando endereço salvo)"}
              </label>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="CEP"
                    required
                    className="input-base"
                    value={formData.cep}
                    onChange={(e) =>
                      setFormData({ ...formData, cep: e.target.value })
                    }
                  />
                  {cepLoading && (
                    <Loader2
                      className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-blue-600"
                      size={18}
                    />
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Rua / Logradouro"
                  required
                  className="input-base md:col-span-3"
                  value={formData.rua}
                  onChange={(e) =>
                    setFormData({ ...formData, rua: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Número"
                  required
                  className="input-base"
                  value={formData.numero}
                  onChange={(e) =>
                    setFormData({ ...formData, numero: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Bairro / Complemento"
                  className="input-base md:col-span-2"
                  value={formData.complemento}
                  onChange={(e) =>
                    setFormData({ ...formData, complemento: e.target.value })
                  }
                />
              </div>

              {municipioInfo && (
                <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest bg-blue-50 p-3 rounded-xl animate-in zoom-in-95">
                  <MapPin size={14} /> {municipioInfo}
                </div>
              )}
            </section>

            {/* Fotos */}
            <section>
              <label className="label-caps">Fotos (Opcional)</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-3">
                {formData.photos.map((photo, i) => (
                  <div
                    key={i}
                    className="relative aspect-square rounded-2xl overflow-hidden border-2 border-slate-100 group"
                  >
                    <img
                      src={URL.createObjectURL(photo)}
                      className="w-full h-full object-cover"
                      alt="Preview"
                    />
                    <button
                      type="button"
                      className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <X size={24} />
                    </button>
                  </div>
                ))}
                <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all group">
                  <Upload className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                  <span className="text-[10px] font-black mt-2 uppercase text-slate-400 group-hover:text-blue-600">
                    Adicionar
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </label>
              </div>
            </section>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-6 rounded-3l font-black uppercase tracking-[0.2em] text-xs hover:bg-blue-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-slate-200 active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Enviar Solicitação"
              )}
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        .label-caps {
          display: block;
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #94a3b8;
          margin-bottom: 12px;
          margin-left: 4px;
        }
        .input-base {
          width: 100%;
          padding: 1.25rem;
          background-color: #f8fafc;
          border-radius: 1.25rem;
          outline: none;
          font-weight: 700;
          color: #1e293b;
          border: 2px solid transparent;
          transition: all 0.2s;
        }
        .input-base:focus {
          background-color: #fff;
          border-color: #3b82f6;
          box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.1);
        }
      `}</style>
    </div>
  );
}

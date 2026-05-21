"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ChevronLeft,
  Upload,
  X,
  Loader2,
  MapPin,
  CheckCircle2,
  Home,
  FileText,
} from "lucide-react";
import Link from "next/link";
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
        })
        .catch(() => console.error("Erro ao buscar endereços salvos."));
    }
  }, [user?.token]);

  // 2. Autocomplete de CEP
  useEffect(() => {
    const cepLimpado = formData.cep.replace(/\D/g, "");
    if (cepLimpado.length === 8 && !selectedEnderecoId) {
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

      handleCepLookup(cepLimpado);
    }
  }, [formData.cep, selectedEnderecoId, user?.token]);

  const selectSavedAddress = (addr: EnderecoSalvo) => {
    if (selectedEnderecoId === addr.id) {
      setSelectedEnderecoId(null);
      setFormData((prev) => ({
        ...prev,
        cep: "",
        rua: "",
        numero: "",
        complemento: "",
      }));
      setMunicipioInfo("");
    } else {
      setSelectedEnderecoId(addr.id);
      setFormData((prev) => ({
        ...prev,
        cep: addr.cep,
        rua: addr.endereco.split(",")[0],
        numero: addr.endereco.split(",")[1]?.trim() || "",
        complemento: "",
      }));
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

  const removePhoto = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.token) return alert("Sessão expirada. Logue novamente.");
    setLoading(true);

    try {
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
      <div className="max-w-3xl mx-auto px-4">
        {/* Link de Retorno Superior */}
        <Link
          href={`/search`}
          className="inline-flex items-center gap-2 text-slate-400 font-bold mb-6 hover:text-blue-600 transition-colors uppercase text-[10px] tracking-widest"
        >
          <ChevronLeft className="w-4 h-4" /> Voltar para busca
        </Link>

        {/* Card Principal do Formulário */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Cabeçalho */}
          <div className="p-8 md:p-10 border-b border-slate-100 bg-slate-50/70">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight uppercase">
              Solicitar Orçamento
            </h1>
            <p className="text-sm text-slate-500 font-semibold mt-1.5">
              Descreva os detalhes do seu problema e confirme onde o atendimento
              será prestado.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">
            {/* Campo: Descrição */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Descrição do Problema *
              </label>
              <div className="relative rounded-2xl border border-slate-200 bg-slate-50 focus-within:border-blue-600 focus-within:bg-white focus-within:shadow-md focus-within:shadow-blue-600/5 transition-all p-4 flex gap-3 items-start">
                <FileText
                  className="text-slate-400 shrink-0 mt-0.5"
                  size={18}
                />
                <textarea
                  required
                  rows={4}
                  className="w-full bg-transparent outline-none font-semibold text-sm text-slate-800 placeholder-slate-400 resize-none"
                  placeholder="Seja detalhista. Explique o que precisa ser reparado, trocado ou instalado para receber propostas precisas..."
                  value={formData.descricao}
                  onChange={(e) =>
                    setFormData({ ...formData, descricao: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Campo opcional: Endereços Salvos */}
            {enderecosSalvos.length > 0 && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  Seus Endereços Salvos
                </label>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
                  {enderecosSalvos.map((addr) => {
                    const isSelected = selectedEnderecoId === addr.id;
                    return (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => selectSavedAddress(addr)}
                        className={`shrink-0 snap-start p-4 rounded-2xl border-2 transition-all text-left w-64 flex flex-col justify-between ${
                          isSelected
                            ? "border-blue-600 bg-blue-50/50 shadow-md shadow-blue-600/5"
                            : "border-slate-100 bg-slate-50/50 hover:border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <Home
                            className={
                              isSelected ? "text-blue-600" : "text-slate-400"
                            }
                            size={18}
                          />
                          {isSelected && (
                            <CheckCircle2
                              size={16}
                              className="text-blue-600 fill-blue-100"
                            />
                          )}
                        </div>
                        <div className="mt-4">
                          <p className="font-black text-slate-800 text-xs truncate">
                            {addr.endereco}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">
                            {addr.municipio}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bloco Dinâmico: Local de Atendimento */}
            <div className="space-y-4">
              <div className="flex items-center justify-between ml-1">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Localização do Serviço
                </label>
                {selectedEnderecoId && (
                  <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wider animate-pulse">
                    Utilizando Endereço Selecionado acima
                  </span>
                )}
              </div>

              <div
                className={`space-y-3 transition-all duration-300 ${
                  selectedEnderecoId
                    ? "opacity-40 pointer-events-none filter grayscale select-none"
                    : "opacity-100"
                }`}
              >
                {/* Linha 1: CEP e Rua */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="relative rounded-2xl border border-slate-200 bg-slate-50 focus-within:border-blue-600 focus-within:bg-white transition-all px-4 py-3.5 flex items-center">
                    <input
                      type="text"
                      placeholder="CEP"
                      maxLength={9}
                      required={!selectedEnderecoId}
                      className="w-full bg-transparent outline-none font-bold text-sm text-slate-800 placeholder-slate-400 p-2"
                      value={formData.cep}
                      onChange={(e) =>
                        setFormData({ ...formData, cep: e.target.value })
                      }
                    />
                    {cepLoading && (
                      <Loader2
                        className="animate-spin text-blue-600 ml-2 shrink-0"
                        size={16}
                      />
                    )}
                  </div>

                  <div className="md:col-span-3 rounded-2xl border border-slate-200 bg-slate-50 focus-within:border-blue-600 focus-within:bg-white transition-all px-4 py-3.5">
                    <input
                      type="text"
                      placeholder="Logradouro / Avenida / Rua"
                      required={!selectedEnderecoId}
                      className="w-full bg-transparent outline-none font-bold text-sm text-slate-800 placeholder-slate-400 p-2"
                      value={formData.rua}
                      onChange={(e) =>
                        setFormData({ ...formData, rua: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Linha 2: Número e Complemento */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 focus-within:border-blue-600 focus-within:bg-white transition-all px-4 py-3.5">
                    <input
                      type="text"
                      placeholder="Número"
                      required={!selectedEnderecoId}
                      className="w-full bg-transparent outline-none font-bold text-sm text-slate-800 placeholder-slate-400 p-2"
                      value={formData.numero}
                      onChange={(e) =>
                        setFormData({ ...formData, numero: e.target.value })
                      }
                    />
                  </div>

                  <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 focus-within:border-blue-600 focus-within:bg-white transition-all px-4 py-3.5 p-2">
                    <input
                      type="text"
                      placeholder="Bairro, Bloco ou Complemento (Opcional)"
                      className="w-full bg-transparent outline-none font-bold text-sm text-slate-800 placeholder-slate-400"
                      value={formData.complemento}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          complemento: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Tag de Validação do Município Retornado */}
              {municipioInfo && (
                <div className="flex items-center gap-2 text-blue-700 font-black text-[10px] uppercase tracking-widest bg-blue-50 border border-blue-100 p-3 rounded-2xl animate-in zoom-in-95 duration-200">
                  <MapPin size={14} className="text-blue-500" />
                  <span>Região de Atendimento: {municipioInfo}</span>
                </div>
              )}
            </div>

            {/* Campo: Upload de Fotos do Problema */}
            <div className="space-y-3">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Imagens de Evidência (Opcional)
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {formData.photos.map((photo, i) => (
                  <div
                    key={i}
                    className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 group animate-in zoom-in-90"
                  >
                    <img
                      src={URL.createObjectURL(photo)}
                      className="w-full h-full object-cover"
                      alt="Preview do anexo"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute inset-0 bg-slate-900/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ))}

                {/* Botão Input File Estilizado */}
                <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer bg-slate-50/50 hover:bg-blue-50/50 hover:border-blue-400 transition-all group">
                  <Upload
                    className="text-slate-400 group-hover:text-blue-600 transition-colors"
                    size={20}
                  />
                  <span className="text-[10px] font-black mt-1.5 uppercase text-slate-400 group-hover:text-blue-600 tracking-wider">
                    Anexar
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
            </div>

            {/* Botão de Envio Principal */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 px-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-600/10 active:scale-[0.99] mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>Enviando solicitação...</span>
                </>
              ) : (
                <span>Enviar Solicitação de Orçamento</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

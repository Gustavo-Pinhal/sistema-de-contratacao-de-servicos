"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, Upload, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/app/context/UserContext";

export default function RequestQuotePage() {
  const params = useParams();
  const providerId = params.id as string;
  const router = useRouter();
  const { user } = useUser();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    descricao: "",
    cep: "",
    rua: "",
    numero: "",
    complemento: "",
    photos: [] as File[],
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos = Array.from(e.target.files);
      setFormData((prev) => ({
        ...prev,
        photos: [...prev.photos, ...newPhotos],
      }));
    }
  };

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.token) return alert("Você precisa estar logado.");

    setLoading(true);

    try {
      // 1. Criar a solicitação de serviço
      const response = await fetch(`/api/prestadores/${providerId}/solicitar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          descricao: formData.descricao,
          cep: formData.cep,
          rua: formData.rua,
          numero: formData.numero,
          complemento: formData.complemento,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Erro ao solicitar orçamento");
      }

      const idServico = data.idServico;

      // 2. Upload de Imagens (Sequencial, conforme seu back exige)
      if (formData.photos.length > 0) {
        for (const photo of formData.photos) {
          const imgFormData = new FormData();
          imgFormData.append("file", photo);

          await fetch(`/api/servico/${idServico}/chat/upload`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
            body: imgFormData,
          });
        }
      }

      alert("Solicitação enviada com sucesso!");
      router.push(`/service/${idServico}`); // Redireciona para o chat/gestão
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <Link
          href={`/provider/${providerId}`}
          className="inline-flex items-center gap-2 text-gray-500 font-bold mb-6 hover:text-gray-800"
        >
          <ChevronLeft className="w-4 h-4" /> Voltar ao perfil
        </Link>

        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
          <div className="p-8 border-b border-gray-50">
            <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">
              Solicitar Orçamento
            </h1>
            <p className="text-gray-500 font-medium mt-1">
              Explique o que você precisa e envie fotos do local.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Descrição */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
                Descrição do Problema *
              </label>
              <textarea
                required
                className="w-full p-5 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 min-h-[150px] font-medium"
                placeholder="Ex: Minha torneira da cozinha está vazando muito..."
                value={formData.descricao}
                onChange={(e) =>
                  setFormData({ ...formData, descricao: e.target.value })
                }
              />
            </div>

            {/* Upload de Fotos */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
                Fotos do Local
              </label>
              <div className="grid grid-cols-4 gap-4 mb-4">
                {formData.photos.map((photo, i) => (
                  <div
                    key={i}
                    className="relative aspect-square rounded-xl overflow-hidden border"
                  >
                    <img
                      src={URL.createObjectURL(photo)}
                      className="w-full h-full object-cover"
                      alt="Preview"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-green-50 hover:border-green-300 transition-all">
                  <Upload className="text-gray-400" />
                  <span className="text-[10px] font-bold mt-2 uppercase">
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
            </div>

            {/* Endereço */}
            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">
                Onde será o serviço?
              </label>
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="CEP"
                  required
                  className="p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-bold"
                  value={formData.cep}
                  onChange={(e) =>
                    setFormData({ ...formData, cep: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Rua"
                  required
                  className="col-span-2 p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-bold"
                  value={formData.rua}
                  onChange={(e) =>
                    setFormData({ ...formData, rua: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Número"
                  required
                  className="p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-bold"
                  value={formData.numero}
                  onChange={(e) =>
                    setFormData({ ...formData, numero: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Complemento"
                  className="p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-bold"
                  value={formData.complemento}
                  onChange={(e) =>
                    setFormData({ ...formData, complemento: e.target.value })
                  }
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-green-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
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
    </div>
  );
}

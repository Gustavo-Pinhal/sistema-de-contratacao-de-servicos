"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Briefcase,
  Calendar,
  DollarSign,
  UploadCloud,
  X,
  AlertCircle,
} from "lucide-react";
import { useUser } from "@/context/UserContext";

interface ResumoServico {
  servico: {
    id: string;
    prestador: {
      id: string;
      nome: string;
    };
    status: string;
  };
  total: number;
  conclusao: string;
}

interface LocalFile {
  id: string;
  file: File;
  previewUrl: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost";

export default function CriarProjetoPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const serviceId = searchParams.get("servico");

  // Estados de Carregamento e Erros
  const [loadingResumo, setLoadingResumo] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resumo, setResumo] = useState<ResumoServico | null>(null);

  // Estados do Form do Projeto
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [exibirValor, setExibirValor] = useState(true);
  const [exibirConcluidoEm, setExibirConcluidoEm] = useState(true);

  // Estado das Fotos Locais (antes do Submit)
  const [selectedFiles, setSelectedFiles] = useState<LocalFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Carrega o resumo do serviço concluído
  useEffect(() => {
    if (userLoading) return;

    if (!user?.token) {
      setError("Você precisa estar autenticado para acessar esta área.");
      setLoadingResumo(false);
      return;
    }

    if (!serviceId) {
      setError("ID do serviço não fornecido na URL (?servico=UUID).");
      setLoadingResumo(false);
      return;
    }

    async function fetchResumo() {
      try {
        setLoadingResumo(true);
        const res = await fetch(
          `${API_BASE_URL}/api/servico/${serviceId}/projeto`,
          {
            headers: { Authorization: `Bearer ${user?.token}` },
          },
        );

        if (res.status === 403) {
          throw new Error(
            "Acesso negado. Você não é o prestador dono deste serviço.",
          );
        }

        if (!res.ok) {
          throw new Error(
            "Falha ao obter o resumo do serviço para o portfólio.",
          );
        }

        const data = (await res.json()) as ResumoServico;
        setResumo(data);
        setTitulo(`Projeto de Portfólio - Serviço #${serviceId?.slice(0, 8)}`);
      } catch (err: any) {
        setError(err.message || "Erro de conexão com o servidor.");
      } finally {
        setLoadingResumo(false);
      }
    }

    fetchResumo();
  }, [serviceId, user?.token, userLoading]);

  // 2. Gerenciamento Local de Fotos (Adicionar à lista)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles: LocalFile[] = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setSelectedFiles((prev) => [...prev, ...newFiles]);

    if (fileInputRef.current) fileInputRef.current.value = ""; // Limpa input para permitir re-seleção
  };

  // 3. Gerenciamento Local de Fotos (Remover da lista antes do envio)
  const handleRemoveLocalFile = (id: string, previewUrl: string) => {
    setSelectedFiles((prev) => prev.filter((item) => item.id !== id));
    URL.revokeObjectURL(previewUrl); // Evita vazamento de memória
  };

  // 4. Fluxo Sequencial de Envio Completo
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.token || !serviceId) return;

    try {
      setIsSubmitting(true);
      setError(null);

      // PASSO A: Criar o Projeto via POST
      const resProjeto = await fetch(
        `${API_BASE_URL}/api/servico/${serviceId}/projeto`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
          body: JSON.stringify({
            titulo,
            descricao,
            exibirValor,
            exibirConcluidoEm,
          }),
        },
      );

      if (resProjeto.status === 422) {
        const errData = await resProjeto.json().catch(() => ({}));
        throw new Error(
          errData.message ||
            "Erro de validação. Verifique os limites de caracteres.",
        );
      }

      if (!resProjeto.ok) {
        throw new Error(
          "Não foi possível criar o projeto. Verifique se ele já foi gerado anteriormente.",
        );
      }

      const projetoJson = await resProjeto.json();
      const createdProjectId = projetoJson.id; // Captura o ID retornado pela API atualizada

      if (!createdProjectId) {
        throw new Error(
          "O servidor criou o projeto mas não retornou um ID válido.",
        );
      }

      // PASSO B: Se houver fotos selecionadas, executa o upload em lote com o ID gerado
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach((item) => {
          formData.append("imagens[]", item.file);
        });

        const resUpload = await fetch(
          `${API_BASE_URL}/api/portifolio/projeto/${createdProjectId}/upload`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${user?.token}`,
            },
            body: formData,
          },
        );

        if (!resUpload.ok) {
          throw new Error(
            "Projeto criado com sucesso, mas ocorreu uma falha no upload das fotos enviadas.",
          );
        }
      }

      // Limpa os ObjectURLs locais criados para os previews
      selectedFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl));

      // PASSO C: Redirecionamento final do usuário
      router.push(`/affiliate/portifolio/${createdProjectId}`);
    } catch (err: any) {
      setError(err.message || "Falha ao processar requisição sequencial.");
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  if (loadingResumo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-green-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
            Carregando dados do serviço...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 text-slate-800 selection:bg-green-500 selection:text-white">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header Superior */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-500 hover:text-green-600 font-bold transition-colors text-xs uppercase tracking-widest"
          >
            <ArrowLeft size={16} /> Voltar ao serviço
          </button>
          <span className="text-[10px] bg-purple-100 text-purple-700 font-black px-3 py-1 rounded-full uppercase tracking-wider">
            Modo Premium
          </span>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-sm">Erro ao Processar Fluxo</p>
              <p className="text-xs">{error}</p>
            </div>
          </div>
        )}

        <form
          onSubmit={handleFormSubmit}
          className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-8 items-start"
        >
          {/* Coluna Esquerda: Informações e chaves de privacidade proximas */}
          <aside className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 tracking-wider mb-4">
                <Briefcase size={12} className="text-green-600" /> Dados Base do
                Serviço
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase">
                    ID do Vínculo
                  </label>
                  <p className="font-mono text-xs bg-gray-50 p-2 rounded border border-gray-100 mt-1 break-all select-all">
                    {resumo?.servico.id}
                  </p>
                </div>

                {/* Card de Valor Total + Checkbox Acoplada */}
                <div
                  className={`p-4 rounded-xl border transition-all ${exibirValor ? "bg-gray-50/80 border-gray-100" : "bg-gray-100/50 border-gray-200 opacity-60"}`}
                >
                  <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase mb-1">
                    <DollarSign size={10} className="text-gray-400" /> Valor
                    Total
                  </span>
                  <p className="text-xl font-black text-gray-900 mb-3">
                    {formatCurrency(resumo?.total || 0)}
                  </p>

                  <label className="flex items-center gap-2 cursor-pointer pt-2 border-t border-gray-200/60 select-none">
                    <input
                      type="checkbox"
                      checked={exibirValor}
                      onChange={(e) => setExibirValor(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-green-600 focus:ring-green-500 border-gray-300"
                    />
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">
                      Exibir publicamente
                    </span>
                  </label>
                </div>

                {/* Card de Conclusão + Checkbox Acoplada */}
                <div
                  className={`p-4 rounded-xl border transition-all ${exibirConcluidoEm ? "bg-gray-50/80 border-gray-100" : "bg-gray-100/50 border-gray-200 opacity-60"}`}
                >
                  <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase mb-1">
                    <Calendar size={10} className="text-gray-400" /> Concluído
                    Em
                  </span>
                  <p className="text-sm font-black text-gray-900 mb-4">
                    {resumo ? formatDate(resumo.conclusao) : "-"}
                  </p>

                  <label className="flex items-center gap-2 cursor-pointer pt-2 border-t border-gray-200/60 select-none">
                    <input
                      type="checkbox"
                      checked={exibirConcluidoEm}
                      onChange={(e) => setExibirConcluidoEm(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-green-600 focus:ring-green-500 border-gray-300"
                    />
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">
                      Exibir data no portfólio
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-amber-50/60 border border-amber-200 p-5 rounded-2xl text-xs text-amber-800">
              <p className="font-bold uppercase tracking-wider text-[10px] text-amber-900 mb-1">
                📌 Informação Importante
              </p>
              <p>
                Ao salvar, as imagens anexadas ao lado passarão pelo upload
                automático acoplado logo após o registro do projeto.
              </p>
            </div>
          </aside>

          {/* Coluna Direita: Inputs textuais e Bloco de Galeria Pré-Submit */}
          <main className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-5">
              <h2 className="text-xl font-black uppercase tracking-tight text-gray-900">
                Informações do Portfólio
              </h2>

              <div>
                <label className="block text-[10px] font-black uppercase text-gray-500 tracking-wider mb-1">
                  Título do Caso de Sucesso{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={isSubmitting}
                  minLength={3}
                  maxLength={255}
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Instalação de Painel Elétrico Comercial"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl font-medium text-sm focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 disabled:bg-gray-50 text-gray-900"
                />
                <span className="text-[10px] text-gray-400 block mt-1 text-right">
                  {titulo.length}/255
                </span>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-gray-500 tracking-wider mb-1">
                  Descrição Detalhada <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  disabled={isSubmitting}
                  maxLength={4000}
                  rows={5}
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Substituição completa de quadro de distribuição com disjuntores..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl font-medium text-sm focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 resize-none disabled:bg-gray-50 text-gray-900"
                />
                <span className="text-[10px] text-gray-400 block mt-1 text-right">
                  {descricao.length}/4000
                </span>
              </div>

              {/* Seção de Fotos Operável ANTES do Submit */}
              <div className="pt-4 border-t border-gray-100">
                <label className="block text-[10px] font-black uppercase text-gray-500 tracking-wider mb-1">
                  Galeria de Fotos do Caso de Sucesso
                </label>
                <p className="text-xs text-gray-400 mb-3">
                  Escolha os arquivos agora. Eles serão enviados junto ao salvar
                  o projeto.
                </p>

                <div
                  onClick={() => !isSubmitting && fileInputRef.current?.click()}
                  className={`border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center bg-gray-50/50 transition-all group ${isSubmitting ? "cursor-not-allowed opacity-50" : "hover:border-green-600 hover:bg-green-50/10 cursor-pointer"}`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                    disabled={isSubmitting}
                  />
                  <div className="space-y-1.5">
                    <UploadCloud className="w-8 h-8 text-gray-300 group-hover:text-green-600 mx-auto transition-colors" />
                    <p className="text-xs font-black uppercase tracking-wider text-gray-700">
                      Selecionar Imagens
                    </p>
                    <p className="text-[10px] text-gray-400">
                      Formatos aceitos: JPG, PNG
                    </p>
                  </div>
                </div>

                {/* Previews Locais Reativos */}
                {selectedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                      Fotos pré-selecionadas ({selectedFiles.length})
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {selectedFiles.map((item) => (
                        <div
                          key={item.id}
                          className="relative rounded-xl border border-gray-200 overflow-hidden aspect-square bg-gray-100 group"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.previewUrl}
                            alt="Preview local"
                            className="w-full h-full object-cover"
                          />
                          {!isSubmitting && (
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveLocalFile(
                                    item.id,
                                    item.previewUrl,
                                  )
                                }
                                className="bg-red-600 text-white p-1.5 rounded-lg hover:bg-red-700 transition-colors"
                                title="Descartar foto"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Botão de Disparo Único */}
              <div className="pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-green-600 text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl hover:bg-green-700 shadow-lg shadow-green-100 transition-all flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:text-slate-500 disabled:shadow-none"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Processando
                      Projeto & Imagens...
                    </>
                  ) : (
                    "Publicar Projeto no Portfólio"
                  )}
                </button>
              </div>
            </div>
          </main>
        </form>
      </div>
    </div>
  );
}

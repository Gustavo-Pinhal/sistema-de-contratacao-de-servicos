"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Calendar,
  DollarSign,
  MapPin,
  Pencil,
  Trash2,
  UploadCloud,
  X,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Briefcase,
} from "lucide-react";
import { useUser } from "@/context/UserContext";

interface FotoProjeto {
  id: string;
  url: string;
  posicao: number;
}

interface Projeto {
  id: string;
  titulo: string;
  descricao: string;
  regiao: string;
  valor: string;
  exibirValor: boolean;
  concluidoEm: string;
  exibirConcluidoEm: boolean;
  posicao: number;
  fotos: FotoProjeto[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost";

export default function DetalheProjetoPrestadorPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const projectId = params.id as string;

  // Estados de Carregamento e Erros
  const [loading, setLoading] = useState(true);
  const [isSavingTexts, setIsSavingTexts] = useState(false);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modo de Edição Textual
  const [isEditing, setIsEditing] = useState(false);

  // Dados do Projeto
  const [projeto, setProjeto] = useState<Projeto | null>(null);

  // Campos do Formulário de Edição
  const [editTitulo, setEditTitulo] = useState("");
  const [editDescricao, setEditDescricao] = useState("");
  const [editExibirValor, setEditExibirValor] = useState(true);
  const [editExibirConcluidoEm, setEditExibirConcluidoEm] = useState(true);

  // 1. Carrega os dados iniciais do projeto (Buscando através do portfólio do prestador)
  useEffect(() => {
    if (userLoading) return;

    if (!user?.token) {
      setError("Você precisa estar autenticado para gerenciar este projeto.");
      setLoading(false);
      return;
    }

    const prestadorId = user?.id || user?.id;

    async function fetchProjeto() {
      try {
        setLoading(true);
        const res = await fetch(
          `${API_BASE_URL}/api/prestador/${prestadorId}/portifolio`,
        );
        if (!res.ok) throw new Error("Falha ao obter os dados do portfólio.");

        const portfolio = await res.json();
        const projetoEncontrado = portfolio.projetos?.find(
          (p: Projeto) => p.id === projectId,
        );

        if (!projetoEncontrado) {
          throw new Error(
            "Projeto não encontrado ou você não possui permissão para editá-lo.",
          );
        }

        setProjeto(projetoEncontrado);

        // Inicializa os estados do form de edição
        setEditTitulo(projetoEncontrado.titulo);
        setEditDescricao(projetoEncontrado.descricao);
        setEditExibirValor(projetoEncontrado.exibirValor);
        setEditExibirConcluidoEm(projetoEncontrado.exibirConcluidoEm);
      } catch (err: any) {
        setError(err.message || "Erro ao conectar com o servidor.");
      } finally {
        setLoading(false);
      }
    }

    if (prestadorId && projectId) {
      fetchProjeto();
    }
  }, [projectId, user?.token, user?.id, user?.id, userLoading]);

  // 2. Atualiza Dados Textuais e Preferências (PUT)
  const handleUpdateTexts = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.token || !projeto) return;

    try {
      setIsSavingTexts(true);
      setError(null);

      const res = await fetch(
        `${API_BASE_URL}/api/portifolio/projeto/${projeto.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            titulo: editTitulo,
            descricao: editDescricao,
            exibirValor: editExibirValor,
            exibirConcluidoEm: editExibirConcluidoEm,
          }),
        },
      );

      if (res.status === 422) {
        throw new Error(
          "Campos inválidos. Verifique os limites de tamanho da descrição e título.",
        );
      }

      if (!res.ok) throw new Error("Não foi possível atualizar o projeto.");

      // Atualiza o estado local de visualização
      setProjeto((prev) =>
        prev
          ? {
              ...prev,
              titulo: editTitulo,
              descricao: editDescricao,
              exibirValor: editExibirValor,
              exibirConcluidoEm: editExibirConcluidoEm,
            }
          : null,
      );

      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || "Erro ao salvar alterações.");
    } finally {
      setIsSavingTexts(false);
    }
  };

  // 3. Upload de Novas Fotos para o Projeto (POST)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user?.token || !projeto) return;

    try {
      setIsUploadingFiles(true);
      setError(null);

      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("imagens[]", files[i]);
      }

      const res = await fetch(
        `${API_BASE_URL}/api/portifolio/projeto/${projeto.id}/upload`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${user.token}` },
          body: formData,
        },
      );

      if (!res.ok) throw new Error("Erro ao carregar as imagens selecionadas.");

      const data = await res.json();
      if (data.success && data.imagens) {
        setProjeto((prev) =>
          prev
            ? {
                ...prev,
                fotos: [...prev.fotos, ...data.imagens].sort(
                  (a, b) => a.posicao - b.posicao,
                ),
              }
            : null,
        );
      }
    } catch (err: any) {
      setError(err.message || "Falha no envio do arquivo.");
    } finally {
      setIsUploadingFiles(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // 4. Exclusão de Foto Individual (DELETE)
  const handleExcluirFoto = async (fotoId: string) => {
    if (!user?.token || !projeto) return;
    if (
      !confirm(
        "Tem certeza que deseja remover permanentemente esta foto da galeria?",
      )
    )
      return;

    try {
      setError(null);
      const res = await fetch(
        `${API_BASE_URL}/api/portifolio/projeto/foto/${fotoId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${user.token}` },
        },
      );

      if (!res.ok)
        throw new Error("Não foi possível excluir o arquivo no servidor.");

      // Remove a foto do estado local
      setProjeto((prev) =>
        prev
          ? {
              ...prev,
              fotos: prev.fotos.filter((f) => f.id !== fotoId),
            }
          : null,
      );
    } catch (err: any) {
      setError(err.message || "Erro ao remover imagem.");
    }
  };

  const formatCurrency = (value: string) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(parseFloat(value));

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-green-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
            Carregando detalhes do projeto...
          </p>
        </div>
      </div>
    );
  }

  if (error && !projeto) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white border rounded-2xl p-6 max-w-md text-center shadow-sm space-y-4">
          <p className="text-red-500 font-black text-xs uppercase tracking-widest">
            Erro de Acesso
          </p>
          <p className="text-xs text-gray-600">{error}</p>
          <Link
            href="/affiliate/portifolio"
            className="block text-xs font-bold text-green-600 uppercase tracking-wider underline"
          >
            Voltar ao Portfólio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 text-slate-800 selection:bg-green-500 selection:text-white">
      <div className="max-w-5xl mx-auto px-4 space-y-6">
        {/* Header Superior */}
        <div className="flex items-center justify-between">
          <Link
            href="/affiliate/portifolio"
            className="flex items-center gap-2 text-gray-500 hover:text-green-600 font-bold transition-colors text-xs uppercase tracking-widest"
          >
            <ArrowLeft size={16} /> Voltar à lista
          </Link>
          <span className="text-[10px] bg-purple-100 text-purple-700 font-black px-3 py-1 rounded-full uppercase tracking-wider">
            Modo Edição Avançado
          </span>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {projeto && (
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
            {/* Coluna Esquerda: Exibição ou Formulário de Edição */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-6">
              {!isEditing ? (
                // MODO VISUALIZAÇÃO
                <div className="space-y-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono bg-gray-100 text-gray-500 px-2 py-0.5 rounded border">
                        Posição #{projeto.posicao}
                      </span>
                      <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                        {projeto.titulo}
                      </h1>
                      <p className="text-xs text-gray-400 font-semibold flex items-center gap-1">
                        <MapPin size={12} /> {projeto.regiao}
                      </p>
                    </div>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-green-600 text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl hover:bg-green-700 transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Pencil size={12} /> Editar
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                      Descrição do Escopo
                    </h3>
                    <p className="text-xs text-gray-600 font-medium leading-relaxed whitespace-pre-line">
                      {projeto.descricao}
                    </p>
                  </div>

                  {/* Informações Financeiras e de Datas com badges de status de visibilidade */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] font-black text-gray-400 uppercase block">
                          Valor Declarado
                        </span>
                        <p className="text-base font-black text-slate-900">
                          {formatCurrency(projeto.valor)}
                        </p>
                      </div>
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-1 rounded flex items-center gap-1 border ${projeto.exibirValor ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}
                      >
                        {projeto.exibirValor ? (
                          <Eye size={10} />
                        ) : (
                          <EyeOff size={10} />
                        )}
                        {projeto.exibirValor ? "Público" : "Oculto"}
                      </span>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] font-black text-gray-400 uppercase block">
                          Conclusão Técnica
                        </span>
                        <p className="text-sm font-black text-slate-900">
                          {formatDate(projeto.concluidoEm)}
                        </p>
                      </div>
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-1 rounded flex items-center gap-1 border ${projeto.exibirConcluidoEm ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}
                      >
                        {projeto.exibirConcluidoEm ? (
                          <Eye size={10} />
                        ) : (
                          <EyeOff size={10} />
                        )}
                        {projeto.exibirConcluidoEm ? "Público" : "Oculto"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                // MODO EDIÇÃO ATIVA
                <form onSubmit={handleUpdateTexts} className="space-y-5">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <h2 className="text-sm font-black uppercase tracking-wider text-gray-900">
                      Alterar Informações
                    </h2>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="text-xs font-bold text-gray-400 hover:text-red-500 uppercase tracking-wider transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1">
                      Título do Caso
                    </label>
                    <input
                      type="text"
                      required
                      value={editTitulo}
                      onChange={(e) => setEditTitulo(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl font-medium text-xs focus:outline-none focus:border-green-600 text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1">
                      Descrição
                    </label>
                    <textarea
                      required
                      rows={5}
                      maxLength={4000}
                      value={editDescricao}
                      onChange={(e) => setEditDescricao(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl font-medium text-xs focus:outline-none focus:border-green-600 text-gray-900 resize-none"
                    />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl space-y-3 border border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                      Privacidade
                    </p>
                    <label className="flex items-center justify-between cursor-pointer py-0.5">
                      <span className="text-xs font-bold text-gray-700">
                        Exibir preço do serviço publicamente
                      </span>
                      <input
                        type="checkbox"
                        checked={editExibirValor}
                        onChange={(e) => setEditExibirValor(e.target.checked)}
                        className="w-4 h-4 rounded text-green-600 focus:ring-green-500 border-gray-300"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer py-0.5">
                      <span className="text-xs font-bold text-gray-700">
                        Exibir data de conclusão
                      </span>
                      <input
                        type="checkbox"
                        checked={editExibirConcluidoEm}
                        onChange={(e) =>
                          setEditExibirConcluidoEm(e.target.checked)
                        }
                        className="w-4 h-4 rounded text-green-600 focus:ring-green-500 border-gray-300"
                      />
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingTexts}
                    className="w-full bg-green-600 text-white font-black text-xs uppercase tracking-widest py-3.5 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 p-4"
                  >
                    {isSavingTexts ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Salvar Modificações"
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Coluna Direita: Gerenciador de Galeria de Fotos */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-6">
              <div>
                <h2 className="text-sm font-black uppercase text-gray-900 tracking-wider">
                  Mídias do Caso de Sucesso
                </h2>
                <p className="text-xs text-gray-400">
                  Suba arquivos de imagem adicionais ou descarte mídias
                  enviadas.
                </p>
              </div>

              {/* Input Invisível para Upload */}
              <div
                onClick={() =>
                  !isUploadingFiles && fileInputRef.current?.click()
                }
                className={`border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center transition-all ${isUploadingFiles ? "opacity-50 cursor-not-allowed" : "hover:border-green-600 hover:bg-green-50/5 cursor-pointer"}`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isUploadingFiles}
                />
                {isUploadingFiles ? (
                  <div className="space-y-1">
                    <Loader2 className="w-6 h-6 animate-spin text-green-600 mx-auto" />
                    <p className="text-[10px] font-black text-green-600 uppercase">
                      Processando S3...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <UploadCloud className="w-8 h-8 text-gray-300 mx-auto" />
                    <p className="text-xs font-black text-gray-700 uppercase">
                      Fazer Upload de Fotos
                    </p>
                    <p className="text-[9px] text-gray-400">
                      Envio automático incremental em lote
                    </p>
                  </div>
                )}
              </div>

              {/* Lista Física de Imagens */}
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                  Fotos Atuais ({projeto.fotos?.length || 0})
                </p>

                {projeto.fotos?.length === 0 ? (
                  <p className="text-xs text-gray-400 italic text-center py-4 bg-gray-50 rounded-xl border border-dashed">
                    Nenhuma foto adicionada para este projeto.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {projeto.fotos.map((foto) => (
                      <div
                        key={foto.id}
                        className="relative aspect-square border rounded-xl overflow-hidden group bg-gray-50"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={foto.url}
                          alt="Foto do projeto"
                          className="w-full h-full object-cover"
                        />

                        {/* Botão Flutuante de Exclusão Física */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => handleExcluirFoto(foto.id)}
                            className="bg-red-600 text-white p-2 rounded-xl hover:bg-red-700 transition-colors shadow"
                            title="Excluir imagem do S3"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white font-mono text-[8px] px-1.5 py-0.2 rounded">
                          Pos. {foto.posicao}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

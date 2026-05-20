"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ImageIcon,
  DollarSign,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface FotoProjeto {
  id: string;
  url: string;
  posicao: number;
}

export interface ProjetoPortfolioData {
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

interface PortfolioCardProps {
  projeto: ProjetoPortfolioData;
  basePath: string;
}

export function PortfolioCard({ projeto, basePath }: PortfolioCardProps) {
  // Ordena as fotos pela propriedade posicao para garantir a ordem correta
  const fotosOrdenadas =
    projeto.fotos?.sort((a, b) => a.posicao - b.posicao) || [];

  // Estado para controlar o índice da foto ativa no card
  const [currentFotoIndex, setCurrentFotoIndex] = useState(0);

  const temFotos = fotosOrdenadas.length > 0;
  const fotoAtual = fotosOrdenadas[currentFotoIndex];

  // Navegar para a foto anterior
  const handlePrevFoto = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Evita que o <Link> seja acionado
    setCurrentFotoIndex((prevIndex) =>
      prevIndex === 0 ? fotosOrdenadas.length - 1 : prevIndex - 1,
    );
  };

  // Navegar para a próxima foto
  const handleNextFoto = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Evita que o <Link> seja acionado
    setCurrentFotoIndex((prevIndex) =>
      prevIndex === fotosOrdenadas.length - 1 ? 0 : prevIndex + 1,
    );
  };

  const formatCurrency = (value: string) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(parseFloat(value));

  return (
    <Link
      href={`${basePath}/portifolio/${projeto.id}`}
      className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md hover:border-green-600/30 transition-all flex flex-col h-full"
    >
      {/* Container da Imagem Principal / Carrossel */}
      <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden w-full border-b border-gray-100 shrink-0">
        {temFotos ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fotoAtual.url}
              alt={`${projeto.titulo} - Foto ${currentFotoIndex + 1}`}
              className="w-full h-full object-cover transition-transform duration-300"
            />

            {/* Setas de navegação nas laterais - Só aparecem se houver mais de uma foto */}
            {fotosOrdenadas.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevFoto}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm text-gray-800 p-1.5 rounded-full shadow hover:bg-white hover:text-green-600 transition-all opacity-0 group-hover:opacity-100 z-10"
                  title="Foto anterior"
                >
                  <ChevronLeft size={16} strokeWidth={2.5} />
                </button>

                <button
                  type="button"
                  onClick={handleNextFoto}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm text-gray-800 p-1.5 rounded-full shadow hover:bg-white hover:text-green-600 transition-all opacity-0 group-hover:opacity-100 z-10"
                  title="Próxima foto"
                >
                  <ChevronRight size={16} strokeWidth={2.5} />
                </button>

                {/* Indicador numérico ou de bolinhas discretas no rodapé da imagem */}
                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[9px] font-mono px-1.5 py-0.5 rounded-md backdrop-blur-[1px]">
                  {currentFotoIndex + 1} / {fotosOrdenadas.length}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-1.5 p-4 bg-gray-50">
            <ImageIcon size={28} className="text-gray-300" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Sem mídias anexadas
            </span>
          </div>
        )}

        {/* Badge de Preço Flutuante */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[calc(100%-24px)] z-10">
          {projeto.exibirValor && (
            <span className="bg-black/70 backdrop-blur-[2px] text-white font-mono font-black text-[10px] px-2 py-0.5 rounded-lg flex items-center gap-0.5 shadow-sm">
              <DollarSign size={10} />
              {formatCurrency(projeto.valor).replace("R$", "")}
            </span>
          )}
        </div>
      </div>

      {/* Conteúdo de Texto e Metadados */}
      <div className="p-4 flex flex-col justify-between flex-1 space-y-3">
        <div className="space-y-1">
          <h3 className="text-sm font-black text-gray-900 group-hover:text-green-600 transition-colors uppercase tracking-tight line-clamp-2">
            {projeto.titulo}
          </h3>
          <p className="text-xs text-gray-500 line-clamp-2 font-medium">
            {projeto.descricao}
          </p>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-400 pt-1 border-t border-gray-50">
          <MapPin size={12} className="text-gray-300 shrink-0" />
          <span className="truncate">{projeto.regiao}</span>
        </div>
      </div>
    </Link>
  );
}

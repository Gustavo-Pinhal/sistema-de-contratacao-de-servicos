import { useState, useEffect } from "react";

export interface ChatMessage {
  id: string;
  enviadoPor: string;
  tipo: "texto" | "arquivo";
  texto: string | null;
  arquivo: { id: string; mime_type: string } | null;
  enviadoEm: string;
  isMe?: boolean;
}

interface CachedImageProps {
  serviceId: string;
  messageId: string;
  token: string;
}

export default function CachedImage({
  serviceId,
  messageId,
  token,
}: CachedImageProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let objectUrl: string | null = null;

    const loadImage = async () => {
      try {
        const cache = await caches.open("chat-media-cache");
        const cacheKey = `/api/media/${messageId}`;
        const cachedResponse = await cache.match(cacheKey);

        if (cachedResponse) {
          const blob = await cachedResponse.blob();
          objectUrl = URL.createObjectURL(blob);
          setImgSrc(objectUrl);
          setLoading(false);
          return;
        }

        // 1. Busca a Presigned URL
        const presignedRes = await fetch(
          `https://localhost/api/servico/${serviceId}/chat/${messageId}/download`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const { url } = await presignedRes.json();

        // 2. Faz o download do Blob
        const imageRes = await fetch(url);
        const blob = await imageRes.blob();

        // 3. Salva no Cache API do navegador
        await cache.put(cacheKey, new Response(blob));

        objectUrl = URL.createObjectURL(blob);
        setImgSrc(objectUrl);
      } catch (error) {
        console.error("Erro ao carregar imagem:", error);
      } finally {
        setLoading(false);
      }
    };

    loadImage();

    // Limpeza de memória
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [serviceId, messageId, token]);

  if (loading)
    return (
      <div className="w-48 h-48 bg-slate-200 animate-pulse rounded-xl flex items-center justify-center text-slate-400 text-sm">
        Carregando...
      </div>
    );
  if (!imgSrc)
    return <div className="text-red-500 text-sm">Falha ao carregar imagem</div>;

  return (
    <img
      src={imgSrc}
      alt="Anexo do chat"
      className="max-w-[250px] rounded-xl border border-slate-200"
    />
  );
}

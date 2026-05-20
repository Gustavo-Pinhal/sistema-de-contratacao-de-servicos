import { useState, useEffect } from "react";

export interface ChatMessage {
  id: string;
  enviadoPor: string;
  tipo: "texto" | "arquivo" | "foto";
  texto: string | null;
  arquivo: { id: string; mime_type?: string; mimeType?: string } | null;
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
    let isMounted = true;
    let objectUrl: string | null = null;

    const loadImage = async () => {
      try {
        const cache = await caches.open("chat-media-cache");
        const cacheKey = `/api/media/${messageId}`;
        const cachedResponse = await cache.match(cacheKey);

        // Se já estiver no cache local do navegador
        if (cachedResponse) {
          const blob = await cachedResponse.blob();
          if (isMounted) {
            objectUrl = URL.createObjectURL(blob);
            setImgSrc(objectUrl);
            setLoading(false);
          }
          return;
        }

        // 1. Busca a Presigned URL gerada sob demanda
        const presignedRes = await fetch(
          `https://localhost/api/servico/${serviceId}/chat/${messageId}/download`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (!presignedRes.ok) throw new Error("Erro ao obter URL assinada");
        const { url } = await presignedRes.json();

        if (!isMounted) return;

        try {
          // 2. Tenta baixar o Blob para guardar no cache
          const imageRes = await fetch(url);
          if (!imageRes.ok) throw new Error("Erro no download do arquivo");
          const blob = await imageRes.blob();

          // 3. Salva no Cache API
          await cache.put(cacheKey, new Response(blob));

          if (isMounted) {
            objectUrl = URL.createObjectURL(blob);
            setImgSrc(objectUrl);
          }
        } catch (corsError) {
          // 💡 FALLBACK SE HOUVER ERRO DE CORS NO STORAGE:
          // Se o fetch do blob falhar por regras de CORS do S3/SeaweedFS,
          // injetamos a URL diretamente no src, ignorando o cache para salvar a renderização.
          console.warn(
            "Falha de CORS/Rede ao processar blob. Usando URL assinada diretamente:",
            corsError,
          );
          if (isMounted) {
            setImgSrc(url);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar imagem:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadImage();

    return () => {
      isMounted = false;
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
      className="max-w-[250px] max-h-[300px] rounded-xl border border-slate-200 object-cover"
      onError={() =>
        console.error("Erro na renderização do elemento IMG src:", imgSrc)
      }
    />
  );
}

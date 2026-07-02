import { put, del } from "@vercel/blob";
import { randomUUID } from "crypto";

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/**
 * Envia o arquivo de imagem para o Vercel Blob e retorna a URL pública
 * (https://xxxx.public.blob.vercel-storage.com/products/...) para gravar no banco.
 */
export async function saveProductImage(file: File): Promise<string> {
  const extension = EXTENSION_BY_MIME[file.type] ?? "jpg";
  const filename = `products/${randomUUID()}.${extension}`;

  const blob = await put(filename, file, {
    access: "public",
    contentType: file.type,
  });

  return blob.url;
}

/**
 * Remove uma imagem antiga do Blob. Ignora silenciosamente URLs que não
 * são do Blob (ex: produtos antigos com link externo) ou já removidas.
 */
export async function deleteProductImage(imageUrl: string): Promise<void> {
  if (!imageUrl.includes(".blob.vercel-storage.com")) return;

  try {
    await del(imageUrl);
  } catch {
    // já não existe — tudo bem
  }
}
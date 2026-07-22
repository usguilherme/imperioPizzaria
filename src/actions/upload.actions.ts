"use server";

import { saveProductImage } from "@/lib/upload-image";

export async function uploadProductImageAction(formData: FormData) {
  try {
    const file = formData.get("file") as File | null;

    if (!file || file.size === 0) {
      return { success: false, error: "Nenhum arquivo enviado" };
    }

    const url = await saveProductImage(file);
    return { success: true, url };
  } catch (error) {
    console.error("Erro ao subir imagem:", error);
    return { success: false, error: "Falha ao enviar imagem" };
  }
}
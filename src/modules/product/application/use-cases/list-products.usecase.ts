import { productRepository } from "../../infrastructure/product.repository";
import { ProductListItemDTO } from "../../domain/dtos/product.dto";

export async function listProductsUseCase(): Promise<ProductListItemDTO[]> {
  const products = await productRepository.findAll();

  return products.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    imageUrl: p.imageUrl,
    type: p.type,
    servesInfo: p.servesInfo,
    originalPrice: Number(p.originalPrice),
    promoPrice: p.promoPrice != null ? Number(p.promoPrice) : null,
    isPromoActive: p.isPromoActive,
    isAvailable: p.isAvailable,
    categoryName: p.category.name,
  }));
}

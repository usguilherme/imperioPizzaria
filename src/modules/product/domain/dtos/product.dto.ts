export interface CreateProductDTO {
  title: string;
  description: string;
  imageUrl: string;
  type: "SIMPLE" | "PIZZA";
  servesInfo?: string | null;
  originalPrice: number;
  promoPrice?: number | null;
  isPromoActive: boolean;
  isFlavorEligible: boolean;
  categoryId: string;
}

export type UpdateProductDTO = Partial<CreateProductDTO>;

export interface ProductListItemDTO {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  type: "SIMPLE" | "PIZZA";
  servesInfo: string | null;
  originalPrice: number;
  promoPrice: number | null;
  isPromoActive: boolean;
  isAvailable: boolean;
  categoryName: string;
}

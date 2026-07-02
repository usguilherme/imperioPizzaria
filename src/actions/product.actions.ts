"use server";

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// Evita instâncias múltiplas do Prisma em desenvolvimento
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// ============================================================================
// PRODUTOS
// ============================================================================

export async function getProductsAction() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        flavors: true,
      }
    });

    return products.map(product => ({
      id: product.id,
      nome: product.name,
      descricao: product.description,
      preco: Number(product.price), 
      imagemUrl: product.imageUrl,
      sabores: product.flavors.map(flavor => flavor.name)
    }));
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    return [];
  }
}

export async function getCategoriesAction() {
  try {
    return await prisma.category.findMany();
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    return [];
  }
}

export async function getProductByIdAction(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) return null;

    return {
      id: product.id,
      nome: product.name,
      descricao: product.description,
      preco: Number(product.price),
      categoryId: product.categoryId,
      imagemUrl: product.imageUrl,
    };
  } catch (error) {
    console.error("Erro ao buscar produto por ID:", error);
    return null;
  }
}

export async function createProductAction(formData: FormData) {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const price = parseFloat(formData.get('price') as string);
  const categoryId = formData.get('categoryId') as string;

  try {
    await prisma.product.create({
      data: {
        name,
        description,
        price,
        categoryId,
      }
    });
  } catch (error) {
    console.error("Erro ao criar produto:", error);
  }

  revalidatePath('/admin/produtos');
  revalidatePath('/');
  redirect('/admin/produtos');
}

export async function updateProductAction(formData: FormData) {
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const price = parseFloat(formData.get('price') as string);
  const categoryId = formData.get('categoryId') as string;

  try {
    await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price,
        categoryId,
      }
    });
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
  }

  revalidatePath('/admin/produtos');
  revalidatePath('/');
  redirect('/admin/produtos');
}

export async function deleteProductAction(formData: FormData) {
  const id = formData.get('id') as string;

  try {
    await prisma.product.delete({
      where: { id }
    });
  } catch (error) {
    console.error("Erro ao deletar produto:", error);
  }

  revalidatePath('/admin/produtos');
  revalidatePath('/');
}

// ============================================================================
// PEDIDOS (COZINHA E GERÊNCIA)
// ============================================================================

/**
 * Atualiza o status do pedido na cozinha (PENDENTE -> PREPARANDO -> PRONTO)
 */
export async function updateOrderStatusAction(id: string, nextStatus: string) {
  try {
    await prisma.order.update({
      where: { id },
      data: {
        status: nextStatus,
      },
    });

    revalidatePath('/admin/cozinha');
    revalidatePath('/admin/pedidos');
    
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar status do pedido no banco:", error);
    return { success: false, error: "Erro ao atualizar no banco de dados." };
  }
}

/**
 * Busca todos os pedidos ativos (Pendente, Preparando, Pronto) para o Kanban
 */
export async function getCozinhaPedidosAction() {
  try {
    const pedidos = await prisma.order.findMany({
      where: {
        status: {
          in: ['PENDENTE', 'PREPARANDO', 'PRONTO']
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return pedidos;
  } catch (error) {
    console.error("Erro ao buscar pedidos da cozinha:", error);
    return [];
  }
}

/**
 * Busca todos os pedidos cadastrados para a listagem geral da gerência
 */
export async function getPedidosGeraisAction() {
  try {
    const pedidos = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return pedidos.map(p => ({
      id: p.id,
      // Se você tiver relações ou nomes diferentes, substitua aqui. 
      // Por enquanto, usaremos strings fixas para parar o erro.
      cliente: 'Cliente Anônimo', 
      telefone: '',
      status: p.status,
      // Caso não tenha uma coluna de preço total, deixamos 0 por padrão
      total: 0, 
      createdAt: p.createdAt,
      items: p.items.map(item => ({
        id: item.id,
        quantidade: item.quantity,
        produtoNome: item.product.name
      }))
    }));
  } catch (error) {
    console.error("Erro ao buscar pedidos gerais:", error);
    return [];
  }
}
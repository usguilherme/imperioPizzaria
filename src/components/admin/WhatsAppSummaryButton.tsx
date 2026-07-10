"use client";

import { MessageCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface DashboardStats {
  pedidosHoje: number;
  faturamentoHoje: number;
  pedidosEmAberto: number;
  produtosCadastrados: number;
  faturamentoMes: number;
  pedidosMes: number;
}

interface WhatsAppSummaryButtonProps {
  stats: DashboardStats;
  telefoneLoja: string; // Ex: "5583999999999"
}

export function WhatsAppSummaryButton({ stats, telefoneLoja }: WhatsAppSummaryButtonProps) {
  const handleSendReport = () => {
    // Monta o texto formatado para o WhatsApp
    const texto = `📊 *Resumo do Sistema - Império Burguer* 🍔\n\n` +
      `📅 *Data:* ${new Date().toLocaleDateString('pt-BR')}\n\n` +
      `📈 *Desempenho de Hoje:*\n` +
      `• Pedidos: ${stats.pedidosHoje}\n` +
      `• Faturamento: ${formatCurrency(stats.faturamentoHoje)}\n\n` +
      `📅 *Desempenho do Mês:*\n` +
      `• Total de Pedidos: ${stats.pedidosMes}\n` +
      `• Faturamento Total: ${formatCurrency(stats.faturamentoMes)}\n\n` +
      `⏳ *Operação Atual:*\n` +
      `• Pedidos em aberto: ${stats.pedidosEmAberto}\n` +
      `• Produtos ativos: ${stats.produtosCadastrados}\n\n` +
      `_Relatório gerado automaticamente pelo painel._`;

    // Codifica para URL e abre o chat
    const url = `https://wa.me/${telefoneLoja}?text=${encodeURIComponent(texto)}`;
    window.open(url, "_blank");
  };

  return (
    <button
      onClick={handleSendReport}
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all duration-300 hover:scale-110 hover:bg-[#20bd5a] hover:shadow-glow-primary active:scale-95"
      title="Enviar resumo para o WhatsApp"
    >
      <MessageCircle size={28} />
    </button>
  );
}
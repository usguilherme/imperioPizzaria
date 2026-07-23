"use client";

import Link from "next/link";
import { User, ShoppingCart, Crown, ClipboardList } from "lucide-react"; // 🆕 Trocamos Search por ClipboardList
import { useCartStore } from "@/store/cart.store";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Header() {
  const itemsCount = useCartStore((state) => state.getTotalItems());
  const [categories, setCategories] = useState<{ name: string; slug: string }[]>([]);
  const [mounted, setMounted] = useState(false);
  const [lastOrderCode, setLastOrderCode] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => console.error("Erro ao carregar categorias"));

    const savedCode = localStorage.getItem("ultimoPedido");
    if (savedCode) {
      setLastOrderCode(savedCode);
    }
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-2 sm:gap-6 px-3 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Crown className="text-accent" size={28} />
          <div className="font-display text-xl font-bold text-foreground hidden sm:block">
            Império
          </div>
        </Link>

        {/* Categorias (Escondidas no mobile para dar espaço) */}
        <nav className="hidden lg:flex items-center gap-4 overflow-x-auto max-w-[600px] scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/#${cat.slug}`}
              className="text-[13px] font-medium text-foreground-muted transition-all duration-300 hover:text-primary whitespace-nowrap px-2.5 py-1 rounded-full hover:bg-primary/10"
            >
              {cat.name}
            </Link>
          ))}
        </nav>

        {/* Ações / Botões Direitos */}
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          
          {/* Lógica do Acompanhar Pedido */}
          {mounted && lastOrderCode ? (
            <Link
              href={`/pedido/${lastOrderCode}`}
              className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-[11px] sm:text-xs font-bold text-primary transition-colors hover:bg-primary/20 border border-primary/20"
            >
              {/* Bolinha vermelha piscando */}
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="hidden sm:inline">Ver Pedido</span>
              <span className="sm:hidden">Pedido</span>
            </Link>
          ) : (
            <Link 
              href="/acompanhar" 
              className="flex items-center justify-center h-[38px] px-2.5 sm:px-3 rounded-lg border border-border bg-background hover:bg-accent/10 text-foreground-muted hover:text-foreground transition-colors"
              aria-label="Rastrear Pedido"
            >
              {/* 🆕 Ícone de prancheta de pedido + Texto visível no celular */}
              <ClipboardList size={18} />
              <span className="ml-1.5 text-[11px] sm:text-sm font-medium">Rastrear</span>
            </Link>
          )}

          {/* Botão de alternar tema */}
          <ThemeToggle />

          <Link href="/admin/login" className="hidden sm:flex items-center justify-center h-[38px] px-2.5 rounded-lg text-foreground-muted transition-colors hover:text-foreground">
            <User size={18} />
          </Link>

          <Link href="/carrinho" className="relative flex items-center gap-1.5 rounded-lg bg-primary h-[38px] px-3 sm:px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-hover">
            <ShoppingCart size={18} />
            <span className="hidden sm:inline">Carrinho</span>
            {mounted && itemsCount > 0 && (
              <div className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-white shadow-sm border-2 border-background">
                {itemsCount}
              </div>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
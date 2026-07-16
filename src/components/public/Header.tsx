"use client";

import Link from "next/link";
import { User, ShoppingCart, Crown } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Header() {
  const itemsCount = useCartStore((state) => state.getTotalItems());
  const [categories, setCategories] = useState<{ name: string; slug: string }[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => console.error("Erro ao carregar categorias"));
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Crown className="text-accent" size={28} />
          <div className="font-display text-xl font-bold text-foreground">
            Império
          </div>
        </Link>

        {/* Categorias */}
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

        {/* Ações */}
        <div className="ml-auto flex items-center gap-3">
          {/* 🆕 Botão de alternar tema claro/escuro */}
          <ThemeToggle />

          <Link href="/admin/login" className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-foreground-muted transition-colors hover:text-foreground">
            <User size={18} />
            <div className="hidden sm:inline">Entrar</div>
          </Link>

          <Link href="/carrinho" className="relative flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover">
            <ShoppingCart size={18} />
            <div className="hidden sm:inline">Carrinho</div>
            {mounted && itemsCount > 0 && (
              <div className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-white">
                {itemsCount}
              </div>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
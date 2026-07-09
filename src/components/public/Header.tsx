"use client";

import Link from "next/link";
import { Search, User, ShoppingCart, Crown } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { useEffect, useState } from "react";

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

        {/* Busca */}
        <div className="relative hidden flex-1 max-w-md md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-subtle" size={18} />
          <input
            type="search"
            placeholder="Buscar pizza, burger, combo..."
            className="w-full rounded-full border border-border bg-background-surface py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-subtle focus:border-primary focus:outline-none"
          />
        </div>

        {/* Categorias */}
        <nav className="hidden lg:flex items-center gap-4 overflow-x-auto max-w-[500px] scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
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
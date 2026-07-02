"use client";

import Link from "next/link";
import { Search, User, ShoppingCart, Crown } from "lucide-react";
import { useCartStore } from "@/store/cart.store";

const CATEGORIES = [
  { label: "Combos", href: "/#combos" },
  { label: "Pizzas", href: "/#pizzas" },
  { label: "Hambúrgueres", href: "/#hamburgueres" },
  { label: "Bebidas", href: "/#bebidas" },
];

export function Header() {
  const itemsCount = useCartStore((state) => state.items.length);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Crown className="text-accent" size={28} />
          <span className="font-display text-xl font-bold text-foreground">
            Império
          </span>
        </Link>

        {/* Busca */}
        <div className="relative hidden flex-1 max-w-md md:block">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-subtle"
            size={18}
          />
          <input
            type="search"
            placeholder="Buscar pizza, burger, combo..."
            className="w-full rounded-full border border-border bg-background-surface py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-subtle focus:border-primary focus:outline-none"
          />
        </div>

        {/* Categorias */}
        <nav className="hidden lg:flex items-center gap-5">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className="text-sm font-medium text-foreground-muted transition-colors hover:text-accent"
            >
              {cat.label}
            </Link>
          ))}
        </nav>

        {/* Ações */}
        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/admin/login"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-foreground-muted transition-colors hover:text-foreground"
          >
            <User size={18} />
            <span className="hidden sm:inline">Entrar</span>
          </Link>

          <Link
            href="/carrinho"
            className="relative flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            <ShoppingCart size={18} />
            <span className="hidden sm:inline">Carrinho</span>
            {itemsCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-white">
                {itemsCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}

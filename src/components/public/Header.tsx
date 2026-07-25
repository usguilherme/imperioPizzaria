"use client";

import Link from "next/link";
import {
  User,
  ShoppingCart,
  Crown,
  ClipboardList,
  Search,
  X,
  ChevronRight,
  Pizza,
  Beef,
  CupSoda,
  Sandwich,
  Flame,
  Cookie,
  UtensilsCrossed,
  LucideIcon,
} from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

/** Escolhe um ícone representativo pra categoria com base no nome (fallback: talher genérico). */
function getCategoryIcon(name: string): LucideIcon {
  const n = name.toLowerCase();
  if (n.includes("pizza")) return Pizza;
  if (n.includes("hambur") || n.includes("burger")) return Beef;
  if (n.includes("bebid") || n.includes("suco") || n.includes("refri")) return CupSoda;
  if (n.includes("baguet")) return Sandwich;
  if (n.includes("petisc") || n.includes("porç") || n.includes("frit")) return Flame;
  if (n.includes("pastel") || n.includes("pastéis") || n.includes("doce") || n.includes("sobremesa")) return Cookie;
  return UtensilsCrossed;
}

export function Header() {
  const itemsCount = useCartStore((state) => state.getTotalItems());
  const [categories, setCategories] = useState<{ name: string; slug: string }[]>([]);
  const [mounted, setMounted] = useState(false);
  const [lastOrderCode, setLastOrderCode] = useState<string | null>(null);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");

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

  // Trava o scroll da página enquanto o menu de categorias está aberto
  useEffect(() => {
    document.body.style.overflow = isCategoryMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCategoryMenuOpen]);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(categorySearch.trim().toLowerCase())
  );

  const closeCategoryMenu = () => {
    setIsCategoryMenuOpen(false);
    setCategorySearch("");
  };

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

          {/* Botão de busca de categorias (foco mobile, já que a nav acima some abaixo de lg) */}
          <button
            type="button"
            onClick={() => setIsCategoryMenuOpen(true)}
            className="flex lg:hidden items-center justify-center h-[38px] w-[38px] rounded-lg border border-border bg-background hover:bg-accent/10 text-foreground-muted hover:text-foreground transition-colors"
            aria-label="Buscar categorias"
          >
            <Search size={18} />
          </button>

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

      {/* Menu de categorias (bottom sheet) */}
      {isCategoryMenuOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm lg:items-center lg:p-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeCategoryMenu(); }}
        >
          <div className="w-full lg:max-w-lg bg-background-surface rounded-t-3xl lg:rounded-3xl flex flex-col max-h-[85vh] shadow-2xl overflow-hidden">
            {/* Alça de arrastar (só decorativa, indica "arraste pra fechar" no celular) */}
            <div className="flex justify-center pt-3 pb-1 lg:hidden">
              <div className="h-1.5 w-12 rounded-full bg-border" />
            </div>

            <div className="px-5 pt-2 pb-4 border-b border-border">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">Cardápio</h2>
                  <p className="text-xs text-foreground-muted mt-0.5">O que você tá com vontade de comer hoje?</p>
                </div>
                <button
                  onClick={closeCategoryMenu}
                  className="p-2 -mr-2 rounded-full text-foreground-muted hover:text-foreground hover:bg-accent/10 transition-colors shrink-0"
                  aria-label="Fechar"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-muted" />
                <input
                  type="text"
                  autoFocus
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  placeholder="Buscar categoria (ex: Pizza, Bebidas...)"
                  className="w-full rounded-xl border border-border bg-background pl-10 pr-9 py-3 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-shadow"
                />
                {categorySearch && (
                  <button
                    onClick={() => setCategorySearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground"
                    aria-label="Limpar busca"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-y-auto px-4 py-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {filteredCategories.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                  <Search size={28} className="text-foreground-muted" />
                  <p className="text-sm text-foreground-muted">
                    Nenhuma categoria encontrada para &quot;{categorySearch}&quot;
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {filteredCategories.map((cat) => {
                    const Icon = getCategoryIcon(cat.name);
                    return (
                      <Link
                        key={cat.slug}
                        href={`/#${cat.slug}`}
                        onClick={closeCategoryMenu}
                        className="group flex flex-col gap-2.5 rounded-2xl border border-border bg-background p-4 text-left transition-all hover:border-primary/40 hover:bg-primary/5 active:scale-[0.97]"
                      >
                        <div className="flex items-center justify-between">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Icon size={20} />
                          </span>
                          <ChevronRight size={16} className="text-foreground-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                        </div>
                        <span className="text-sm font-semibold text-foreground leading-tight">
                          {cat.name}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Espaço extra pra não ficar colado na barra de gestos do celular */}
            <div className="pb-[env(safe-area-inset-bottom)] lg:hidden" />
          </div>
        </div>
      )}
    </header>
  );
}
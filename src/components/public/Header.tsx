"use client";

import Link from "next/link";
import { User, ShoppingCart, Crown, ClipboardList, Search, X, ChevronRight } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

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
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm lg:items-center"
          onClick={(e) => { if (e.target === e.currentTarget) closeCategoryMenu(); }}
        >
          <div className="w-full lg:max-w-md bg-background-surface rounded-t-2xl lg:rounded-2xl flex flex-col max-h-[75vh]">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-foreground">Categorias</h2>
              <button
                onClick={closeCategoryMenu}
                className="p-2 text-foreground-muted hover:text-foreground"
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />
                <input
                  type="text"
                  autoFocus
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  placeholder="Buscar categoria..."
                  className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="overflow-y-auto p-2">
              {filteredCategories.length === 0 ? (
                <p className="text-center text-sm text-foreground-muted py-6">
                  Nenhuma categoria encontrada.
                </p>
              ) : (
                filteredCategories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/#${cat.slug}`}
                    onClick={closeCategoryMenu}
                    className="flex items-center justify-between px-3 py-3 rounded-xl text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <span className="text-sm font-medium">{cat.name}</span>
                    <ChevronRight size={16} className="text-foreground-muted" />
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  Printer,
  LogOut,
  Crown,
  LayoutGrid,
  Scale, // Ícone para tamanhos
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/produtos", label: "Cardápio", icon: UtensilsCrossed },
  { href: "/admin/categorias", label: "Categorias", icon: LayoutGrid },
  { href: "/admin/tamanhos", label: "Tamanhos", icon: Scale }, // Nova rota adicionada
  { href: "/admin/pedidos", label: "Pedidos", icon: ClipboardList },
  { href: "/admin/cozinha", label: "Cozinha", icon: Printer },
];

interface SidebarProps {
  userName: string;
  role: string;
}

export function Sidebar({ userName, role }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-background-surface">
      <div className="flex items-center gap-2 border-b border-border p-5">
        <Crown className="text-accent" size={24} />
        <div>
          <p className="font-display text-base font-bold text-foreground">Império</p>
          <p className="text-xs text-foreground-subtle">Painel Administrativo</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/15 text-primary"
                  : "text-foreground-muted hover:bg-background-elevated hover:text-foreground"
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <p className="text-sm font-medium text-foreground">{userName}</p>
        <p className="mb-3 text-xs text-foreground-subtle">{role}</p>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex items-center gap-2 text-sm text-foreground-muted hover:text-primary"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </aside>
  );
}
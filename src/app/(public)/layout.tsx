import { Header } from "@/components/public/Header";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border py-8 text-center text-sm text-foreground-subtle">
        © {new Date().getFullYear()} Império - Hambúrgueria e Pizzaria. Todos os direitos reservados.
      </footer>
    </div>
  );
}

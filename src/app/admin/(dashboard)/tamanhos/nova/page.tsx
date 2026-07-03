import { PizzaSizeForm } from "@/components/admin/PizzaSizeForm";

export default function NovoTamanhoPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Novo Tamanho</h1>
        <p className="text-sm text-foreground-subtle">
          Cadastre um novo tamanho de pizza e defina seu preço fixo.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-background-surface p-6">
        <PizzaSizeForm />
      </div>
    </div>
  );
}
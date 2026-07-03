import { CategoryForm } from "@/components/admin/CategoryForm"; 

export default function NovaCategoriaPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Nova Categoria</h1>
        <p className="text-sm text-foreground-subtle">
          Crie uma nova categoria para organizar o seu cardápio.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-background-surface p-6">
        <CategoryForm />
      </div>
    </div>
  );
}
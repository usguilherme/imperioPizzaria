import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function OrderConfirmedPage({
  searchParams,
}: {
  searchParams: { code?: string };
}) {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <CheckCircle2 className="mx-auto mb-4 text-success" size={56} />
      <h1 className="mb-2 font-display text-2xl font-bold text-foreground">
        Pedido recebido!
      </h1>
      {searchParams.code && (
        <p className="mb-6 text-foreground-muted">
          Código do pedido: <span className="font-bold text-accent">{searchParams.code}</span>
        </p>
      )}
      <p className="mb-6 text-sm text-foreground-subtle">
        Acompanhe o preparo, em breve seu pedido sairá para entrega.
      </p>
      <Link href="/" className="text-primary hover:underline">
        Voltar ao cardápio
      </Link>
    </div>
  );
}

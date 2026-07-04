// Dentro do componente KitchenTicket.tsx
export function KitchenTicket({ order }: { order: any }) {
  return (
    <div className="p-4 w-full max-w-sm">
      {/* Cabeçalho que você já tem */}
      <h1 className="font-bold">IMPÉRIO BURGUER</h1>
      <p>Pedido #{order.code}</p>
      <hr />

      {/* Itens para a cozinha */}
      <div className="my-4">
        {order.items.map((item: any, i: number) => (
          <div key={i}>
            <p>{item.quantity}x {item.productTitle}</p>
            {item.flavorOne && <p className="text-xs">Sabor 1: {item.flavorOne}</p>}
            {item.flavorTwo && <p className="text-xs">Sabor 2: {item.flavorTwo}</p>}
            {item.observation && <p className="text-xs italic">Obs: {item.observation}</p>}
          </div>
        ))}
      </div>
      <hr />

      {/* DADOS PARA O ENTREGADOR (A parte que faltava) */}
      <div className="mt-4 text-sm space-y-1">
        <p><strong>Cliente:</strong> {order.customerName}</p>
        <p><strong>Tel:</strong> {order.customerPhone}</p>
        <p><strong>Endereço:</strong> {order.deliveryAddress}</p>
        <p><strong>Pagamento:</strong> {order.paymentMethod}</p>
        {order.notes && <p><strong>Obs Pedido:</strong> {order.notes}</p>}
      </div>

      <div className="mt-4 font-bold text-lg">
        TOTAL: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total)}
      </div>
      
      {/* Botão de impressão */}
      <button onClick={() => window.print()} className="mt-6 w-full bg-red-600 text-white p-2 rounded">
        Imprimir Cupom
      </button>
    </div>
  );
}
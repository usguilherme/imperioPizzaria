"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Trash2, Edit2, X, Check } from "lucide-react";
import { deleteCrustAction, updateCrustAction } from "@/actions/crust.actions";

interface CrustItemProps {
  crust: { id: string; name: string; price: any };
}

export function CrustItem({ crust }: CrustItemProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <li className="p-4">
        <form 
          action={async (formData) => {
            await updateCrustAction(crust.id, formData);
            setIsEditing(false);
          }} 
          className="flex gap-4 items-end"
        >
          <div className="flex-1">
            <input
              name="name"
              defaultValue={crust.name}
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <div className="w-24">
            <input
              name="price"
              type="number"
              step="0.01"
              defaultValue={Number(crust.price)}
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" className="bg-green-600 hover:bg-green-700">
              <Check size={16} />
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={() => setIsEditing(false)}>
              <X size={16} />
            </Button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between p-4">
      <div>
        <p className="font-medium text-foreground">{crust.name}</p>
        <p className="text-sm text-foreground-muted">R$ {Number(crust.price).toFixed(2)}</p>
      </div>
      
      <div className="flex gap-2">
        <Button type="button" variant="ghost" onClick={() => setIsEditing(true)} className="text-blue-500 hover:text-blue-600 hover:bg-blue-500/10">
          <Edit2 size={18} />
        </Button>
        <form action={async () => { await deleteCrustAction(crust.id); }}>
          <Button type="submit" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-500/10">
            <Trash2 size={18} />
          </Button>
        </form>
      </div>
    </li>
  );
}
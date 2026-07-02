import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "promo" | "success" | "muted" | "danger";
}

const variantStyles: Record<NonNullable<BadgeProps["variant"]>, string> = {
  promo: "bg-gradient-promo text-white",
  success: "bg-success/15 text-success",
  muted: "bg-background-elevated text-foreground-muted border border-border",
  danger: "bg-red-900/30 text-red-400",
};

export function Badge({ className, variant = "muted", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

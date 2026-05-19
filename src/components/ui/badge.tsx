import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// ─── Ricash Badge System ────────────────────────────────────
// Pill-shaped badges with semantic color variants.
// Each variant uses Ricash design tokens for light/dark mode.

const badgeVariants = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap shrink-0 [&>svg]:size-3 [&>svg]:pointer-events-none transition-colors duration-150",
  {
    variants: {
      variant: {
        // ─── Semantic variants using Ricash tokens ───
        success:
          "bg-[var(--ricash-success-bg)] text-[var(--ricash-success)] border border-[var(--ricash-success-border)]",
        warning:
          "bg-[var(--ricash-warning-bg)] text-[var(--ricash-warning)] border border-[var(--ricash-warning-border)]",
        error:
          "bg-[var(--ricash-danger-bg)] text-[var(--ricash-danger)] border border-[var(--ricash-danger-border)]",
        info:
          "bg-[var(--ricash-info-bg)] text-[var(--ricash-info)] border border-[var(--ricash-info-border)]",
        neutral:
          "bg-[var(--ricash-neutral-bg)] text-[var(--ricash-neutral)] border border-[var(--ricash-neutral-border)]",
        brand:
          "bg-[var(--ricash-primary-bg)] text-[var(--ricash-primary)] border border-[var(--ricash-primary-border)]",
        amber:
          "bg-[var(--ricash-amber-bg)] text-[var(--ricash-amber)] border border-[var(--ricash-amber-border)]",

        // ─── Legacy shadcn variants (backward compat) ───
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

// ─── StatusDot: Small colored dot for badge prefixes ────────
const DOT_COLORS: Record<string, string> = {
  success: "bg-[var(--ricash-success)]",
  warning: "bg-[var(--ricash-warning)]",
  error: "bg-[var(--ricash-danger)]",
  info: "bg-[var(--ricash-info)]",
  neutral: "bg-[var(--ricash-neutral)]",
  brand: "bg-[var(--ricash-primary)]",
  amber: "bg-[var(--ricash-amber)]",
}

function StatusDot({ color = "neutral", className }: { color?: string; className?: string }) {
  return (
    <span
      className={cn(
        "size-1.5 rounded-full shrink-0",
        DOT_COLORS[color] ?? DOT_COLORS.neutral,
        className
      )}
    />
  )
}

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants, StatusDot }

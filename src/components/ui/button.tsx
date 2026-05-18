import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2, Check } from "lucide-react"

import { cn } from "@/lib/utils"

// ─── Ricash Button System ───────────────────────────────────
// Professional button with 6 variants, 4 sizes, loading state,
// and smooth micro-interactions (hover lift, active press).

const buttonVariants = cva(
  // Base styles shared by ALL variants
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-150 ease-out select-none outline-none shrink-0 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // ─── Primary: Ricash brand color, white text ───
        primary:
          "bg-[var(--ricash-primary)] text-white shadow-[var(--ricash-shadow-xs)] hover:bg-[var(--ricash-primary-light)] hover:-translate-y-px hover:shadow-[var(--ricash-shadow-sm)] active:bg-[var(--ricash-primary-dark)] active:translate-y-0 active:shadow-none focus-visible:ring-[3px] focus-visible:ring-[var(--ricash-primary)]/30 focus-visible:ring-offset-1",

        // ─── Secondary: Light fill, dark text ───
        secondary:
          "bg-[var(--ricash-primary-bg)] text-[var(--ricash-primary)] shadow-[var(--ricash-shadow-xs)] hover:bg-[var(--ricash-primary)]/15 hover:-translate-y-px hover:shadow-[var(--ricash-shadow-sm)] active:bg-[var(--ricash-primary)]/20 active:translate-y-0 active:shadow-none focus-visible:ring-[3px] focus-visible:ring-[var(--ricash-primary)]/20 focus-visible:ring-offset-1",

        // ─── Ghost: No background, subtle hover ───
        ghost:
          "bg-transparent text-[var(--ricash-primary)] hover:bg-[var(--ricash-primary-bg)] hover:-translate-y-px active:bg-[var(--ricash-primary)]/10 active:translate-y-0 focus-visible:ring-[3px] focus-visible:ring-[var(--ricash-primary)]/20 focus-visible:ring-offset-1",

        // ─── Danger: Red destructive action ───
        danger:
          "bg-[var(--ricash-danger)] text-white shadow-[var(--ricash-shadow-xs)] hover:bg-[var(--ricash-danger-light)] hover:-translate-y-px hover:shadow-[var(--ricash-shadow-sm)] active:bg-[var(--ricash-danger)] active:translate-y-0 active:shadow-none focus-visible:ring-[3px] focus-visible:ring-[var(--ricash-danger)]/30 focus-visible:ring-offset-1",

        // ─── Outline: Bordered, transparent fill ───
        outline:
          "border border-[var(--ricash-primary-border)] bg-transparent text-[var(--ricash-primary)] shadow-[var(--ricash-shadow-xs)] hover:bg-[var(--ricash-primary-bg)] hover:border-[var(--ricash-primary)] hover:-translate-y-px hover:shadow-[var(--ricash-shadow-sm)] active:bg-[var(--ricash-primary)]/12 active:translate-y-0 active:shadow-none focus-visible:ring-[3px] focus-visible:ring-[var(--ricash-primary)]/20 focus-visible:ring-offset-1",

        // ─── Link: Text-only with underline on hover ───
        link:
          "bg-transparent text-[var(--ricash-primary)] underline-offset-4 hover:underline hover:text-[var(--ricash-primary-light)] focus-visible:ring-[3px] focus-visible:ring-[var(--ricash-primary)]/20 focus-visible:ring-offset-1",

        // ─── Legacy shadcn variants (kept for backward compat) ───
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 hover:-translate-y-px active:bg-primary/95 active:translate-y-0 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-offset-1",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 hover:-translate-y-px active:bg-destructive/95 active:translate-y-0 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
      },
      size: {
        xs: "h-8 px-3 text-xs rounded-md gap-1",
        sm: "h-9 px-3.5 text-sm rounded-lg gap-1.5",
        md: "h-10 px-5 text-sm rounded-lg",
        lg: "h-12 px-7 text-base rounded-xl",
        icon: "size-10 rounded-lg",
        "icon-sm": "size-9 rounded-lg",
        "icon-xs": "size-8 rounded-md",
        default: "h-10 px-5 text-sm rounded-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  /** Show success state with check icon + green pulse */
  success?: boolean
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  success = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(
        buttonVariants({ variant, size }),
        success && "bg-[var(--ricash-success)] hover:bg-[var(--ricash-success)] text-white btn-success-pulse",
        className
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          <span className="opacity-70">{children}</span>
        </>
      ) : success ? (
        <>
          <Check className="size-4" />
          <span>{children}</span>
        </>
      ) : (
        children
      )}
    </Comp>
  )
}

export { Button, buttonVariants }
export type { ButtonProps }

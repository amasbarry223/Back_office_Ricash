import * as React from "react"

import { cn } from "@/lib/utils"

// ─── Ricash Card System ─────────────────────────────────────
// Professional cards with default and interactive variants,
// consistent spacing, and elegant hover micro-interactions.

function Card({ className, interactive, ...props }: React.ComponentProps<"div"> & {
  /** Enable hover lift + shadow animation */
  interactive?: boolean
}) {
  return (
    <div
      data-slot="card"
      data-interactive={interactive || undefined}
      className={cn(
        "bg-card text-card-foreground flex flex-col rounded-xl border shadow-[var(--ricash-shadow-sm)]",
        "transition-shadow duration-200 ease-out",
        interactive && "cursor-pointer hover:-translate-y-0.5 hover:shadow-[var(--ricash-shadow-md)] active:translate-y-0 active:shadow-[var(--ricash-shadow-sm)]",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "flex flex-col gap-1.5 p-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("text-lg font-semibold leading-tight tracking-tight", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("self-start", className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6 pb-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center border-t border-border/50 px-6 py-4", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}

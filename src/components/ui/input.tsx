import * as React from "react"

import { cn } from "@/lib/utils"

// ─── Ricash Input System ────────────────────────────────────
// Professional input with focus ring, error state, icon slots,
// disabled styling, and consistent sizing.

function Input({
  className,
  type,
  error,
  iconLeft,
  iconRight,
  ...props
}: React.ComponentProps<"input"> & {
  /** Show error styling */
  error?: boolean
  /** Left icon element */
  iconLeft?: React.ReactNode
  /** Right icon element */
  iconRight?: React.ReactNode
}) {
  const hasIconLeft = !!iconLeft
  const hasIconRight = !!iconRight

  return (
    <div className="relative">
      {hasIconLeft && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ricash-neutral)] pointer-events-none [&_svg]:size-4">
          {iconLeft}
        </span>
      )}
      <input
        type={type}
        data-slot="input"
        data-error={error || undefined}
        className={cn(
          // Base
          "flex w-full min-w-0 rounded-lg border bg-[var(--ricash-surface)] px-3 py-2 text-sm text-foreground",
          "transition-[border-color,box-shadow] duration-150 ease-out",
          "placeholder:text-[var(--ricash-neutral-light)]",
          "selection:bg-[var(--ricash-primary)] selection:text-white",
          // Focus
          "outline-none focus:border-[var(--ricash-primary)] focus:ring-[3px] focus:ring-[var(--ricash-primary)]/15",
          // Error
          error && "border-[var(--ricash-danger)] focus:border-[var(--ricash-danger)] focus:ring-[var(--ricash-danger)]/15",
          // Disabled
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--ricash-neutral-bg)]",
          // Icon padding
          hasIconLeft && "pl-10",
          hasIconRight && "pr-10",
          className
        )}
        aria-invalid={error || undefined}
        {...props}
      />
      {hasIconRight && (
        <span className={cn(
          "absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none [&_svg]:size-4",
          error ? "text-[var(--ricash-danger)]" : "text-[var(--ricash-neutral)]"
        )}>
          {iconRight}
        </span>
      )}
    </div>
  )
}

// ─── FormField: Label + Input + Helper/Error text ────────────
interface FormFieldProps {
  label: string
  helperText?: string
  errorText?: string
  required?: boolean
  children: React.ReactNode
  htmlFor?: string
  className?: string
}

function FormField({
  label,
  helperText,
  errorText,
  required,
  children,
  htmlFor,
  className,
}: FormFieldProps) {
  const generatedId = React.useId()
  const id = htmlFor || generatedId

  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={id}
        className="text-sm font-medium text-foreground flex items-center gap-1"
      >
        {label}
        {required && <span className="text-[var(--ricash-danger)]">*</span>}
      </label>
      {React.Children.map(children, (child) => {
        if (React.isValidElement<Record<string, unknown>>(child)) {
          return React.cloneElement(child, {
            id,
            error: !!errorText,
            ...child.props,
          })
        }
        return child
      })}
      {errorText && (
        <p className="text-xs text-[var(--ricash-danger)] flex items-center gap-1">
          <svg className="size-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {errorText}
        </p>
      )}
      {!errorText && helperText && (
        <p className="text-xs text-[var(--ricash-neutral)]">{helperText}</p>
      )}
    </div>
  )
}

export { Input, FormField }

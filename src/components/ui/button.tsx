'use client'

import { forwardRef, isValidElement, cloneElement } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type Size    = 'sm' | 'md' | 'lg' | 'icon'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  asChild?: boolean
}

const variants: Record<Variant, string> = {
  primary:   'bg-[var(--color-accent)] hover:bg-[var(--color-gold-600)] text-[var(--color-navy-900)] font-semibold shadow-sm',
  secondary: 'bg-[var(--color-navy-900)] hover:bg-[var(--color-navy-700)] text-white font-semibold shadow-sm',
  outline:   'border border-[var(--color-navy-900)] text-[var(--color-navy-900)] hover:bg-[var(--color-slate-100)] bg-transparent',
  ghost:     'text-[var(--color-navy-900)] hover:bg-[var(--color-slate-100)] bg-transparent',
  danger:    'bg-[var(--color-danger)] hover:bg-red-700 text-white font-semibold shadow-sm',
}

const sizes: Record<Size, string> = {
  sm:   'h-8 px-3 text-sm rounded-[var(--radius-sm)]',
  md:   'h-10 px-4 text-sm rounded-[var(--radius-md)]',
  lg:   'h-12 px-6 text-base rounded-[var(--radius-lg)]',
  icon: 'h-10 w-10 rounded-[var(--radius-md)]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, asChild, ...props }, ref) => {
    const baseClass = cn(
      'inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-150',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      variants[variant],
      sizes[size],
      className,
    )

    if (asChild && isValidElement(children)) {
      return cloneElement(children as React.ReactElement<{ className?: string }>, {
        className: cn(baseClass, (children as React.ReactElement<{ className?: string }>).props.className),
      })
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={baseClass}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    )
  },
)
Button.displayName = 'Button'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helper?: string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helper, icon, iconPosition = 'left', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[var(--color-navy-900)]">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && iconPosition === 'left' && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-slate-400)] pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-10 rounded-[var(--radius-md)] border border-[var(--color-slate-200)] bg-white px-3 text-sm',
              'placeholder:text-[var(--color-slate-400)] text-[var(--color-navy-900)]',
              'transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[var(--color-slate-100)]',
              error && 'border-[var(--color-danger)] focus:ring-[var(--color-danger)]',
              icon && iconPosition === 'left' && 'pl-10',
              icon && iconPosition === 'right' && 'pr-10',
              className,
            )}
            {...props}
          />
          {icon && iconPosition === 'right' && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-slate-400)] pointer-events-none">
              {icon}
            </span>
          )}
        </div>
        {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
        {helper && !error && <p className="text-xs text-[var(--color-slate-500)]">{helper}</p>}
      </div>
    )
  },
)
Input.displayName = 'Input'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[var(--color-navy-900)]">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full min-h-[100px] rounded-[var(--radius-md)] border border-[var(--color-slate-200)] bg-white px-3 py-2.5 text-sm',
            'placeholder:text-[var(--color-slate-400)] text-[var(--color-navy-900)] resize-y',
            'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent',
            error && 'border-[var(--color-danger)]',
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
      </div>
    )
  },
)
Textarea.displayName = 'Textarea'

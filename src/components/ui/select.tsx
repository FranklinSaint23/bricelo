import { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-[var(--color-navy-900)]">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'w-full h-10 rounded-[var(--radius-md)] border border-[var(--color-slate-200)] bg-white pl-3 pr-9 text-sm appearance-none',
              'text-[var(--color-navy-900)]',
              'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-[var(--color-danger)]',
              className,
            )}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-slate-400)] pointer-events-none" />
        </div>
        {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
      </div>
    )
  },
)
Select.displayName = 'Select'

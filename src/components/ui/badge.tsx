import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'navy'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  size?: 'sm' | 'md'
  className?: string
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-[var(--color-slate-100)] text-[var(--color-slate-700)]',
  navy:    'bg-[var(--color-navy-900)] text-white',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  danger:  'bg-red-100 text-red-700',
  info:    'bg-sky-100 text-sky-700',
}

export function Badge({ children, variant = 'default', size = 'md', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        size === 'sm' ? 'px-2 py-px text-[10px]' : 'px-2.5 py-0.5 text-xs',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}

export function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, BadgeVariant> = {
    pending:   'warning',
    confirmed: 'info',
    preparing: 'info',
    shipped:   'navy',
    delivered: 'success',
    cancelled: 'danger',
    returned:  'danger',
  }
  const labels: Record<string, string> = {
    pending:   'En attente',
    confirmed: 'Confirmée',
    preparing: 'En préparation',
    shipped:   'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée',
    returned:  'Retournée',
  }
  return <Badge variant={map[status] ?? 'default'}>{labels[status] ?? status}</Badge>
}

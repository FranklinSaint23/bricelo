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
  success: 'bg-green-100 text-green-700 font-semibold',
  warning: 'bg-amber-100 text-amber-800 font-semibold',
  danger:  'bg-red-100 text-red-700 font-semibold',
  info:    'bg-sky-100 text-sky-800 font-semibold',
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

export function OrderStatusBadge({ status, role = 'admin' }: { status: string; role?: 'admin' | 'vendor' | 'customer' }) {
  const map: Record<string, BadgeVariant> = {
    pending:   'warning',
    confirmed: 'info',
    preparing: 'info',
    shipped:   'navy',
    delivered: 'success',
    cancelled: 'danger',
    returned:  'danger',
  }

  const adminLabels: Record<string, string> = {
    pending:   'En attente de paiement',
    confirmed: 'Confirmée (À ramasser)',
    preparing: 'Ramassée chez le vendeur',
    shipped:   'En cours de livraison',
    delivered: 'Livrée & Encaissée',
    cancelled: 'Annulée',
    returned:  'Retournée',
  }

  const vendorLabels: Record<string, string> = {
    pending:   'Emballer maintenant',
    confirmed: 'Prêt pour ramassage BRICELO',
    preparing: 'Récupéré par BRICELO',
    shipped:   'En livraison BRICELO',
    delivered: 'Livré au client',
    cancelled: 'Annulée',
    returned:  'Retourné',
  }

  const customerLabels: Record<string, string> = {
    pending:   'En attente',
    confirmed: 'Confirmée',
    preparing: 'Préparation & Ramassage',
    shipped:   'En cours de livraison',
    delivered: 'Livrée',
    cancelled: 'Annulée',
    returned:  'Retournée',
  }

  const labels = role === 'vendor' ? vendorLabels : role === 'customer' ? customerLabels : adminLabels

  return <Badge variant={map[status] ?? 'default'}>{labels[status] ?? status}</Badge>
}

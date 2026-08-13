export const SITE_NAME = 'BRICELO'
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export const ORDER_STATUSES = {
  pending:    'En attente',
  confirmed:  'Confirmée',
  preparing:  'En préparation',
  shipped:    'Expédiée',
  delivered:  'Livrée',
  cancelled:  'Annulée',
  returned:   'Retournée',
} as const

export const PAYMENT_STATUSES = {
  pending:   'En attente',
  success:   'Réussie',
  failed:    'Échouée',
  cancelled: 'Annulée',
} as const

export const ROLES = {
  customer:      'customer',
  vendor:        'vendor',
  admin:         'admin',
  support:       'support',
} as const

export const PRODUCT_SORT_OPTIONS = [
  { value: 'newest',      label: 'Plus récent' },
  { value: 'price_asc',   label: 'Prix croissant' },
  { value: 'price_desc',  label: 'Prix décroissant' },
  { value: 'popular',     label: 'Popularité' },
  { value: 'relevance',   label: 'Pertinence' },
] as const

export const PAGE_SIZE = 24

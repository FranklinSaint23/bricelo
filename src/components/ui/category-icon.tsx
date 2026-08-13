import {
  Smartphone, Zap, Tv, Shirt, Sofa, ShoppingBasket,
  Flower2, Car, Dumbbell, Gamepad2, Tag, UtensilsCrossed, Baby,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const SLUG_CONFIG: Record<string, { Icon: React.ElementType; bg: string }> = {
  'telephones-tablettes': { Icon: Smartphone,      bg: 'bg-blue-500' },
  'telephones':           { Icon: Smartphone,      bg: 'bg-blue-500' },
  'electromenager':       { Icon: Zap,             bg: 'bg-orange-500' },
  'electronique':         { Icon: Tv,              bg: 'bg-violet-600' },
  'mode':                 { Icon: Shirt,           bg: 'bg-pink-500' },
  'mode-vetements':       { Icon: Shirt,           bg: 'bg-pink-500' },
  'maison-bureau':        { Icon: Sofa,            bg: 'bg-green-600' },
  'maison-jardin':        { Icon: Sofa,            bg: 'bg-green-600' },
  'maison-cuisine':       { Icon: Sofa,            bg: 'bg-green-600' },
  'alimentation':         { Icon: ShoppingBasket,  bg: 'bg-amber-500' },
  'beaute-sante':         { Icon: Flower2,         bg: 'bg-rose-500' },
  'sante-beaute':         { Icon: Flower2,         bg: 'bg-rose-500' },
  'auto-moto':            { Icon: Car,             bg: 'bg-slate-600' },
  'sport':                { Icon: Dumbbell,        bg: 'bg-sky-600' },
  'sport-loisirs':        { Icon: Dumbbell,        bg: 'bg-sky-600' },
  'jouets-jeux':          { Icon: Gamepad2,        bg: 'bg-indigo-500' },
  'restaurant':           { Icon: UtensilsCrossed, bg: 'bg-yellow-600' },
  'bebe-enfants':         { Icon: Baby,            bg: 'bg-purple-400' },
}

const SIZES = {
  xs: { wrap: 'h-7 w-7 rounded-lg',    icon: 'h-3.5 w-3.5' },
  sm: { wrap: 'h-9 w-9 rounded-xl',    icon: 'h-4 w-4' },
  md: { wrap: 'h-11 w-11 rounded-xl',  icon: 'h-5 w-5' },
  lg: { wrap: 'h-14 w-14 rounded-2xl', icon: 'h-7 w-7' },
}

interface Props {
  slug: string
  size?: keyof typeof SIZES
  className?: string
}

export function CategoryIcon({ slug, size = 'md', className }: Props) {
  const cfg = SLUG_CONFIG[slug] ?? { Icon: Tag, bg: 'bg-slate-400' }
  const Icon = cfg.Icon
  const s = SIZES[size]
  return (
    <div className={cn(s.wrap, cfg.bg, 'flex items-center justify-center shrink-0 shadow-sm', className)}>
      <Icon className={cn(s.icon, 'text-white')} strokeWidth={1.8} />
    </div>
  )
}

import Image from 'next/image'
import { cn } from '@/lib/utils'

interface AvatarProps {
  src?: string | null
  name?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizes = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-14 w-14 text-xl',
  xl: 'h-20 w-20 text-2xl',
}

function getInitials(name?: string | null): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center rounded-full overflow-hidden',
        'bg-[var(--color-navy-900)] text-white font-semibold select-none',
        sizes[size],
        className,
      )}
    >
      {src ? (
        <Image src={src} alt={name ?? 'Avatar'} fill className="object-cover" sizes="80px" />
      ) : (
        getInitials(name)
      )}
    </div>
  )
}

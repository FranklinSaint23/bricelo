import React from 'react'
import { BadgeCheck } from 'lucide-react'

export function FacebookVerifiedBadge({ className = "h-4 w-4 shrink-0" }: { className?: string }) {
  return (
    <BadgeCheck
      className={`${className} text-white fill-[#1877F2] shrink-0`}
    />
  )
}

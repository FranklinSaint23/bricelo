import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import type { Category } from '@/types'

interface CategoryGridProps {
  categories: Pick<Category, 'id' | 'name' | 'slug' | 'image_url'>[]
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  if (!categories.length) return null

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-navy-900)]">Nos catégories</h2>
          <p className="text-sm text-[var(--color-slate-500)] mt-0.5">Trouvez rapidement ce que vous cherchez</p>
        </div>
        <Link href="/catalogue" className="flex items-center gap-1 text-sm text-[var(--color-accent)] font-medium hover:underline">
          Tout voir <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/catalogue?categorie=${cat.slug}`}
            className="group flex flex-col items-center gap-3 p-4 bg-white rounded-[var(--radius-xl)] border border-[var(--color-slate-200)] hover:border-[var(--color-accent)] hover:shadow-md transition-all duration-200"
          >
            <div className="relative h-14 w-14 rounded-full overflow-hidden bg-[var(--color-slate-100)]">
              {cat.image_url ? (
                <Image src={cat.image_url} alt={cat.name} fill className="object-cover" sizes="56px" />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-[var(--color-navy-900)]/5">
                  <span className="text-2xl">{cat.name.charAt(0)}</span>
                </div>
              )}
            </div>
            <span className="text-sm font-medium text-[var(--color-navy-900)] text-center group-hover:text-[var(--color-accent)] transition-colors line-clamp-2">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}

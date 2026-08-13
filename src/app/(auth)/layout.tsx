import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-slate-100)] flex flex-col">
      <header className="h-16 flex items-center px-6">
        <Link href="/">
          <span className="text-[var(--color-navy-900)] font-extrabold text-2xl tracking-tight">
            BRICE<span className="text-[var(--color-accent)]">LO</span>
            <span className="text-[var(--color-slate-400)] font-light text-sm">.com</span>
          </span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>
      <footer className="text-center py-4 text-xs text-[var(--color-slate-400)]">
        © {new Date().getFullYear()} BRICELO.com
      </footer>
    </div>
  )
}

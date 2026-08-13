import { Bell } from 'lucide-react'

export const metadata = { title: 'Notifications — BRICELO' }

export default function NotificationsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-navy-900)] flex items-center gap-3">
          <Bell className="h-7 w-7 text-[var(--color-accent)]" />
          Notifications
        </h1>
      </div>

      <div className="bg-white border border-[var(--color-slate-200)] rounded-2xl overflow-hidden shadow-sm">
        <div className="py-16 flex flex-col items-center gap-3 text-center px-4">
          <div className="h-14 w-14 rounded-full bg-[var(--color-slate-100)] flex items-center justify-center">
            <Bell className="h-7 w-7 text-[var(--color-slate-300)]" />
          </div>
          <p className="font-semibold text-[var(--color-navy-900)]">Aucune notification</p>
          <p className="text-sm text-[var(--color-slate-400)] max-w-xs">
            Vous serez notifié ici des mises à jour de vos commandes, offres exclusives et messages importants.
          </p>
        </div>
      </div>
    </div>
  )
}

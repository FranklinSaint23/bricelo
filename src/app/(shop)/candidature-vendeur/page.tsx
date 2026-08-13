import { VendorApplicationForm } from './vendor-application-form'

export const metadata = { title: "Candidature vendeur — BRICELO" }

export default function CandidatureVendeurPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[var(--color-navy-900)] mb-2">
          Inscription Vendeur
        </h1>
        <p className="text-[var(--color-slate-500)] text-sm">
          Remplissez ce formulaire pour soumettre votre candidature. Notre équipe vous contactera sous 48h.
        </p>
      </div>
      <VendorApplicationForm />
    </div>
  )
}

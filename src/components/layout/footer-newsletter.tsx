'use client'

import { useState } from 'react'

export function FooterNewsletter() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setSent(true)
    setEmail('')
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3">
      {sent ? (
        <p className="text-sm text-[var(--color-accent)] font-medium">Merci, vous êtes inscrit !</p>
      ) : (
        <div className="flex">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Entrez votre email ici ..."
            className="flex-1 px-3 py-2 text-sm text-[var(--color-navy-900)] bg-white border-0 outline-none min-w-0 rounded-l"
            required
          />
          <button
            type="submit"
            className="bg-[var(--color-accent)] text-[var(--color-navy-900)] font-bold text-sm px-4 py-2 rounded-r hover:bg-amber-400 transition-colors whitespace-nowrap"
          >
            S'abonner
          </button>
        </div>
      )}
    </form>
  )
}

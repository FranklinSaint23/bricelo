'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function ChatbotWidget() {
  const [open, setOpen]         = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Bonjour ! Je suis l'assistant BRICELO. Comment puis-je vous aider ?" },
  ])
  const [input, setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    const newMessages: Message[] = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })
      const data = await res.json()
      setMessages([...newMessages, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: 'Désolé, une erreur est survenue. Veuillez réessayer.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Fenêtre chat */}
      {open && (
        <div className="w-80 sm:w-96 bg-white rounded-[var(--radius-2xl)] shadow-2xl border border-[var(--color-slate-200)] flex flex-col overflow-hidden" style={{ height: 480 }}>
          {/* Header */}
          <div className="bg-[var(--color-navy-900)] px-4 py-3 flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-[var(--color-accent)] flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4 text-[var(--color-navy-900)]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Assistant BRICELO</p>
              <p className="text-xs text-white/50">Réponse instantanée</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 bg-[var(--color-slate-50)]">
            {messages.map((msg, i) => (
              <div key={i} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'bg-[var(--color-navy-900)] text-white rounded-br-sm'
                      : 'bg-white border border-[var(--color-slate-200)] text-[var(--color-navy-900)] rounded-bl-sm shadow-sm',
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-[var(--color-slate-200)] rounded-2xl rounded-bl-sm px-3.5 py-2.5 shadow-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-[var(--color-slate-400)]" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="border-t border-[var(--color-slate-200)] px-3 py-2.5 flex gap-2 bg-white">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Votre message…"
              className="flex-1 text-sm bg-[var(--color-slate-50)] border border-[var(--color-slate-200)] rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] text-[var(--color-navy-900)]"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="h-9 w-9 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-gold-600)] flex items-center justify-center shrink-0 disabled:opacity-40 transition-colors"
            >
              <Send className="h-4 w-4 text-[var(--color-navy-900)]" />
            </button>
          </form>
        </div>
      )}

      {/* Bouton flottant */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'h-14 w-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200',
          open
            ? 'bg-[var(--color-slate-700)] hover:bg-[var(--color-slate-800)]'
            : 'bg-[var(--color-navy-900)] hover:bg-[var(--color-navy-700)]',
        )}
        aria-label="Assistant BRICELO"
      >
        {open
          ? <X className="h-5 w-5 text-white" />
          : <MessageCircle className="h-5 w-5 text-[var(--color-accent)]" />
        }
      </button>
    </div>
  )
}

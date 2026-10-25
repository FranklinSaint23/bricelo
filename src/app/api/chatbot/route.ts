import { randomUUID } from 'crypto'
import { type NextRequest, NextResponse } from 'next/server'
import { posthogAi } from '@/lib/posthog-ai'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

const SYSTEM_PROMPT = `Tu es l'assistant IA de BRICELO.com, une marketplace multi-vendeurs au Cameroun.
Tu aides les utilisateurs à :
- Naviguer sur la plateforme (catalogue, recherche, catégories)
- Comprendre les fonctionnalités (commande, paiement sécurisé via CamPay Orange/MTN Mobile Money, livraison, suivi)
- Résoudre des questions générales sur les commandes et procédures

Règles absolues :
- Ne jamais exposer de données privées ou personnelles d'autres utilisateurs
- Ne jamais effectuer d'actions sensibles (paiement, remboursement, modification de données critiques)
- Toujours orienter vers le support humain pour les litiges complexes
- Rester professionnel, concis et bienveillant, et contextualiser pour Bricelo ne sors jamais de ce contexte!
- Répondre exclusivement en français et en anglais`

export async function POST(request: NextRequest) {
  try {
    const { messages, conversationId, distinctId } = await request.json()

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages requis' }, { status: 400 })
    }

    // On garde seulement les 10 derniers messages pour limiter les tokens
    const recentMessages = messages.slice(-10)
    const traceId = randomUUID()
    const inputMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...recentMessages,
    ]
    const startedAt = Date.now()

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages: inputMessages,
        temperature: 0.6,
        max_tokens: 512,
      }),
    })

    if (!response.ok) {
      const errBody = await response.text()
      console.error('[chatbot] Groq error body:', errBody)
      throw new Error(`Groq API error: ${response.status} — ${errBody}`)
    }

    const data = await response.json()
    const reply = data.choices?.[0]?.message?.content ?? "Je n'ai pas pu générer une réponse."

    if (posthogAi && typeof conversationId === 'string' && typeof distinctId === 'string') {
      try {
        posthogAi.capture({
          distinctId,
          event: '$ai_generation',
          properties: {
            $ai_trace_id: traceId,
            $ai_session_id: conversationId,
            $ai_model: 'openai/gpt-oss-20b',
            $ai_provider: 'groq',
            $ai_input: inputMessages,
            $ai_input_tokens: data.usage?.prompt_tokens,
            $ai_output_choices: [{ role: 'assistant', content: reply }],
            $ai_output_tokens: data.usage?.completion_tokens,
            $ai_latency: (Date.now() - startedAt) / 1000,
            $ai_http_status: response.status,
            $ai_stop_reason: data.choices?.[0]?.finish_reason,
            $ai_temperature: 0.6,
            $ai_max_tokens: 512,
          },
        })
        await posthogAi.flush()
      } catch (error) {
        console.error('[chatbot] PostHog AI Observability error:', error)
      }
    }

    return NextResponse.json({ reply })
  } catch (err) {
    console.error('[chatbot]', err)
    return NextResponse.json(
      { reply: 'Service temporairement indisponible. Veuillez réessayer dans quelques instants.' },
      { status: 200 },
    )
  }
}

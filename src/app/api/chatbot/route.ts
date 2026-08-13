import { type NextRequest, NextResponse } from 'next/server'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

const SYSTEM_PROMPT = `Tu es l'assistant IA de BRICELO.com, une marketplace multi-vendeurs au Cameroun.
Tu aides les utilisateurs à :
- Naviguer sur la plateforme (catalogue, recherche, catégories)
- Comprendre les fonctionnalités (commande, paiement via CinetPay, livraison, suivi)
- Résoudre des questions générales sur les commandes et procédures

Règles absolues :
- Ne jamais exposer de données privées ou personnelles d'autres utilisateurs
- Ne jamais effectuer d'actions sensibles (paiement, remboursement, modification de données critiques)
- Toujours orienter vers le support humain pour les litiges complexes
- Rester professionnel, concis et bienveillant
- Répondre exclusivement en français`

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages requis' }, { status: 400 })
    }

    // On garde seulement les 10 derniers messages pour limiter les tokens
    const recentMessages = messages.slice(-10)

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...recentMessages,
        ],
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

    return NextResponse.json({ reply })
  } catch (err) {
    console.error('[chatbot]', err)
    return NextResponse.json(
      { reply: 'Service temporairement indisponible. Veuillez réessayer dans quelques instants.' },
      { status: 200 },
    )
  }
}

import { createBrowserClient } from '@supabase/ssr'

// TODO: Une fois les clés Supabase définitives en place, générer les types avec :
// npx supabase gen types typescript --project-id <id> > src/types/supabase.generated.ts
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

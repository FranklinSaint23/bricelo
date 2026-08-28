-- ======================================================
-- Migration 016: Table des Tutoriels & Formations Vidéo
-- ======================================================

CREATE TABLE IF NOT EXISTS public.tutorials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'seller', -- 'seller' | 'product' | 'payment' | 'buyer' | 'growth'
    duration VARCHAR(50) DEFAULT '3 min',
    thumbnail_url TEXT,
    video_url TEXT,
    steps JSONB DEFAULT '[]'::jsonb,
    position INT DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.tutorials ENABLE ROW LEVEL SECURITY;

-- Lecture publique
CREATE POLICY "Public read tutorials"
ON public.tutorials FOR SELECT
USING (true);

-- Gestion complète par l'administrateur
CREATE POLICY "Admin write tutorials"
ON public.tutorials FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Index pour accélérer le tri et le filtre
CREATE INDEX IF NOT EXISTS idx_tutorials_category ON public.tutorials(category);
CREATE INDEX IF NOT EXISTS idx_tutorials_published ON public.tutorials(is_published);

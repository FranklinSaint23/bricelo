export type PeriodType = 'today' | 'yesterday' | 'week' | 'month' | 'year' | 'all'

export interface PeriodConfig {
  id: PeriodType
  label: string
  shortLabel: string
  desc: string
}

export const PERIODS: PeriodConfig[] = [
  { id: 'today', label: "Aujourd'hui", shortLabel: "Aujourd'hui", desc: 'Depuis minuit' },
  { id: 'yesterday', label: 'Hier', shortLabel: 'Hier', desc: 'Journée précédente' },
  { id: 'week', label: 'Hebdomadaire (7j)', shortLabel: '7 Jours', desc: '7 derniers jours' },
  { id: 'month', label: 'Mensuelle (30j)', shortLabel: '30 Jours', desc: '30 derniers jours' },
  { id: 'year', label: 'Annuelle (1 an)', shortLabel: 'Année', desc: 'Année en cours' },
  { id: 'all', label: 'Tout l’historique', shortLabel: 'Tout', desc: 'Cumul complet' },
]

export function getPeriodConfig(period?: string | null): PeriodConfig {
  return PERIODS.find((p) => p.id === period) || PERIODS[5]
}

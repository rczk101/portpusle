export type Project = {
  id: string
  name: string
  score: number
  color: string
  repo?: string
  priv?: boolean
  summary: string
}

export const snapshotDate = '2026-11-25'
export const sourceUrl = 'https://portwatch-vi.xyz/'

// Valeurs recopiées d'un relevé manuel, NON vérifiées de façon indépendante.
export const projects: Project[] = [
  { id: 'doomsday', name: 'Doomsday', score: 78.7, color: '#f97316', priv: true, summary: 'Build privée, sans dépôt public. Hors classement public.' },
  { id: 'dexnom', name: 'DexNom', score: 78, color: '#ec4899', repo: 'DexNom/VIctory', summary: 'Dépôt public suivi.' },
  { id: 'belobug', name: 'Belobug', score: 77.4, color: '#8b5cf6', repo: 'Belobug/VIctory-Belobug-AMD', summary: 'Dépôt public suivi, variante AMD.' },
  { id: 'zettrox', name: 'ZETTROX', score: 64.2, color: '#22d3ee', summary: 'Dépôt public non identifié.' },
  { id: 'suri', name: 'suri', score: 61, color: '#a3e635', summary: 'Dépôt public non identifié.' },
  { id: 'hyphennn', name: 'hyphennn', score: 59.8, color: '#facc15', summary: 'Dépôt public non identifié.' },
]

export const stages: [string, number][] = [
  ['Fondations', 0],
  ['Exécutable lancé', 10],
  ['Première image', 20],
  ['Menu principal', 30],
  ['Dans le monde', 40],
  ['Jouable', 50],
]

export function stageOf(score: number): string {
  let name = stages[0][0]
  for (const [n, min] of stages) if (score >= min) name = n
  return name
}

// ILLUSTRATIF : courbe fabriquée à partir du score actuel, en attendant de vrais relevés du bot.
export const historyIsDemo = true
const WEEKS = 12

function fakeCurve(score: number, seed: number): number[] {
  const out: number[] = []
  for (let i = 0; i < WEEKS; i++) {
    const t = i / (WEEKS - 1)
    const ease = 1 - Math.pow(1 - t, 2.2)
    const wobble = Math.sin(i * 1.7 + seed) * 1.2 * (1 - t)
    out.push(Math.max(0, Math.round((score * (0.25 + 0.75 * ease) + wobble) * 10) / 10))
  }
  out[WEEKS - 1] = score
  return out
}

export const history: Record<string, number | string>[] = (() => {
  const curves = projects.map((p, i) => fakeCurve(p.score, i * 2.3))
  const rows: Record<string, number | string>[] = []
  for (let w = 0; w < WEEKS; w++) {
    const row: Record<string, number | string> = { week: w === WEEKS - 1 ? 'Auj.' : `S-${WEEKS - 1 - w}` }
    projects.forEach((p, i) => { row[p.id] = curves[i][w] })
    rows.push(row)
  }
  return rows
})()

export function weeklyDelta(id: string): number {
  const a = Number(history[WEEKS - 1][id])
  const b = Number(history[WEEKS - 2][id])
  return Math.round((a - b) * 10) / 10
}

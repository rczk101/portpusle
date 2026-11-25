import { projects } from '../data'
import { useJson } from '../hooks'
import type { HistRow } from '../hooks'

const DAY = 864e5

function fit(points: [number, number][]) {
  const n = points.length
  const mx = points.reduce((s, p) => s + p[0], 0) / n
  const my = points.reduce((s, p) => s + p[1], 0) / n
  let sxy = 0, sxx = 0, syy = 0
  for (const [x, y] of points) {
    sxy += (x - mx) * (y - my)
    sxx += (x - mx) ** 2
    syy += (y - my) ** 2
  }
  const m = sxx ? sxy / sxx : 0
  const b = my - m * mx
  const r2 = sxx && syy ? (sxy * sxy) / (sxx * syy) : 0
  return { m, b, r2 }
}

export default function Forecast() {
  const { d: hist } = useJson<HistRow[]>('history', [])
  const t0 = hist.length ? new Date(hist[0].date).getTime() : 0
  const span = hist.length ? (new Date(hist[hist.length - 1].date).getTime() - t0) / DAY : 0

  if (hist.length < 4 || span < 7) {
    return (
      <p className="text-white/60">
        Pas assez de relevés réels ({hist.length} relevé(s), {Math.round(span)} jour(s)). Il en faut au moins 4 sur 7 jours.
        Le bot en ajoute un par jour.
      </p>
    )
  }

  const rows = projects.map((p) => {
    const pts = hist.filter((h) => h.scores[p.id] != null).slice(-14)
      .map((h) => [(new Date(h.date).getTime() - t0) / DAY, h.scores[p.id]] as [number, number])
    if (pts.length < 4) return { p, msg: 'Pas assez de points.' }
    const { m, b, r2 } = fit(pts)
    if (m <= 0.01) return { p, msg: 'Pas de progression mesurable.' }
    const eta = (t: number) => new Date(t0 + ((t - b) / m) * DAY).toISOString().slice(0, 10)
    const conf = r2 > 0.8 && pts.length >= 8 ? 'moyenne' : 'faible'
    return { p, msg: `90 % vers le ${eta(90)}, 100 % vers le ${eta(100)} · confiance ${conf} (R² ${r2.toFixed(2)})` }
  })

  return (
    <div className="grid gap-2">
      {rows.map(({ p, msg }) => (
        <div key={p.id} className="rounded-xl border border-white/10 px-4 py-3 text-sm">
          <b>{p.name}</b> : {msg}
        </div>
      ))}
      <p className="text-xs text-white/40">
        Projection linéaire, pas une promesse. Les projets avancent par paliers, et la fin est souvent la plus lente.
      </p>
    </div>
  )
}

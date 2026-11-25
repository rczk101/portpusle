import { useState } from 'react'
import { projects, stages } from '../data'
import { useJson } from '../hooks'
import type { TestRep } from '../hooks'

export default function MyConfig() {
  const { d: tests } = useJson<TestRep[]>('tests', [])
  const [gpu, setGpu] = useState('')
  const names = stages.map((s) => s[0])

  const mine = gpu.trim().length < 3
    ? []
    : tests.filter((t) => t.gpu.toLowerCase().includes(gpu.toLowerCase().trim()) && !t.crash)

  const best = new Map<string, number>()
  mine.forEach((t) => best.set(t.project, Math.max(best.get(t.project) ?? -1, names.indexOf(t.stage))))
  const ranked = [...best.entries()].sort((a, b) => b[1] - a[1])
  const isAmd = /rx|radeon|amd/i.test(gpu)

  return (
    <div>
      <input
        value={gpu}
        onChange={(e) => setGpu(e.target.value)}
        placeholder="Votre carte graphique (ex. RTX 3060, RX 6700)"
        className="w-full max-w-md rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm outline-none focus:border-pink-500"
      />
      <div className="mt-5">
        {gpu.trim().length < 3 ? (
          <p className="text-white/50">Entrez au moins 3 caractères.</p>
        ) : ranked.length === 0 ? (
          <p className="text-white/60">
            Aucun test validé pour cette carte. Soyez le premier à en envoyer un dans l'onglet « Tests ».
          </p>
        ) : (
          ranked.map(([id, si], i) => (
            <div key={id} className="mb-2 rounded-xl border border-white/10 px-4 py-3 text-sm">
              {i === 0 ? '⭐ ' : ''}<b>{projects.find((p) => p.id === id)?.name ?? id}</b> : jalon atteint par d'autres testeurs avec cette carte :
              « {names[si]} ». Jalon suivant à viser : « {names[si + 1] ?? 'aucun'} ».
            </div>
          ))
        )}
        {isAmd && (
          <p className="mt-3 text-xs text-white/50">
            Un projet porte « AMD » dans le nom de son dépôt (Belobug). Rien n'est vérifié sur sa compatibilité réelle.
          </p>
        )}
      </div>
    </div>
  )
}

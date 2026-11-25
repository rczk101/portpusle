import { useState } from 'react'
import { projects } from '../data'
import { useJson } from '../hooks'
import type { EventItem } from '../hooks'

export default function Timeline() {
  const { d: events } = useJson<EventItem[]>('events', [])
  const [f, setF] = useState('')
  const list = [...events]
    .filter((e) => !f || e.project === f)
    .sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div>
      <select
        value={f}
        onChange={(e) => setF(e.target.value)}
        className="mb-5 rounded-full border border-white/15 bg-black px-4 py-2 text-sm"
      >
        <option value="">Tous les projets</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
      <div className="relative ml-2 border-l border-white/15 pl-6">
        {list.map((e, i) => {
          const p = projects.find((x) => x.id === e.project)
          return (
            <div key={i} className="relative mb-5">
              <span
                className="absolute -left-7.5 top-1.5 h-3 w-3 rounded-full"
                style={{ background: p?.color ?? '#8b5cf6' }}
              />
              <div className="text-xs text-white/40">{e.date.slice(0, 10)}{p ? ' · ' + p.name : ''}</div>
              <div className="text-sm">
                {e.url ? (
                  <a className="underline" href={e.url} target="_blank" rel="noopener noreferrer">{e.title}</a>
                ) : (
                  e.title
                )}
              </div>
            </div>
          )
        })}
        {list.length === 0 && <p className="text-white/50">Aucun évènement.</p>}
      </div>
    </div>
  )
}

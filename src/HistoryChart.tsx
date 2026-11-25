import { useState } from 'react'
import {
  Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { history, historyIsDemo, projects } from './data'

export default function HistoryChart() {
  const [active, setActive] = useState<string[]>(projects.slice(0, 3).map((p) => p.id))

  const toggle = (id: string) =>
    setActive((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]))

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {projects.map((p) => {
          const on = active.includes(p.id)
          return (
            <button
              key={p.id}
              onClick={() => toggle(p.id)}
              className="rounded-full border px-3 py-1 text-sm transition"
              style={{
                borderColor: on ? p.color : 'rgba(255,255,255,0.15)',
                background: on ? p.color + '33' : 'transparent',
                color: on ? '#fff' : 'rgba(255,255,255,0.5)',
              }}
            >
              {p.name}
            </button>
          )
        })}
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history}>
            <defs>
              {projects.map((p) => (
                <linearGradient key={p.id} id={'g-' + p.id} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={p.color} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={p.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis dataKey="week" stroke="rgba(255,255,255,0.4)" fontSize={12} />
            <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.4)" fontSize={12} unit="%" />
            <Tooltip
              contentStyle={{ background: '#0d0b18', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12 }}
            />
            <Legend />
            {projects.filter((p) => active.includes(p.id)).map((p) => (
              <Area
                key={p.id}
                type="monotone"
                dataKey={p.id}
                name={p.name}
                stroke={p.color}
                strokeWidth={2.5}
                fill={'url(#g-' + p.id + ')'}
                animationDuration={900}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {historyIsDemo && (
        <p className="mt-3 text-xs text-amber-300/80">
          Courbes illustratives : elles seront remplacées par de vrais relevés quand le bot Scout enregistrera l'historique.
        </p>
      )}
    </div>
  )
}

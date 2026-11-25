import { useState } from 'react'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { projects, stages } from '../data'
import { useJson } from '../hooks'
import type { TestRep } from '../hooks'

const REPO = 'rczk101/portpusle'
const STAGE_NAMES = stages.map((s) => s[0])
const input = 'rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-pink-500'

export default function Tests() {
  const { d: tests } = useJson<TestRep[]>('tests', [])
  const [f, setF] = useState({
    project: projects[1].id, gpu: '', cpu: '', os: 'Windows 11', version: '', fps: '',
    stage: STAGE_NAMES[1], crash: false, proof: '',
  })
  const set = (k: string, v: string | boolean) => setF((x) => ({ ...x, [k]: v }))

  const issueUrl = () => {
    const body = [
      `Projet: ${f.project}`, `GPU: ${f.gpu}`, `CPU: ${f.cpu}`, `OS: ${f.os}`,
      `Version: ${f.version}`, `FPS: ${f.fps}`, `Jalon: ${f.stage}`,
      `Crash: ${f.crash ? 'oui' : 'non'}`, `Preuve: ${f.proof}`,
      '', '(Ne joignez aucun fichier du jeu. Une capture ou un lien vers une vidéo suffit.)',
    ].join('\n')
    return `https://github.com/${REPO}/issues/new?title=${encodeURIComponent('Test: ' + f.project + ' / ' + f.gpu)}&body=${encodeURIComponent(body)}`
  }

  const key = (t: TestRep) => t.project + '|' + t.gpu.toLowerCase().trim() + '|' + t.stage
  const groups = new Map<string, Set<string>>()
  tests.forEach((t) => {
    if (!groups.has(key(t))) groups.set(key(t), new Set())
    groups.get(key(t))!.add(t.by)
  })
  const reproduced = (t: TestRep) => (groups.get(key(t))?.size ?? 0) >= 2

  const gpus = [...new Set(tests.map((t) => t.gpu.toLowerCase().trim()))]
  const cell = (g: string, si: number) =>
    tests.filter((t) => t.gpu.toLowerCase().trim() === g && !t.crash && STAGE_NAMES.indexOf(t.stage) >= si).length
  const maxCell = Math.max(1, ...gpus.flatMap((g) => STAGE_NAMES.map((_, i) => cell(g, i))))

  const withFps = tests.filter((t) => t.fps)
  const labels = [...new Set(withFps.map((t) => t.version || t.date.slice(0, 10)))]
  const fpsRows = labels.map((l) => {
    const row: Record<string, number | string> = { v: l }
    projects.forEach((p) => {
      const a = withFps.filter((t) => t.project === p.id && (t.version || t.date.slice(0, 10)) === l)
      if (a.length) row[p.id] = Math.round(a.reduce((s, t) => s + (t.fps ?? 0), 0) / a.length)
    })
    return row
  })

  return (
    <div className="grid gap-8">
      <div>
        <h3 className="text-lg font-semibold">Envoyer un test</h3>
        <p className="mb-3 text-xs text-white/50">
          Le bouton ouvre une issue GitHub pré-remplie (compte GitHub requis). Elle apparaît ici après validation.
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          <select className={input} value={f.project} onChange={(e) => set('project', e.target.value)}>
            {projects.map((p) => <option key={p.id} value={p.id} className="bg-black">{p.name}</option>)}
          </select>
          <input className={input} placeholder="GPU (ex. RTX 3060)" value={f.gpu} onChange={(e) => set('gpu', e.target.value)} />
          <input className={input} placeholder="CPU" value={f.cpu} onChange={(e) => set('cpu', e.target.value)} />
          <input className={input} placeholder="OS" value={f.os} onChange={(e) => set('os', e.target.value)} />
          <input className={input} placeholder="Version / commit" value={f.version} onChange={(e) => set('version', e.target.value)} />
          <input className={input} placeholder="FPS moyen" value={f.fps} onChange={(e) => set('fps', e.target.value)} />
          <select className={input} value={f.stage} onChange={(e) => set('stage', e.target.value)}>
            {STAGE_NAMES.map((s) => <option key={s} className="bg-black">{s}</option>)}
          </select>
          <input className={input} placeholder="Lien de preuve (capture, vidéo)" value={f.proof} onChange={(e) => set('proof', e.target.value)} />
          <label className="flex items-center gap-2 text-sm text-white/70">
            <input type="checkbox" checked={f.crash} onChange={(e) => set('crash', e.target.checked)} /> Crash
          </label>
        </div>
        <a
          href={issueUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block rounded-full bg-linear-to-r from-violet-500 to-pink-500 px-5 py-2 text-sm font-semibold"
        >
          Ouvrir l'issue GitHub
        </a>
      </div>

      <div>
        <h3 className="mb-3 text-lg font-semibold">Tests validés ({tests.length})</h3>
        <div className="grid gap-2">
          {tests.map((t, i) => (
            <div key={i} className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 px-4 py-2 text-sm">
              <b>{projects.find((p) => p.id === t.project)?.name ?? t.project}</b>
              <span className="text-white/60">{t.gpu} · {t.stage}{t.fps ? ` · ${t.fps} FPS` : ''}{t.crash ? ' · crash' : ''}</span>
              <span className="text-xs text-white/40">par {t.by}</span>
              {reproduced(t) && <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-300">reproduit</span>}
            </div>
          ))}
          {tests.length === 0 && <p className="text-white/50">Aucun test validé pour l'instant.</p>}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-lg font-semibold">Heatmap GPU × jalon</h3>
        {gpus.length === 0 ? (
          <p className="text-white/50">En attente de tests.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="text-sm">
              <thead>
                <tr>
                  <th className="p-2 text-left">GPU</th>
                  {STAGE_NAMES.map((s) => <th key={s} className="p-2 text-xs font-normal text-white/50">{s}</th>)}
                </tr>
              </thead>
              <tbody>
                {gpus.map((g) => (
                  <tr key={g}>
                    <td className="p-2">{g}</td>
                    {STAGE_NAMES.map((_, i) => {
                      const n = cell(g, i)
                      return (
                        <td key={i} className="p-1">
                          <div
                            className="grid h-9 w-20 place-items-center rounded-md text-xs"
                            style={{ background: `rgba(236,72,153,${n ? 0.15 + 0.7 * (n / maxCell) : 0.04})` }}
                          >
                            {n || ''}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h3 className="mb-3 text-lg font-semibold">FPS par version</h3>
        {fpsRows.length === 0 ? (
          <p className="text-white/50">En attente de tests avec FPS.</p>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fpsRows}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="v" stroke="rgba(255,255,255,0.4)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} />
                <Tooltip contentStyle={{ background: '#0d0b18', border: '1px solid rgba(255,255,255,0.15)' }} />
                <Legend />
                {projects.map((p) => (
                  <Line key={p.id} dataKey={p.id} name={p.name} stroke={p.color} connectNulls strokeWidth={2} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}

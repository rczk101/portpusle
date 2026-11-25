import { useState } from 'react'
import { projects, stageOf } from '../data'
import type { Project } from '../data'
import { avatar, EMPTY_REPOS, useJson } from '../hooks'
import type { ReposFile } from '../hooks'

function share(list: Project[]) {
  const c = document.createElement('canvas')
  c.width = 1200
  c.height = 630
  const g = c.getContext('2d')!
  g.fillStyle = '#06050c'
  g.fillRect(0, 0, 1200, 630)
  g.fillStyle = '#fff'
  g.font = 'bold 44px sans-serif'
  g.fillText('PortPulse VI : comparatif', 50, 80)
  list.forEach((p, i) => {
    const y = 190 + i * 130
    g.font = '32px sans-serif'
    g.fillStyle = '#fff'
    g.fillText(p.name + '  ' + p.score + '%  (' + stageOf(p.score) + ')', 50, y)
    g.fillStyle = 'rgba(255,255,255,0.12)'
    g.fillRect(50, y + 20, 1100, 26)
    g.fillStyle = p.color
    g.fillRect(50, y + 20, 11 * p.score, 26)
  })
  g.font = '20px sans-serif'
  g.fillStyle = '#aaa'
  g.fillText('Scores non vérifiés · non affilié à Rockstar Games / Take-Two', 50, 600)
  const a = document.createElement('a')
  a.download = 'comparatif.png'
  a.href = c.toDataURL('image/png')
  a.click()
}

export default function Compare() {
  const [sel, setSel] = useState<string[]>(['dexnom', 'belobug'])
  const { d: repos } = useJson<ReposFile>('repos', EMPTY_REPOS)
  const list = projects.filter((p) => sel.includes(p.id))
  const toggle = (id: string) =>
    setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length < 3 ? [...s, id] : s))

  return (
    <div>
      <p className="mb-3 text-sm text-white/50">Choisissez 2 ou 3 projets.</p>
      <div className="mb-5 flex flex-wrap gap-2">
        {projects.map((p) => (
          <button
            key={p.id}
            onClick={() => toggle(p.id)}
            className="rounded-full border px-3 py-1 text-sm"
            style={{
              borderColor: sel.includes(p.id) ? p.color : 'rgba(255,255,255,0.15)',
              background: sel.includes(p.id) ? p.color + '33' : 'transparent',
            }}
          >
            {p.name}
          </button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {list.map((p) => {
          const st = p.repo ? repos.repos[p.repo]?.status : undefined
          return (
            <div key={p.id} className="rounded-2xl border border-white/10 p-4">
              <div className="flex items-center gap-3">
                {avatar(p.repo) ? (
                  <img src={avatar(p.repo)} alt="" className="h-10 w-10 rounded-full" />
                ) : (
                  <div className="h-10 w-10 rounded-full" style={{ background: p.color }} />
                )}
                <div className="font-semibold">{p.name}</div>
              </div>
              <div className="grad-text mt-3 text-4xl font-black">{p.score}%</div>
              <div className="text-sm text-white/60">{stageOf(p.score)}</div>
              <div className="mt-3 text-xs text-white/50">
                Dépôt : {p.repo ?? 'non identifié'}
                <br />
                Statut : {st ?? 'inconnu'}
              </div>
            </div>
          )
        })}
      </div>
      <button
        onClick={() => share(list)}
        disabled={list.length < 2}
        className="mt-5 rounded-full bg-linear-to-r from-violet-500 to-pink-500 px-5 py-2 text-sm font-semibold disabled:opacity-40"
      >
        Télécharger l'image à partager
      </button>
    </div>
  )
}

import { avatar, EMPTY_REPOS, useJson } from '../hooks'
import type { ReposFile } from '../hooks'
import { projects } from '../data'

const COLORS = { active: '#22c55e', inactive: '#facc15', removed: '#ef4444' } as const
const LABELS = { active: 'Actif', inactive: 'Inactif', removed: 'Retiré' } as const

export default function Health() {
  const { d: data, ok } = useJson<ReposFile>('repos', EMPTY_REPOS)
  const tracked = projects.filter((p) => p.repo)
  const removed = tracked.filter((p) => data.repos[p.repo!]?.status === 'removed').length

  return (
    <div>
      <div className="mb-4 text-sm text-white/60">
        {ok && data.updated ? 'Dernière vérification : ' + data.updated.slice(0, 16).replace('T', ' ') : 'Pas encore de relevé du bot.'}
        {' · '}Dépôts retirés : <b className="text-white">{removed}</b>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {tracked.map((p) => {
          const r = data.repos[p.repo!]
          return (
            <div key={p.id} className="flex items-center gap-3 rounded-2xl border border-white/10 p-4">
              <img src={avatar(p.repo)} alt="" className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <div className="font-semibold">{p.name}</div>
                <div className="text-xs text-white/50">
                  {r ? `${r.stars ?? 0} ★ · dernier push ${r.pushed?.slice(0, 10) ?? '?'}${r.tag ? ' · ' + r.tag : ''}` : 'en attente du bot'}
                </div>
              </div>
              <span
                className="rounded-full px-3 py-1 text-xs"
                style={{ background: r ? COLORS[r.status] + '33' : '#ffffff22', color: r ? COLORS[r.status] : '#aaa' }}
              >
                {r ? LABELS[r.status] : 'Inconnu'}
              </span>
            </div>
          )
        })}
      </div>

      <h3 className="mt-8 text-lg font-semibold">Nouveaux candidats détectés</h3>
      <p className="mb-3 text-xs text-amber-300/80">
        Trouvés automatiquement, pas vérifiés. Ne rien télécharger ni exécuter sans avoir inspecté le code.
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        {data.candidates.map((c) => (
          <a
            key={c.repo}
            href={'https://github.com/' + c.repo}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="flex items-center gap-3 rounded-2xl border border-white/10 p-3 hover:border-pink-500/50"
          >
            <img src={avatar(c.repo)} alt="" className="h-9 w-9 rounded-full" />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{c.repo}</div>
              <div className="truncate text-xs text-white/50">{c.stars} ★ · {c.desc || 'sans description'}</div>
            </div>
          </a>
        ))}
        {data.candidates.length === 0 && <p className="text-white/50">Aucun candidat pour l'instant.</p>}
      </div>
    </div>
  )
}

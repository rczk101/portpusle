import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Scene from './Scene'
import Towers from './Towers'
import HistoryChart from './HistoryChart'
import Hub from './Hub'
import { projects, stageOf, stages, snapshotDate, sourceUrl, weeklyDelta } from './data'

function useCount(to: number) {
  const [v, setV] = useState(0)
  useEffect(() => {
    const t0 = performance.now()
    let raf = 0
    const f = (n: number) => {
      const p = Math.min(1, (n - t0) / 1600)
      setV(to * (1 - Math.pow(1 - p, 4)))
      if (p < 1) raf = requestAnimationFrame(f)
    }
    raf = requestAnimationFrame(f)
    return () => cancelAnimationFrame(raf)
  }, [to])
  return v
}

const fade = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.6 },
}

export default function App() {
  const sorted = useMemo(() => [...projects].sort((a, b) => b.score - a.score), [])
  const leader = sorted[0]
  const shown = useCount(leader.score)
  const [q, setQ] = useState('')
  const [onlyRepo, setOnlyRepo] = useState(false)

  const race = sorted
    .filter((p) => !p.priv)
    .filter((p) => p.name.toLowerCase().includes(q.toLowerCase()))
    .filter((p) => !onlyRepo || p.repo)

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/40 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2 text-lg font-bold">
            <span className="pulse-dot" />
            PortPulse <span className="grad-text">VI</span>
          </div>
          <nav className="flex gap-5 text-sm text-white/70">
            <a href="#towers" className="hover:text-white">Tours</a>
            <a href="#history" className="hover:text-white">Évolution</a>
            <a href="#race" className="hover:text-white">Classement</a>
            <a href="#lab" className="hover:text-white">Labo</a>
            <a href="#stages" className="hover:text-white">Jalons</a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5">
        {/* HERO */}
        <section className="grid items-center gap-6 py-10 md:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="rounded-full border border-pink-500/40 px-3 py-1 text-xs tracking-widest text-pink-300">
              SUIVI EN DIRECT · {snapshotDate}
            </span>
            <h1 className="mt-5 text-5xl font-extrabold leading-tight md:text-7xl">
              GTA VI tourne-t-il sur PC ?
              <span className="grad-text block">Presque.</span>
            </h1>
            <p className="mt-5 max-w-md text-white/70">
              Tous les projets de portage et de recompilation, notés sur une seule échelle,
              des fondations jusqu'à un jeu terminable.
            </p>
            <div className="mt-7 flex gap-3">
              <a href="#towers" className="rounded-full bg-linear-to-r from-violet-500 to-pink-500 px-5 py-2.5 text-sm font-semibold">
                Voir la course
              </a>
              <a href="#history" className="rounded-full border border-white/20 px-5 py-2.5 text-sm text-white/80 hover:bg-white/5">
                Courbes
              </a>
            </div>
          </motion.div>
          <div className="h-80 md:h-120">
            <Scene />
          </div>
        </section>

        {/* SCORE GLOBAL */}
        <motion.section {...fade} className="glass p-6 md:p-8">
          <div className="text-xs tracking-widest text-white/50">PROGRESSION · PROJET LE PLUS AVANCÉ</div>
          <div className="mt-2 flex flex-wrap items-end gap-6">
            <div className="grad-text text-7xl font-black tabular-nums md:text-8xl">{shown.toFixed(1)}%</div>
            <div className="pb-3 text-white/70">
              Tête : <b className="text-white">{leader.name}</b> · étape « {stageOf(leader.score)} »
            </div>
          </div>
          <div className="relative mt-6 h-4 rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-linear-to-r from-violet-500 via-pink-500 to-orange-500"
              initial={{ width: 0 }}
              animate={{ width: leader.score + '%' }}
              transition={{ duration: 1.6, ease: 'easeOut' }}
            />
            {sorted.map((p) => (
              <motion.div
                key={p.id}
                title={p.name + ' ' + p.score + '%'}
                className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
                style={{ background: p.color }}
                initial={{ left: '0%' }}
                animate={{ left: p.score + '%' }}
                transition={{ duration: 1.6, ease: 'easeOut' }}
              />
            ))}
          </div>
        </motion.section>

        {/* TOURS 3D */}
        <motion.section {...fade} id="towers" className="py-14">
          <h2 className="text-3xl font-bold">La ville des projets</h2>
          <p className="mb-4 text-sm text-white/50">
            Une tour par projet, plus elle est haute plus il est avancé. Glissez pour tourner, survolez pour les détails.
          </p>
          <div className="glass h-96 overflow-hidden md:h-120">
            <Towers />
          </div>
        </motion.section>

        {/* HISTORIQUE */}
        <motion.section {...fade} id="history" className="glass p-6">
          <h2 className="text-3xl font-bold">Évolution</h2>
          <p className="mb-5 text-sm text-white/50">Cliquez sur un projet pour l'afficher ou le masquer.</p>
          <HistoryChart />
        </motion.section>

        {/* CLASSEMENT */}
        <section id="race" className="py-14">
          <h2 className="text-3xl font-bold">Classement public</h2>
          <p className="mb-5 text-sm text-white/50">
            Les builds privées sont exclues du classement. Le score est un relevé externe, non vérifié par ce site.
          </p>

          <div className="mb-5 flex flex-wrap items-center gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher un projet…"
              className="w-64 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm outline-none focus:border-pink-500"
            />
            <label className="flex items-center gap-2 text-sm text-white/70">
              <input type="checkbox" checked={onlyRepo} onChange={(e) => setOnlyRepo(e.target.checked)} />
              Dépôt public identifié seulement
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {race.map((p, i) => {
              const d = weeklyDelta(p.id)
              return (
                <motion.div key={p.id} {...fade} transition={{ delay: i * 0.05 }} className="glass card-glow p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full" style={{ background: p.color }} />
                      <div>
                        <div className="text-lg font-semibold">#{i + 1} {p.name}</div>
                        <div className="text-xs text-white/50">{p.repo ?? 'Dépôt non identifié'}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="grad-text text-3xl font-black">{p.score}%</div>
                      <div className="text-xs text-white/50">{stageOf(p.score)}</div>
                    </div>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: p.color }}
                      initial={{ width: 0 }}
                      whileInView={{ width: p.score + '%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.1 }}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-white/60">{p.summary}</span>
                    <span className="text-xs text-emerald-300/80" title="Variation illustrative">
                      {d >= 0 ? '+' : ''}{d} pt / sem. (démo)
                    </span>
                  </div>
                  {p.repo && (
                    <a
                      className="mt-3 inline-block text-sm text-pink-300 hover:underline"
                      href={'https://github.com/' + p.repo}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                    >
                      ↗ Dépôt GitHub
                    </a>
                  )}
                </motion.div>
              )
            })}
            {race.length === 0 && <p className="text-white/50">Aucun projet ne correspond.</p>}
          </div>
        </section>

        {/* LABO */}
        <Hub />

        {/* JALONS */}
        <motion.section {...fade} id="stages" className="glass mb-14 p-6">
          <h2 className="text-3xl font-bold">Jalons</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {stages.map(([name, min], i) => (
              <div key={name} className="card-glow rounded-2xl border border-white/10 p-4">
                <div className="text-xs text-white/40">ÉTAPE {i + 1}</div>
                <div className="grad-text text-2xl font-bold">{min}%+</div>
                <div className="text-sm text-white/70">{name}</div>
              </div>
            ))}
          </div>
        </motion.section>
      </main>

      <footer className="border-t border-white/10 px-5 py-8 text-center text-xs text-white/50">
        <p>Projet communautaire, non affilié à Rockstar Games ni à Take-Two. Aucun fichier du jeu n'est hébergé ni lié.</p>
        <p className="mt-1">
          Scores : relevé manuel du {snapshotDate}, non vérifié, d'après{' '}
          <a className="underline" href={sourceUrl} target="_blank" rel="noopener noreferrer">portwatch-vi.xyz</a>.
        </p>
      </footer>
    </div>
  )
}
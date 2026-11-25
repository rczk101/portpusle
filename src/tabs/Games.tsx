import { useEffect, useState } from 'react'
import { projects } from '../data'
import { useLS } from '../hooks'

type Pred = { target: number; stake: number; resolveAt: string; done?: 'win' | 'lose' }
type Me = { points: number; streak: number; last: string; wins: number; predWins: number; preds: Pred[] }

const today = new Date().toISOString().slice(0, 10)
const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10)
const leaderScore = Math.max(...projects.map((p) => p.score))

function hash(s: string) {
  let h = 0
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return h
}

const questions = [0, 1, 2].map((i) => {
  const a = hash(today + 'a' + i) % projects.length
  let b = hash(today + 'b' + i) % projects.length
  if (b === a) b = (b + 1) % projects.length
  return [projects[a], projects[b]] as const
})

export default function Games() {
  const [me, setMe] = useLS<Me>('pp_me', { points: 100, streak: 0, last: '', wins: 0, predWins: 0, preds: [] })
  const [ans, setAns] = useState<string[]>([])
  const [target, setTarget] = useState(80)
  const [stake, setStake] = useState(20)

  useEffect(() => {
    setMe((m) => {
      let pts = m.points
      let pw = m.predWins
      const preds = m.preds.map((p) => {
        if (p.done || p.resolveAt > today) return p
        const win = Math.abs(leaderScore - p.target) <= 1.5
        pts += win ? p.stake * 3 : 0
        if (win) pw++
        return { ...p, done: win ? ('win' as const) : ('lose' as const) }
      })
      return { ...m, points: pts, predWins: pw, preds }
    })
  }, [setMe])

  const played = me.last === today
  const finished = ans.length === 3

  const answer = (id: string) => {
    const next = [...ans, id]
    setAns(next)
    if (next.length === 3 && !played) {
      const right = next.filter((a, i) => {
        const [x, y] = questions[i]
        return (x.score > y.score ? x : y).id === a
      }).length
      setMe((m) => ({
        ...m,
        points: m.points + right * 10,
        last: today,
        wins: m.wins + (right >= 2 ? 1 : 0),
        streak: right >= 2 ? (m.last === yesterday ? m.streak + 1 : 1) : 0,
      }))
    }
  }

  const bet = () => {
    if (stake > me.points || stake <= 0) return
    const resolveAt = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10)
    setMe((m) => ({ ...m, points: m.points - stake, preds: [{ target, stake, resolveAt }, ...m.preds] }))
  }

  const badges = [
    me.wins >= 1 && 'Première victoire',
    me.streak >= 3 && 'Série de 3',
    me.streak >= 7 && 'Série de 7',
    me.predWins >= 1 && 'Oracle',
    me.points >= 300 && 'Banquier',
  ].filter(Boolean) as string[]

  const q = questions[Math.min(ans.length, 2)]

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <div className="mb-4 text-sm text-white/60">
          Points virtuels : <b className="text-white">{me.points}</b> · Série : <b className="text-white">{me.streak}</b> jour(s)
        </div>
        <div className="mb-6 flex flex-wrap gap-2">
          {badges.map((b) => (
            <span key={b} className="rounded-full bg-violet-500/20 px-3 py-1 text-xs text-violet-200">🏅 {b}</span>
          ))}
          {badges.length === 0 && <span className="text-xs text-white/40">Aucun badge pour l'instant.</span>}
        </div>

        <h3 className="text-lg font-semibold">Mini-jeu du jour : qui est devant ?</h3>
        {played && !finished ? (
          <p className="mt-2 text-white/60">Déjà joué aujourd'hui. Revenez demain.</p>
        ) : finished ? (
          <p className="mt-2 text-white/80">Terminé. Résultat enregistré. Revenez demain.</p>
        ) : (
          <div className="mt-3">
            <div className="mb-2 text-xs text-white/40">Question {ans.length + 1} / 3 (+10 points par bonne réponse)</div>
            <div className="grid grid-cols-2 gap-3">
              {q.map((p) => (
                <button key={p.id} onClick={() => answer(p.id)} className="rounded-2xl border border-white/15 p-5 text-lg hover:border-pink-500">
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold">Prédiction à 7 jours</h3>
        <p className="mb-3 text-xs text-white/50">
          Quel sera le score du leader dans 7 jours ? Tolérance de 1,5 point. Gain : mise × 3. Points virtuels, sans argent réel.
        </p>
        <label className="text-sm">Score visé : <b>{target}%</b></label>
        <input type="range" min={0} max={100} step={0.5} value={target} onChange={(e) => setTarget(+e.target.value)} className="w-full" />
        <label className="text-sm">Mise : <b>{stake}</b></label>
        <input type="range" min={5} max={Math.max(5, me.points)} step={5} value={stake} onChange={(e) => setStake(+e.target.value)} className="w-full" />
        <button onClick={bet} className="mt-3 rounded-full bg-linear-to-r from-violet-500 to-pink-500 px-5 py-2 text-sm font-semibold">
          Valider
        </button>
        <div className="mt-4 grid gap-2">
          {me.preds.map((p, i) => (
            <div key={i} className="rounded-xl border border-white/10 px-4 py-2 text-sm">
              {p.target}% · mise {p.stake} · jusqu'au {p.resolveAt} ·{' '}
              {p.done === 'win' ? '✅ gagné' : p.done === 'lose' ? '❌ perdu' : 'en cours'}
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-white/40">
          Les points sont enregistrés dans votre navigateur. Un classement entre joueurs demandera un serveur (étape suivante).
        </p>
      </div>
    </div>
  )
}

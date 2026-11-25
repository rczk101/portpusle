import { useJson, useLS } from '../hooks'
import type { EventItem } from '../hooks'

export default function Alerts() {
  const { d: events } = useJson<EventItem[]>('events', [])
  const [seen, setSeen] = useLS('pp_seen', '')
  const fresh = events.filter((e) => e.date > seen)
  const feed = import.meta.env.BASE_URL + 'feed.xml'

  const enable = async () => {
    if (!('Notification' in window)) return alert('Notifications non supportées.')
    const r = await Notification.requestPermission()
    if (r === 'granted') new Notification('PortPulse VI', { body: fresh.length + ' nouveauté(s) non lue(s)' })
  }

  return (
    <div className="grid gap-5">
      <div className="rounded-2xl border border-white/10 p-4">
        <div className="font-semibold">Flux RSS</div>
        <p className="text-sm text-white/60">À ajouter dans votre lecteur RSS ou dans un salon Discord via un abonnement RSS.</p>
        <a className="text-sm text-pink-300 underline" href={feed}>{feed}</a>
      </div>
      <div className="rounded-2xl border border-white/10 p-4">
        <div className="font-semibold">Notifications du navigateur</div>
        <p className="text-sm text-white/60">Actives quand le site est ouvert. Non lus : {fresh.length}</p>
        <div className="mt-2 flex gap-2">
          <button onClick={enable} className="rounded-full border border-white/20 px-4 py-1.5 text-sm">Activer</button>
          <button
            onClick={() => setSeen(new Date().toISOString())}
            className="rounded-full border border-white/20 px-4 py-1.5 text-sm"
          >
            Tout marquer comme lu
          </button>
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 p-4 text-sm text-white/60">
        <b className="text-white">Discord :</b> l'annonce automatique se fait via un webhook. Voir la configuration du bot plus bas.
        Telegram et e-mail ne sont pas encore disponibles.
      </div>
      {fresh.slice(0, 10).map((e, i) => (
        <div key={i} className="text-sm">🔔 {e.date.slice(0, 10)} · {e.title}</div>
      ))}
    </div>
  )
}

import { useState } from 'react'
import Compare from './tabs/Compare'
import Timeline from './tabs/Timeline'
import Health from './tabs/Health'
import Tests from './tabs/Tests'
import Games from './tabs/Games'
import Alerts from './tabs/Alerts'
import MyConfig from './tabs/MyConfig'
import Forecast from './tabs/Forecast'
import Vote from './tabs/Vote'

const TABS = [
  ['Comparer', Compare],
  ['Timeline', Timeline],
  ['Santé', Health],
  ['Tests', Tests],
  ['Jeux', Games],
  ['Alertes', Alerts],
  ['Ma config', MyConfig],
  ['Prévision', Forecast],
  ['Vote', Vote],
] as const

export default function Hub() {
  const [i, setI] = useState(0)
  const Active = TABS[i][1]
  return (
    <section id="lab" className="glass mb-14 p-6">
      <h2 className="text-3xl font-bold">Labo</h2>
      <div className="my-5 flex flex-wrap gap-2">
        {TABS.map(([name], k) => (
          <button
            key={name}
            onClick={() => setI(k)}
            className={'rounded-full border px-4 py-1.5 text-sm transition ' + (k === i ? 'border-pink-500 bg-pink-500/20' : 'border-white/15 text-white/60 hover:text-white')}
          >
            {name}
          </button>
        ))}
      </div>
      <Active />
    </section>
  )
}

import { useEffect, useRef } from 'react'

// À remplir avec les valeurs de https://giscus.app (voir les instructions)
const REPO = 'rczk101/portpusle'
const REPO_ID = ''
const CATEGORY = 'Votes'
const CATEGORY_ID = ''

export default function Vote() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!REPO_ID || !CATEGORY_ID || !ref.current) return
    const s = document.createElement('script')
    s.src = 'https://giscus.app/client.js'
    s.async = true
    s.crossOrigin = 'anonymous'
    const a: Record<string, string> = {
      'data-repo': REPO, 'data-repo-id': REPO_ID,
      'data-category': CATEGORY, 'data-category-id': CATEGORY_ID,
      'data-mapping': 'specific', 'data-term': 'Votes PortPulse',
      'data-reactions-enabled': '1', 'data-input-position': 'top',
      'data-theme': 'dark', 'data-lang': 'fr',
    }
    Object.entries(a).forEach(([k, v]) => s.setAttribute(k, v))
    ref.current.appendChild(s)
  }, [])

  if (!REPO_ID || !CATEGORY_ID) {
    return (
      <p className="text-white/60">
        Vote non configuré. Ouvrez <code>src/tabs/Vote.tsx</code> et renseignez <code>REPO_ID</code> et <code>CATEGORY_ID</code>.
      </p>
    )
  }
  return (
    <div>
      <p className="mb-3 text-sm text-white/60">
        Votez avec les réactions : prochaines fonctions et « projet de la semaine ». Connexion GitHub requise.
      </p>
      <div ref={ref} />
    </div>
  )
}

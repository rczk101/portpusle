import { useEffect, useState } from 'react'

export type EventItem = { date: string; title: string; project?: string; url?: string }
export type RepoInfo = { status: 'active' | 'inactive' | 'removed'; stars?: number; pushed?: string; tag?: string }
export type Candidate = { repo: string; stars: number; pushed: string; desc: string }
export type ReposFile = { updated: string | null; repos: Record<string, RepoInfo>; candidates: Candidate[] }
export type TestRep = {
  project: string; gpu: string; cpu?: string; os?: string; version?: string
  fps?: number; stage: string; crash?: boolean; date: string; by: string; url?: string
}
export type HistRow = { date: string; scores: Record<string, number> }

export const EMPTY_REPOS: ReposFile = { updated: null, repos: {}, candidates: [] }

export const avatar = (repo?: string) =>
  repo ? `https://github.com/${repo.split('/')[0]}.png?size=64` : undefined

export function useJson<T>(name: string, fallback: T) {
  const [d, setD] = useState<T>(fallback)
  const [ok, setOk] = useState(false)
  useEffect(() => {
    fetch(import.meta.env.BASE_URL + 'data/' + name + '.json?t=' + Date.now())
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => { setD(j); setOk(true) })
      .catch(() => {})
  }, [name])
  return { d, ok }
}

export function useLS<T>(key: string, init: T) {
  const [v, setV] = useState<T>(() => {
    try {
      const s = localStorage.getItem(key)
      return s ? (JSON.parse(s) as T) : init
    } catch {
      return init
    }
  })
  useEffect(() => { localStorage.setItem(key, JSON.stringify(v)) }, [key, v])
  return [v, setV] as const
}

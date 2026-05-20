import { useEffect, useState } from 'react'

export type HealthState = {
  status: 'checking' | 'ready' | 'degraded'
  mode: string
  deployedAt: string
  checks: Array<{ name: string; status: 'ready' | 'degraded'; detail: string }>
}

const fallbackHealth: HealthState = {
  status: 'degraded',
  mode: 'static-fallback',
  deployedAt: 'unavailable',
  checks: [
    {
      name: 'Portfolio UI',
      status: 'ready',
      detail: 'Static React surface is available even when the health function cannot be reached.',
    },
  ],
}

export function useHealth() {
  const [health, setHealth] = useState<HealthState>({
    status: 'checking',
    mode: 'loading',
    deployedAt: 'loading',
    checks: [],
  })

  useEffect(() => {
    let cancelled = false

    fetch('/api/health', { headers: { accept: 'application/json' } })
      .then(async (response) => {
        if (!response.ok) throw new Error(`health ${response.status}`)
        return (await response.json()) as HealthState
      })
      .then((nextHealth) => {
        if (!cancelled) setHealth(nextHealth)
      })
      .catch(() => {
        if (!cancelled) setHealth(fallbackHealth)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return health
}

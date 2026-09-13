// useBackendWarmup.ts — Cold-start detection with 2-second race check and background polling
import { useState, useCallback, useRef, useEffect } from 'react'
import { BASE_URL } from '../lib/api'

export type WarmupState = 'idle' | 'checking' | 'ready' | 'warming' | 'timeout'

export interface WarmupFlowOptions {
  onWarmReady: () => void
  onColdStart?: () => void
  onBackendAwake?: () => void
}

export function useBackendWarmup() {
  const [state, setState] = useState<WarmupState>('idle')
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const ceilingRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeControllerRef = useRef<AbortController | null>(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      if (pollRef.current) clearInterval(pollRef.current)
      if (ceilingRef.current) clearTimeout(ceilingRef.current)
      if (activeControllerRef.current) activeControllerRef.current.abort()
    }
  }, [])

  const checkHealth = useCallback(async (timeoutMs: number): Promise<boolean> => {
    const controller = new AbortController()
    activeControllerRef.current = controller
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const res = await fetch(`${BASE_URL}/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      })
      clearTimeout(timeoutId)
      return res.ok
    } catch {
      clearTimeout(timeoutId)
      return false
    } finally {
      if (activeControllerRef.current === controller) {
        activeControllerRef.current = null
      }
    }
  }, [])

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
    if (ceilingRef.current) {
      clearTimeout(ceilingRef.current)
      ceilingRef.current = null
    }
  }, [])

  const startWarmupFlow = useCallback(async ({
    onWarmReady,
    onColdStart,
    onBackendAwake,
  }: WarmupFlowOptions) => {
    stopPolling()
    setState('checking')

    // 1. Race the lightweight /health endpoint against a 2-second window
    const isWarm = await checkHealth(2000)

    if (!isMountedRef.current) return

    if (isWarm) {
      // Backend is warm! Directly open app with zero game and zero wait
      setState('ready')
      onWarmReady()
      return
    }

    // 2. Cold start detected (or backend sleeping on Render)
    setState('warming')
    onColdStart?.()

    // 3. Poll /health in the background every 4s
    pollRef.current = setInterval(async () => {
      const nowReady = await checkHealth(3000)
      if (!isMountedRef.current) return

      if (nowReady) {
        stopPolling()
        setState('ready')
        onBackendAwake?.()
      }
    }, 4000)

    // 4. Hard ceiling — if backend has not woken up after 90s, stop polling and show fallback
    ceilingRef.current = setTimeout(() => {
      if (!isMountedRef.current) return
      stopPolling()
      setState(prev => prev === 'warming' ? 'timeout' : prev)
    }, 90000)
  }, [checkHealth, stopPolling])

  const resetWarmup = useCallback(() => {
    stopPolling()
    setState('idle')
  }, [stopPolling])

  return {
    state,
    isWarming: state === 'warming',
    isReady: state === 'ready',
    isChecking: state === 'checking',
    isTimeout: state === 'timeout',
    startWarmupFlow,
    checkHealth,
    resetWarmup,
  }
}

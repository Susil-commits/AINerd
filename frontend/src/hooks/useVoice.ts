import { useState, useCallback, useRef, useEffect } from 'react'
import { synthesizeSpeech } from '../lib/api'

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

// Web Speech API hook for STT (speech-to-text)
export function useSpeechInput(onResult: (text: string) => void) {
  const isSupported = typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)
  const [isListening, setIsListening] = useState(false)
  const [interimText, setInterimText] = useState('')
  const recognitionRef = useRef<any | null>(null)

  const startListening = useCallback(() => {
    const SpeechRecognition = typeof window !== 'undefined'
      ? (window.SpeechRecognition || window.webkitSpeechRecognition)
      : null

    if (!SpeechRecognition) {
      console.warn('SpeechRecognition is not supported on this browser.')
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onstart = () => setIsListening(true)
      recognition.onend = () => {
        setIsListening(false)
        setInterimText('')
      }

      recognition.onresult = (event: any) => {
        let final = ''
        let interim = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript
          if (event.results[i].isFinal) final += t
          else interim += t
        }
        setInterimText(interim)
        if (final) {
          onResult(final.trim())
          setInterimText('')
        }
      }

      recognition.onerror = (event: any) => {
        setIsListening(false)
        if (event?.error === 'not-allowed') {
          console.warn('Microphone permission denied.')
        }
      }

      recognitionRef.current = recognition
      recognition.start()
    } catch (e) {
      console.warn('Failed to start SpeechRecognition:', e)
      setIsListening(false)
    }
  }, [onResult])

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop()
    } catch {}
    setIsListening(false)
  }, [])

  return { isListening, interimText, startListening, stopListening, isSupported }
}

// Cache cloud TTS quota state in memory and sessionStorage to prevent spamming failed 402 requests
let cloudTtsExhausted = typeof window !== 'undefined' && sessionStorage.getItem('veritas_cloud_tts_disabled') === 'true'

// ElevenLabs TTS hook (via backend proxy) with seamless browser fallback
export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  const isSpeakingRef = useRef(false)

  // Keep ref in sync with state so callbacks always read current value
  const setSpeaking = useCallback((val: boolean) => {
    isSpeakingRef.current = val
    setIsSpeaking(val)
  }, [])

  const stop = useCallback(() => {
    try {
      audioContextRef.current?.close()
      audioContextRef.current = null
    } catch {}
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel()
      } catch {}
    }
    setSpeaking(false)
  }, [setSpeaking])

  // Stop any ongoing speech when the component unmounts (e.g. sign out, navigation)
  useEffect(() => {
    return () => {
      stop()
    }
  }, [stop])

  const speak = useCallback(async (text: string) => {
    if (!text) return

    // Cancel any previous speech before starting a new one (prevents audio queue pile-up)
    stop()
    setSpeaking(true)

    // 1. Try ElevenLabs cloud TTS only if quota hasn't previously failed with 402/401/503
    if (!cloudTtsExhausted) {
      try {
        const buffer = await synthesizeSpeech(text)
        const ctx = new AudioContext()
        audioContextRef.current = ctx
        const decoded = await ctx.decodeAudioData(buffer)
        const source = ctx.createBufferSource()
        source.buffer = decoded
        source.connect(ctx.destination)
        source.onended = () => {
          setSpeaking(false)
          try { ctx.close() } catch {}
          audioContextRef.current = null
        }
        source.start()
        return
      } catch (err: any) {
        // If error is 402 Payment Required (ElevenLabs quota exhausted) or similar, remember it
        const errMsg = String(err?.message || err)
        if (errMsg.includes('402') || errMsg.includes('401') || errMsg.includes('503')) {
          cloudTtsExhausted = true
          try {
            sessionStorage.setItem('veritas_cloud_tts_disabled', 'true')
          } catch {}
        }
      }
    }

    // 2. Clean browser TTS fallback
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 1.0
        utterance.pitch = 1.0

        const voices = window.speechSynthesis.getVoices?.() || []
        const naturalVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel')))
        if (naturalVoice) {
          utterance.voice = naturalVoice
        }

        utterance.onend = () => setSpeaking(false)
        utterance.onerror = () => setSpeaking(false)
        window.speechSynthesis.speak(utterance)
      } catch {
        setSpeaking(false)
      }
    } else {
      setSpeaking(false)
    }
  }, [setSpeaking, stop])

  return { isSpeaking, speak, stop }
}

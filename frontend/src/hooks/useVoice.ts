import { useState, useCallback, useRef } from 'react'
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

// ElevenLabs TTS hook (via backend proxy)
export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  const isSpeakingRef = useRef(false)

  // Keep ref in sync with state so callbacks always read current value
  const setSpeaking = (val: boolean) => {
    isSpeakingRef.current = val
    setIsSpeaking(val)
  }

  const speak = useCallback(async (text: string) => {
    if (!text || isSpeakingRef.current) return
    setSpeaking(true)
    try {
      const buffer = await synthesizeSpeech(text)
      const ctx = new AudioContext()
      audioContextRef.current = ctx
      const decoded = await ctx.decodeAudioData(buffer)
      const source = ctx.createBufferSource()
      source.buffer = decoded
      source.connect(ctx.destination)
      source.onended = () => { setSpeaking(false); ctx.close() }
      source.start()
    } catch {
      // Fallback to browser TTS
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.95
      utterance.pitch = 1.0
      utterance.onend = () => setSpeaking(false)
      window.speechSynthesis.speak(utterance)
    }
  }, [])

  const stop = useCallback(() => {
    audioContextRef.current?.close()
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [])

  return { isSpeaking, speak, stop }
}

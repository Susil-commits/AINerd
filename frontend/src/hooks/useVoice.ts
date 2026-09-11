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
  const [isListening, setIsListening] = useState(false)
  const [interimText, setInterimText] = useState('')
  const recognitionRef = useRef<any | null>(null)

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Voice input requires Chrome or Edge. Please type your response instead.')
      return
    }

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

    recognition.onerror = () => setIsListening(false)
    recognitionRef.current = recognition
    recognition.start()
  }, [onResult])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  return { isListening, interimText, startListening, stopListening }
}

// ElevenLabs TTS hook (via backend proxy)
export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)

  const speak = useCallback(async (text: string) => {
    if (!text || isSpeaking) return
    setIsSpeaking(true)
    try {
      const buffer = await synthesizeSpeech(text)
      const ctx = new AudioContext()
      audioContextRef.current = ctx
      const decoded = await ctx.decodeAudioData(buffer)
      const source = ctx.createBufferSource()
      source.buffer = decoded
      source.connect(ctx.destination)
      source.onended = () => { setIsSpeaking(false); ctx.close() }
      source.start()
    } catch {
      // Fallback to browser TTS
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.95
      utterance.pitch = 1.0
      utterance.onend = () => setIsSpeaking(false)
      window.speechSynthesis.speak(utterance)
    }
  }, [isSpeaking])

  const stop = useCallback(() => {
    audioContextRef.current?.close()
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [])

  return { isSpeaking, speak, stop }
}

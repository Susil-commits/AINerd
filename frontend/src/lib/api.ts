// API client for the FastAPI backend
import axios from 'axios'

const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const BASE_URL = rawUrl.replace(/\/+$/, '')

export const api = axios.create({ baseURL: BASE_URL })

export interface Problem {
  id: string
  title: string
  text: string
  skill_id: string
  difficulty: number
  expected_steps: string[]
}

export interface SessionData {
  session_id: string
  student_id: string
  student_name: string
  current_problem: Problem
  mastery_state: Record<string, number>
  welcome_message: string
}

export interface BoundingBox {
  top: number
  left: number
  width: number
  height: number
}

export interface Diagnosis {
  ocr_text: string
  is_correct: boolean
  step_number: number
  misconception_type: string
  description: string
  skill_gap: string
  skill_gap_name: string
  corrective_question: string
  bounding_hint: string
  bounding_box?: BoundingBox | null
}

export async function startSession(studentName: string): Promise<SessionData> {
  const { data } = await api.post('/session/start', { student_name: studentName })
  return data
}

export async function getMastery(studentId: string) {
  const { data } = await api.get(`/student/${studentId}/mastery`)
  return data
}

export async function getSummary(studentId: string, sessionId: string) {
  const { data } = await api.get(`/student/${studentId}/summary`, {
    params: { session_id: sessionId }
  })
  return data
}

export function streamMessage(
  sessionId: string,
  message: string,
  onThinking: (step: string) => void,
  onResponse: (text: string, done: boolean) => void,
  onDone: (masteryState: Record<string, number>) => void,
) {
  const url = `${BASE_URL}/session/message`
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, message }),
  }).then(async (res) => {
    const reader = res.body!.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        try {
          const payload = JSON.parse(line.slice(6))
          if (payload.type === 'thinking') onThinking(payload.content)
          if (payload.type === 'response') onResponse(payload.content, payload.done)
          if (payload.type === 'done') onDone(payload.mastery_state ?? {})
        } catch {}
      }
    }
  })
}

export function streamDiagnosis(
  sessionId: string,
  file: File,
  onThinking: (step: string) => void,
  onDiagnosis: (diagnosis: Diagnosis, masteryState: Record<string, number>, nextProblem: Problem | null) => void,
) {
  const formData = new FormData()
  formData.append('file', file)

  fetch(`${BASE_URL}/session/upload-work?session_id=${sessionId}`, {
    method: 'POST',
    body: formData,
  }).then(async (res) => {
    const reader = res.body!.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        try {
          const payload = JSON.parse(line.slice(6))
          if (payload.type === 'thinking') onThinking(payload.content)
          if (payload.type === 'diagnosis') {
            onDiagnosis(payload.diagnosis, payload.mastery_state, payload.next_problem)
          }
        } catch {}
      }
    }
  })
}

export async function synthesizeSpeech(text: string): Promise<ArrayBuffer> {
  const res = await fetch(`${BASE_URL}/tts?text=${encodeURIComponent(text)}`, { method: 'POST' })
  return res.arrayBuffer()
}

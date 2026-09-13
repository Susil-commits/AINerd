// API client for the FastAPI backend
import axios from 'axios'

const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
export const BASE_URL = rawUrl.replace(/\/+$/, '')

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
  session_token?: string
  current_problem: Problem
  mastery_state: Record<string, number>
  welcome_message: string
}

export function getAuthHeaders(): Record<string, string> {
  try {
    const raw = sessionStorage.getItem('session')
    if (raw) {
      const session = JSON.parse(raw)
      if (session.session_token) {
        return {
          'Authorization': `Bearer ${session.session_token}`,
          'X-Session-Token': session.session_token,
        }
      }
    }
  } catch {}
  return {}
}

export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
  top?: number
  left?: number
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
  bounding_hint: BoundingBox | null
  bounding_box?: BoundingBox | null
}

export interface HealthStatus {
  status: string
  version?: string
  uptime_seconds?: number
  services?: {
    supabase: boolean
    gemini: boolean
  }
  db?: boolean
  active_cached_sessions?: number
}

export async function checkHealth(): Promise<HealthStatus> {
  const { data } = await api.get('/health', { timeout: 12000 })
  return data
}

export async function startSession(studentName: string, studentId?: string, studentEmail?: string): Promise<SessionData> {
  const { data } = await api.post('/session/start', {
    student_name: studentName,
    student_id: studentId,
    student_email: studentEmail,
  })
  return data
}

export async function getMastery(studentId: string) {
  const { data } = await api.get(`/student/${studentId}/mastery`, {
    headers: getAuthHeaders(),
  })
  return data
}

export async function getSummary(studentId: string, sessionId: string) {
  const { data } = await api.get(`/student/${studentId}/summary`, {
    params: { session_id: sessionId },
    headers: getAuthHeaders(),
  })
  return data
}

export interface ChildItem {
  student_id: string
  student_name: string
  student_email: string
  last_session_at: string | null
  days_since_practice: number
  has_fraction_gap: boolean
  fraction_alert_message: string
  fraction_mastery: number
  session_count: number
}

export async function getParentChildren(parentId: string): Promise<{ children: ChildItem[] }> {
  const { data } = await api.get(`/parent/${parentId}/children`)
  return data
}

export async function addChild(
  parentId: string,
  childEmail: string,
  childName?: string,
  parentEmail?: string,
): Promise<{ status: string; child: { student_id: string; student_name: string; student_email: string } }> {
  const { data } = await api.post('/parent/add-child', {
    parent_id: parentId,
    child_email: childEmail,
    child_name: childName,
    parent_email: parentEmail,
  })
  return data
}

export async function getChildDetails(parentId: string, childId: string) {
  const { data } = await api.get(`/parent/${parentId}/child/${childId}/details`)
  return data
}

export async function deleteParentData(parentId: string): Promise<{
  status: string
  message: string
  purged_records?: {
    children_unlinked: number
    sessions_deleted: number
    events_deleted: number
  }
}> {
  const { data } = await api.delete(`/parent/${parentId}/data`)
  return data
}


export function streamMessage(
  sessionId: string,
  message: string,
  onThinking: (step: string) => void,
  onResponse: (text: string, done: boolean) => void,
  onDone: (masteryState: Record<string, number>) => void,
  onError?: (err: any) => void,
) {
  const url = `${BASE_URL}/session/message`
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ session_id: sessionId, message }),
  }).then(async (res) => {
    if (!res.ok) {
      if (res.status === 429) {
        onThinking('Tutor catching breath...')
        onResponse("You're thinking super fast! Please wait a couple of seconds before sending your next message.", true)
        onDone({})
        return
      }
      throw new Error(`HTTP ${res.status}: ${res.statusText}`)
    }

    if (!res.body) return
    const reader = res.body.getReader()
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
  }).catch((err) => {
    console.warn('streamMessage error:', err)
    onError?.(err)
  })
}

export function streamDiagnosis(
  sessionId: string,
  file: File,
  onThinking: (step: string) => void,
  onDiagnosis: (diagnosis: Diagnosis, masteryState: Record<string, number>, nextProblem: Problem | null) => void,
  onError?: (err: any) => void,
) {
  const formData = new FormData()
  formData.append('file', file)

  fetch(`${BASE_URL}/session/upload-work?session_id=${sessionId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  }).then(async (res) => {
    if (!res.ok) {
      if (res.status === 429) {
        onThinking('Vision analyzer cooldown — please wait a few seconds before re-uploading.')
        return
      }
      throw new Error(`HTTP ${res.status}: ${res.statusText}`)
    }

    if (!res.body) return
    const reader = res.body.getReader()
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
  }).catch((err) => {
    console.warn('streamDiagnosis error:', err)
    onError?.(err)
  })
}

export async function synthesizeSpeech(text: string): Promise<ArrayBuffer> {
  const res = await fetch(`${BASE_URL}/tts?text=${encodeURIComponent(text)}`, {
    method: 'POST',
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error(`TTS error: ${res.status}`)
  return res.arrayBuffer()
}

export interface NeoChatResponse {
  status: string
  reply: string
  guardrailed: boolean
  guardrail_reason?: string | null
  suggested_actions: string[]
  user_role: string
}

export async function sendNeoChat(
  message: string,
  history: Array<{ role: string; content: string }>,
  visitorId?: string,
): Promise<NeoChatResponse> {
  const headers: Record<string, string> = {
    ...getAuthHeaders(),
  }
  if (visitorId) {
    headers['X-Visitor-Id'] = visitorId
  }

  const { data } = await api.post<NeoChatResponse>(
    '/neo/chat',
    {
      message,
      history,
      visitor_id: visitorId,
    },
    { headers },
  )
  return data
}

export async function getNeoSuggestions(): Promise<string[]> {
  try {
    const { data } = await api.get<{ suggestions: string[] }>('/neo/suggestions')
    return data.suggestions || []
  } catch {
    return [
      'How does the Socratic tutor work?',
      'What math topics are covered?',
      'How do I upload handwritten work?',
      'How do parent progress alerts work?',
    ]
  }
}


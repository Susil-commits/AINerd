import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mic, MicOff, Send, Volume2, LayoutDashboard, Lightbulb } from 'lucide-react'
import { streamMessage } from '../lib/api'
import { useSpeechInput, useTTS } from '../hooks/useVoice'
import WorkUpload from '../components/WorkUpload'
import ThinkingTrace from '../components/ThinkingTrace'
import MasteryRadar from '../components/MasteryRadar'
import type { SessionData, Problem, Diagnosis } from '../lib/api'
import './TutorSession.css'

interface Message {
  role: 'student' | 'tutor' | 'system'
  content: string
  timestamp: Date
}

export default function TutorSession() {
  const navigate = useNavigate()
  const [session, setSession] = useState<SessionData | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([])
  const [masteryState, setMasteryState] = useState<Record<string, number>>({})
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const { isSpeaking, speak } = useTTS()
  const { isListening, interimText, startListening, stopListening, isSupported } = useSpeechInput(
    (text) => { setInput(text) }
  )

  // Load session from sessionStorage
  useEffect(() => {
    const raw = sessionStorage.getItem('session')
    if (!raw) { navigate('/'); return }
    const s: SessionData = JSON.parse(raw)
    setSession(s)
    setMasteryState(s.mastery_state)
    setCurrentProblem(s.current_problem)
    setMessages([
      { role: 'system', content: `Session started for ${s.student_name}`, timestamp: new Date() },
      { role: 'tutor', content: s.welcome_message, timestamp: new Date() },
    ])
    speak(s.welcome_message)
  }, [navigate])

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const sendMessage = useCallback(() => {
    if (!input.trim() || !session || isStreaming) return
    const userMsg: Message = { role: 'student', content: input.trim(), timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setThinkingSteps([])
    setIsStreaming(true)

    let responseAcc = ''
    const botMsg: Message = { role: 'tutor', content: '', timestamp: new Date() }

    setMessages(prev => [...prev, botMsg])

    streamMessage(
      session.session_id,
      userMsg.content,
      (step) => setThinkingSteps(prev => [...prev, step]),
      (text, _done) => {
        responseAcc = text
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { ...botMsg, content: text }
          return updated
        })
      },
      (newMastery) => {
        if (newMastery && Object.keys(newMastery).length) setMasteryState(newMastery)
        setIsStreaming(false)
        if (responseAcc) speak(responseAcc)
      },
    )
  }, [input, session, isStreaming, speak])

  const handleRequestHint = useCallback(() => {
    if (!session || isStreaming) return
    const hintPrompt = "I'm feeling a bit stuck on this step. Can you give me a small guiding hint to help me think about the first step without telling me the answer?"
    const userMsg: Message = { role: 'student', content: "💡 I'm stuck. Can I get a hint?", timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setThinkingSteps([])
    setIsStreaming(true)

    let responseAcc = ''
    const botMsg: Message = { role: 'tutor', content: '', timestamp: new Date() }
    setMessages(prev => [...prev, botMsg])

    streamMessage(
      session.session_id,
      hintPrompt,
      (step) => setThinkingSteps(prev => [...prev, step]),
      (text, _done) => {
        responseAcc = text
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { ...botMsg, content: text }
          return updated
        })
      },
      (newMastery) => {
        if (newMastery && Object.keys(newMastery).length) setMasteryState(newMastery)
        setIsStreaming(false)
        if (responseAcc) speak(responseAcc)
      },
    )
  }, [session, isStreaming, speak])

  const handleDiagnosis = (d: Diagnosis, mastery: Record<string, number>, next: Problem | null) => {
    setMasteryState(mastery)
    if (next) setCurrentProblem(next)
    const tutorMsg: Message = { role: 'tutor', content: d.corrective_question, timestamp: new Date() }
    setMessages(prev => [...prev, tutorMsg])
    speak(d.corrective_question)
  }

  const masterySkills = Object.entries(masteryState).map(([skill_id, prob]) => ({
    skill_id,
    name: skill_id,
    mastery_prob: prob,
  }))

  if (!session) return <div className="session-loading">Loading session…</div>

  return (
    <div className="session-layout">
      {/* ── Left sidebar: problem + upload ── */}
      <aside className="session-sidebar">
        <div className="session-header-mini">
          <span className="badge badge-violet">🎓 {session.student_name}</span>
          <button
            className="btn btn-ghost"
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            onClick={() => navigate(`/dashboard/${session.student_id}`)}
            aria-label="View learning dashboard"
          >
            <LayoutDashboard size={14} /> Dashboard
          </button>
        </div>

        {currentProblem && (
          <div className="problem-card card animate-fadein">
            <div className="problem-header">
              <span className="badge badge-amber">Skill: {currentProblem.skill_id}</span>
              <span className="difficulty-dots">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={`dot ${i < currentProblem.difficulty ? 'active' : ''}`} />
                ))}
              </span>
            </div>
            <h3>{currentProblem.title}</h3>
            <p className="problem-text">{currentProblem.text}</p>
          </div>
        )}

        <WorkUpload
          sessionId={session.session_id}
          onThinking={(step) => setThinkingSteps(prev => [...prev, step])}
          onDiagnosis={handleDiagnosis}
        />
      </aside>

      {/* ── Main chat ── */}
      <main className="session-main">
        <div className="chat-messages">
          {messages.map((msg, i) => (
            msg.role === 'system' ? null : (
              <div key={i} className={`chat-bubble ${msg.role} animate-fadein`}>
                {msg.role === 'tutor' && (
                  <div className="tutor-avatar">🤖</div>
                )}
                <div className="bubble-body">
                  <p className="bubble-text">{msg.content || <span className="typing">…</span>}</p>
                  <span className="bubble-time">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            )
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Voice waveform indicator */}
        {isListening && (
          <div className="voice-indicator">
            <div className="waveform">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="wave-bar" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
            <span>{interimText || 'Listening…'}</span>
          </div>
        )}

        {/* Action bar for stuck-student hint affordance */}
        <div className="chat-actions-bar">
          <button
            className="btn-hint"
            onClick={handleRequestHint}
            disabled={isStreaming || isListening}
            aria-label="Request a hint from the tutor"
            title="Ask the tutor for a small guiding hint without giving away the answer"
          >
            <Lightbulb size={14} /> Need a hint?
          </button>
        </div>

        {/* Input area */}
        <div className="chat-input-area">
          <button
            className={`btn ${isListening ? 'btn-amber' : 'btn-ghost'} voice-btn ${!isSupported ? 'voice-btn--disabled' : ''}`}
            onClick={!isSupported ? undefined : (isListening ? stopListening : startListening)}
            disabled={!isSupported || isStreaming}
            title={
              !isSupported
                ? 'Voice input is supported in Chrome & Edge (Web Speech API). Please type your answer!'
                : isListening
                ? 'Stop listening'
                : 'Speak your answer'
            }
            aria-label={
              !isSupported
                ? 'Voice input not supported in this browser'
                : isListening
                ? 'Stop listening to voice'
                : 'Speak your answer with microphone'
            }
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          <input
            className="input chat-input"
            placeholder={isSupported ? "Type your answer, or use the mic…" : "Type your answer here…"}
            value={isListening ? interimText : input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            disabled={isListening || isStreaming}
            aria-label="Type your math answer or reasoning"
          />

          <button
            className="btn btn-primary"
            onClick={sendMessage}
            disabled={!input.trim() || isStreaming || isListening}
            aria-label="Send answer to tutor"
          >
            {isStreaming ? <span className="spinner" /> : <Send size={18} />}
          </button>

          {isSpeaking && (
            <div className="speaking-badge" role="status">
              <Volume2 size={14} /> Speaking
            </div>
          )}
        </div>
      </main>

      {/* ── Right sidebar: live intelligence (reasoning trace + mastery radar) ── */}
      <aside className="session-mastery">
        <div className="intel-header">
          <div className="intel-title-row">
            <span className="live-pulse-dot" />
            <span className="intel-title">LIVE PROGRESS</span>
          </div>
          <span className="intel-caption">Tutor Guidance & Skill Map</span>
        </div>

        <ThinkingTrace steps={thinkingSteps} isActive={isStreaming} />

        <MasteryRadar skills={masterySkills} />
      </aside>
    </div>
  )
}

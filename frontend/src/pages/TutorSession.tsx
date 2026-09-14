import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { streamMessage, startSession, fetchNextProblem } from '../lib/api'
import { useSpeechInput, useTTS } from '../hooks/useVoice'
import { useAuth } from '../context/AuthContext'
import WorkUpload from '../components/WorkUpload'
import ThinkingTrace from '../components/ThinkingTrace'
import MasteryRadar from '../components/MasteryRadar'
import ThemeToggle from '../components/ThemeToggle'
import { getSkillMeta } from '../lib/skillsData'
import type { SessionData, Problem, Diagnosis } from '../lib/api'
import './TutorSession.css'

interface Message {
  role: 'student' | 'tutor' | 'system'
  content: string
  timestamp: Date
}

function formatSkillName(id: string): string {
  const map: Record<string, string> = {
    fractions_add_unlike: 'Adding Fractions',
    fractions_multiply: 'Multiplying Fractions',
    equations_linear_1step: '1-Step Equations',
    equations_linear_2step: '2-Step Equations',
    word_problems_ratios: 'Ratios & Proportions',
    geometry_area_perimeter: 'Area & Perimeter',
    '3.OA.A.1': 'Multiplication',
    '3.OA.A.2': 'Division',
    '3.OA.D.8': 'Two-Step Word Problems',
    '4.NF.A.1': 'Equivalent Fractions',
    '4.NF.B.3': 'Adding Fractions',
    '4.NF.B.4': 'Fractions & Whole Numbers',
    '5.NF.B.7': 'Dividing Fractions',
    '6.EE.A.2': 'Algebraic Expressions',
    '6.EE.B.7': 'One-Step Equations',
    '7.EE.B.4': 'Multi-Step Equations',
  }
  if (map[id]) return map[id]
  return id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function renderMessageContent(content: string) {
  if (!content?.trim()) return <span className="typing">…</span>
  const lines = content.split('\n')
  return lines.map((line, lineIdx) => {
    const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g)
    return (
      <span key={lineIdx}>
        {parts.map((part, partIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={partIdx}>{part.slice(2, -2)}</strong>
          }
          if (part.startsWith('*') && part.endsWith('*')) {
            return <em key={partIdx}>{part.slice(1, -1)}</em>
          }
          if (part.startsWith('`') && part.endsWith('`')) {
            return <code key={partIdx} style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 4px', borderRadius: '4px' }}>{part.slice(1, -1)}</code>
          }
          return part
        })}
        {lineIdx < lines.length - 1 && <br />}
      </span>
    )
  })
}

export default function TutorSession() {
  const navigate = useNavigate()
  const { user, signOut, role, loading: authLoading } = useAuth()
  const [session, setSession] = useState<SessionData | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([])
  const [masteryState, setMasteryState] = useState<Record<string, number>>({})
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null)
  const [problemSolved, setProblemSolved] = useState(false)
  const [isLoadingNextProblem, setIsLoadingNextProblem] = useState(false)
  const [sessionError, setSessionError] = useState<string | null>(null)
  const [sessionRetryCount, setSessionRetryCount] = useState(0)
  const [mobileTab, setMobileTab] = useState<'chat' | 'problem' | 'progress'>('chat')
  const chatEndRef = useRef<HTMLDivElement>(null)

  const { isSpeaking, speak, stop } = useTTS()
  // Stabilize `speak` ref to prevent session init from re-running on every TTS state change
  const speakRef = useRef(speak)
  useEffect(() => { speakRef.current = speak }, [speak])
  const stableSpeak = useCallback((text: string) => speakRef.current(text), [])
  const { isListening, interimText, startListening, stopListening, isSupported } = useSpeechInput(
    (text) => { setInput(text) }
  )

  const [warmupBadge, setWarmupBadge] = useState<{ score: number; total: number } | null>(() => {
    try {
      const rawBadge = sessionStorage.getItem('veritas_warmup_badge')
      if (rawBadge) {
        sessionStorage.removeItem('veritas_warmup_badge')
        const data = JSON.parse(rawBadge)
        if (data && typeof data.score === 'number') {
          return { score: data.score, total: data.total }
        }
      }
    } catch {}
    return null
  })

  useEffect(() => {
    if (!warmupBadge) return
    const t = setTimeout(() => setWarmupBadge(null), 3500)
    return () => clearTimeout(t)
  }, [warmupBadge])

  // Load session from sessionStorage or initialize from logged-in user
  useEffect(() => {
    let mounted = true

    async function initSession() {
      if (authLoading) return
      setSessionError(null)
      const raw = sessionStorage.getItem('session')
      if (raw) {
        try {
          const s: SessionData = JSON.parse(raw)
          if (s && s.session_id) {
            // Only reuse the cached session if it explicitly belongs to the current user
            if (user && s.student_id && s.student_id === user.id) {
              setSession(s)
              document.title = `Veritas — Math Practice (${s.student_name})`
              setMasteryState(s.mastery_state || {})
              setCurrentProblem(s.current_problem || null)
              // Rehydrate chat history if reloading an active session
              const savedChatRaw = sessionStorage.getItem(`veritas_chat_${s.session_id}`)
              if (savedChatRaw) {
                try {
                  const savedChat = JSON.parse(savedChatRaw)
                  if (Array.isArray(savedChat) && savedChat.length > 0) {
                    setMessages(savedChat.map((m: any) => ({
                      ...m,
                      timestamp: new Date(m.timestamp),
                    })))
                    return
                  }
                } catch {}
              }

              setMessages([
                { role: 'system', content: `Session started for ${s.student_name}`, timestamp: new Date() },
                { role: 'tutor', content: s.welcome_message, timestamp: new Date() },
              ])
              stableSpeak(s.welcome_message)
              return
            } else {
              // Mismatched or unauthenticated cached session token: purge to prevent token reuse
              sessionStorage.removeItem('session')
            }
          }
        } catch {}
      }

      // If user is authenticated, start session directly with their user.id
      if (user) {
        const studentName = user.user_metadata?.name || user.email?.split('@')[0] || 'Student'
        return startSession(studentName, user.id, user.email)
          .then((s) => {
            if (!mounted) return
            sessionStorage.setItem('session', JSON.stringify(s))
            setSession(s)
            document.title = `Veritas — Math Practice (${s.student_name})`
            setMasteryState(s.mastery_state || {})
            setCurrentProblem(s.current_problem || null)
            setMessages([
              { role: 'system', content: `Session started for ${s.student_name}`, timestamp: new Date() },
              { role: 'tutor', content: s.welcome_message, timestamp: new Date() },
            ])
            stableSpeak(s.welcome_message)
          })
          .catch((e) => {
            console.error('Could not auto-start session:', e)
            if (mounted) {
              setSessionError('Could not start your tutoring session right now. Please try again.')
            }
          })
      }

      if (mounted) {
        navigate('/')
      }
    }

    initSession().catch((e) => {
      console.error('initSession unexpected error:', e)
    })
    return () => { mounted = false }
  }, [navigate, user, authLoading, stableSpeak, sessionRetryCount])

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  // Persist conversation messages for session reload resilience
  useEffect(() => {
    if (session?.session_id && messages.length > 0) {
      try {
        sessionStorage.setItem(`veritas_chat_${session.session_id}`, JSON.stringify(messages))
      } catch {}
    }
  }, [session?.session_id, messages])

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
      (newMastery, solved) => {
        if (newMastery && Object.keys(newMastery).length) setMasteryState(newMastery)
        if (solved) setProblemSolved(true)
        setIsStreaming(false)
        if (responseAcc) stableSpeak(responseAcc)
      },
      (_err) => {
        setIsStreaming(false)
        const errorContent = "I had trouble connecting just now. Please try sending your message again!"
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { ...botMsg, content: errorContent }
          return updated
        })
      },
    )
  }, [input, session, isStreaming, stableSpeak])

  const handleRequestHint = useCallback(() => {
    if (!session || isStreaming) return
    const hintPrompt = "I'm feeling a bit stuck on this step. Can you give me a small guiding hint to help me think about the first step without telling me the answer?"
    const userMsg: Message = { role: 'student', content: "I'm stuck. Can I get a hint?", timestamp: new Date() }
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
        if (responseAcc) stableSpeak(responseAcc)
      },
      (_err) => {
        setIsStreaming(false)
        const errorContent = "I had trouble connecting just now. Please try requesting a hint again!"
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { ...botMsg, content: errorContent }
          return updated
        })
      },
    )
  }, [session, isStreaming, stableSpeak])

  const handleNextProblem = useCallback(async (markCorrect: boolean = true) => {
    if (!session?.session_id || isLoadingNextProblem) return
    setIsLoadingNextProblem(true)
    try {
      const res = await fetchNextProblem(session.session_id, markCorrect)
      if (res && res.current_problem) {
        setCurrentProblem(res.current_problem)
        setMasteryState(res.mastery_state || {})
        setProblemSolved(false)
        const tutorMsg: Message = {
          role: 'tutor',
          content: res.tutor_message,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, tutorMsg])
        stableSpeak(res.tutor_message)
      }
    } catch (err) {
      console.error('Failed to fetch next problem:', err)
    } finally {
      setIsLoadingNextProblem(false)
    }
  }, [session?.session_id, isLoadingNextProblem, stableSpeak])

  const handleDiagnosis = (d: Diagnosis, mastery: Record<string, number>, next: Problem | null) => {
    setMasteryState(mastery)
    if (next) {
      setCurrentProblem(next)
      setProblemSolved(false)
    }
    const tutorMsg: Message = { role: 'tutor', content: d.corrective_question, timestamp: new Date() }
    setMessages(prev => [...prev, tutorMsg])
    stableSpeak(d.corrective_question)
  }

  const masterySkills = Object.entries(masteryState).map(([skill_id, prob]) => {
    const meta = getSkillMeta(skill_id)
    return {
      skill_id,
      name: meta.title,
      mastery_prob: prob,
    }
  })

  if (!session) {
    if (sessionError) {
      return (
        <div className="session-error-container">
          <div className="session-error-card">
            <span className="session-error-icon">⚠️</span>
            <h3>Session Connection Error</h3>
            <p>{sessionError}</p>
            <div className="session-error-actions">
              <button
                className="btn btn-violet"
                onClick={() => setSessionRetryCount(c => c + 1)}
              >
                Retry Starting Session
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => navigate('/')}
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      )
    }
    return <div className="session-loading">Loading session…</div>
  }

  return (
    <div className="session-layout">
      {warmupBadge && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          background: 'linear-gradient(135deg, rgba(22, 101, 52, 0.95), rgba(15, 23, 42, 0.98))',
          border: '1px solid #34D399',
          borderRadius: '12px',
          padding: '10px 18px',
          color: '#FFFFFF',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5), 0 0 16px rgba(52, 211, 153, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.9rem',
          fontWeight: 600,
          animation: 'fadein 0.3s ease-out',
        }}>
          <span>🔥</span>
          <span>Warm-up score: <strong>{warmupBadge.score}/{warmupBadge.total}</strong> — ready to learn!</span>
        </div>
      )}

      {/* ── Mobile Top Header & Segmented Tab Navigation (<= 1024px) ── */}
      <div className="session-mobile-nav">
        <div className="session-header-mini session-header-mini--mobile">
          <div className="session-header-top-row">
            <span className="badge badge-violet">{session.student_name}</span>
            <ThemeToggle />
          </div>
          <div className="session-header-actions-row">
            {role === 'parent' && (
              <button
                className="btn btn-ghost"
                style={{ padding: '5px 8px', fontSize: '0.74rem' }}
                onClick={() => {
                  stop()
                  navigate('/parent-dashboard')
                }}
                title="Go to Parent Portal"
              >
                Parent Portal
              </button>
            )}
            <button
              className="btn btn-ghost"
              style={{ padding: '5px 8px', fontSize: '0.74rem' }}
              onClick={() => {
                stop()
                navigate(`/dashboard/${session.student_id}`)
              }}
              aria-label="View learning dashboard"
              title="View Student Progress Dashboard"
            >
              Dashboard
            </button>
            {user && (
              <button
                className="btn btn-ghost"
                style={{ padding: '5px 8px', fontSize: '0.74rem' }}
                onClick={() => {
                  stop()
                  if (session?.session_id) {
                    sessionStorage.removeItem(`veritas_chat_${session.session_id}`)
                  }
                  sessionStorage.removeItem('session')
                  signOut()
                    .then(() => navigate('/'))
                    .catch((err) => {
                      console.error('Sign out error:', err)
                      navigate('/')
                    })
                }}
                aria-label="Sign out"
                title="Sign out"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>

        <div className="mobile-session-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mobileTab === 'chat'}
            className={`mobile-tab-btn ${mobileTab === 'chat' ? 'mobile-tab-btn--active' : ''}`}
            onClick={() => setMobileTab('chat')}
          >
            <span>💬</span> Tutor Chat
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mobileTab === 'problem'}
            className={`mobile-tab-btn ${mobileTab === 'problem' ? 'mobile-tab-btn--active' : ''}`}
            onClick={() => setMobileTab('problem')}
          >
            <span>📝</span> Problem & Work
            {currentProblem && <span className="mobile-tab-indicator" />}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mobileTab === 'progress'}
            className={`mobile-tab-btn ${mobileTab === 'progress' ? 'mobile-tab-btn--active' : ''}`}
            onClick={() => setMobileTab('progress')}
          >
            <span>📊</span> Skill Map
          </button>
        </div>
      </div>

      {/* ── Left sidebar: problem + upload ── */}
      <aside className={`session-sidebar ${mobileTab !== 'problem' ? 'mobile-hidden' : ''}`}>
        <div className="session-header-mini session-header-mini--desktop">
          <div className="session-header-top-row">
            <span className="badge badge-violet">{session.student_name}</span>
            <ThemeToggle />
          </div>
          <div className="session-header-actions-row">
            {role === 'parent' && (
              <button
                className="btn btn-ghost"
                style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                onClick={() => {
                  stop()
                  navigate('/parent-dashboard')
                }}
                title="Go to Parent Portal"
              >
                Parent Portal
              </button>
            )}
            <button
              className="btn btn-ghost"
              style={{ padding: '5px 10px', fontSize: '0.78rem' }}
              onClick={() => {
                stop()
                navigate(`/dashboard/${session.student_id}`)
              }}
              aria-label="View learning dashboard"
              title="View Student Progress Dashboard"
            >
              Dashboard
            </button>
            {user && (
              <button
                className="btn btn-ghost"
                style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                onClick={() => {
                  stop()
                  if (session?.session_id) {
                    sessionStorage.removeItem(`veritas_chat_${session.session_id}`)
                  }
                  sessionStorage.removeItem('session')
                  signOut()
                    .then(() => navigate('/'))
                    .catch((err) => {
                      console.error('Sign out error:', err)
                      navigate('/')
                    })
                }}
                aria-label="Sign out"
                title="Sign out"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>

        {currentProblem && (
          <div className="problem-card card animate-fadein">
            <div className="problem-header">
              <span className="badge badge-amber">Skill: {formatSkillName(currentProblem.skill_id)}</span>
              <span className="difficulty-dots">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={`dot ${i < currentProblem.difficulty ? 'active' : ''}`} />
                ))}
              </span>
            </div>
            <h3>{currentProblem.title}</h3>
            <p className="problem-text">{currentProblem.text}</p>
            
            <div className="problem-card-actions">
              <button
                type="button"
                className="btn btn-primary problem-action-btn"
                onClick={() => handleNextProblem(true)}
                disabled={isLoadingNextProblem || isStreaming}
                title="Advance to the next tailored practice problem"
              >
                {isLoadingNextProblem ? <span className="spinner" /> : 'Next Problem →'}
              </button>
              <button
                type="button"
                className="btn btn-ghost problem-action-btn problem-action-btn--skip"
                onClick={() => handleNextProblem(false)}
                disabled={isLoadingNextProblem || isStreaming}
                title="Try a different practice problem"
              >
                Skip Problem
              </button>
            </div>
          </div>
        )}

        <WorkUpload
          sessionId={session.session_id}
          onThinking={(step) => setThinkingSteps(prev => [...prev, step])}
          onDiagnosis={handleDiagnosis}
        />

        <div className="mobile-only-return-chat">
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={() => setMobileTab('chat')}
          >
            ← Return to Tutor Chat
          </button>
        </div>
      </aside>

      {/* ── Main chat ── */}
      <main className={`session-main ${mobileTab !== 'chat' ? 'mobile-hidden' : ''}`}>
        {/* Mobile sticky mini-problem banner */}
        {currentProblem && (
          <div className="mobile-problem-banner" onClick={() => setMobileTab('problem')}>
            <div className="mobile-problem-banner-left">
              <span className="badge badge-amber">{formatSkillName(currentProblem.skill_id)}</span>
              <span className="mobile-problem-banner-title">{currentProblem.title}</span>
            </div>
            <span className="mobile-problem-banner-action">View Work & Camera →</span>
          </div>
        )}

        <div className="chat-messages">
          {messages.map((msg, i) => (
            msg.role === 'system' ? null : (
              <div key={i} className={`chat-bubble ${msg.role} animate-fadein`}>
                {msg.role === 'tutor' && (
                  <div className="tutor-avatar">AI</div>
                )}
                <div className="bubble-body">
                  <p className="bubble-text">{renderMessageContent(msg.content)}</p>
                  <span className="bubble-time">
                    {(msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            )
          ))}
          {problemSolved && (
            <div className="problem-solved-banner animate-fadein">
              <div className="solved-banner-info">
                <span className="solved-banner-badge">🎉 Problem Solved!</span>
                <p className="solved-banner-text">Great math thinking! Ready to take on the next challenge?</p>
              </div>
              <button
                type="button"
                className="btn btn-primary solved-banner-action"
                onClick={() => handleNextProblem(true)}
                disabled={isLoadingNextProblem}
              >
                {isLoadingNextProblem ? <span className="spinner" /> : 'Next Problem →'}
              </button>
            </div>
          )}
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

        {/* Action bar for stuck-student hint affordance & mute speaking */}
        <div className="chat-actions-bar">
          <div className="chat-actions-left">
            <button
              className="btn-hint"
              onClick={handleRequestHint}
              disabled={isStreaming || isListening}
              aria-label="Request a hint from the tutor"
              title="Ask the tutor for a small guiding hint without giving away the answer"
            >
              Need a hint?
            </button>
            <button
              className="btn-advance-problem"
              onClick={() => handleNextProblem(true)}
              disabled={isStreaming || isLoadingNextProblem}
              aria-label="Move to next problem"
              title="Ready for the next problem"
            >
              {isLoadingNextProblem ? 'Loading…' : 'Next Problem →'}
            </button>
          </div>
          {isSpeaking && (
            <button
              className="btn-stop-speaking animate-fadein"
              onClick={stop}
              aria-label="Stop tutor voice"
              title="Stop tutor from speaking"
            >
              🔇 Stop Voice
            </button>
          )}
        </div>

        {/* Input area */}
        <div className="chat-input-area">
          <button
            className={`btn ${isListening ? 'btn-amber' : 'btn-ghost'} voice-btn ${!isSupported ? 'voice-btn--disabled' : ''}`}
            onClick={!isSupported ? undefined : (isListening ? stopListening : startListening)}
            disabled={!isSupported || isStreaming}
            title={
              !isSupported
                ? 'Voice input is supported in Chrome & Edge browsers. Please type your answer!'
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
            {isListening ? 'Mute' : 'Mic'}
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
            {isStreaming ? <span className="spinner" /> : 'Send'}
          </button>

          {isSpeaking && (
            <div className="speaking-badge" role="status">
              Speaking
            </div>
          )}
        </div>
      </main>

      {/* ── Right sidebar: live intelligence (reasoning trace + mastery radar) ── */}
      <aside className={`session-mastery ${mobileTab !== 'progress' ? 'mobile-hidden' : ''}`}>
        <div className="intel-header">
          <div className="intel-title-row">
            <span className="live-pulse-dot" />
            <span className="intel-title">LIVE PROGRESS</span>
          </div>
          <span className="intel-caption">Tutor Guidance & Skill Map</span>
        </div>

        <ThinkingTrace steps={thinkingSteps} isActive={isStreaming} />

        <MasteryRadar skills={masterySkills} />

        <div className="mobile-only-return-chat">
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={() => setMobileTab('chat')}
          >
            ← Return to Tutor Chat
          </button>
        </div>
      </aside>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brain, Mic, Camera, BarChart3, ChevronRight, Zap, Sparkles } from 'lucide-react'
import { startSession, checkHealth } from '../lib/api'
import AnimatedIntro from '../components/AnimatedIntro'
import SocraticPreview from '../components/SocraticPreview'
import './Landing.css'

const STATS = [
  { value: '3', label: 'Smart AI Helpers', icon: <Brain size={20} /> },
  { value: '10', label: 'Core Math Topics', icon: <BarChart3 size={20} /> },
  { value: '20+', label: 'Practice Problems', icon: <ChevronRight size={20} /> },
  { value: 'Instant', label: 'Step-by-Step Feedback', icon: <Zap size={20} /> },
]

const FEATURES = [
  {
    icon: '🎓',
    title: 'The Socratic Tutor',
    desc: 'Never just hands you the answer. Asks friendly guiding questions that help you solve problems on your own.',
  },
  {
    icon: '📷',
    title: 'Paper Work Reader',
    desc: 'Snap a picture of your handwritten work. It checks each step and pinpoints tricky spots — like flipped signs or mixed-up fractions.',
  },
  {
    icon: '📊',
    title: 'Real Progress Tracker',
    desc: 'Watches how you grow across every math topic so you always practice problems that are just the right challenge.',
  },
]

type ConnStatus = 'checking' | 'connected' | 'waking_up' | 'error'

export default function Landing() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Animated intro portal control
  const [showIntro, setShowIntro] = useState(() => {
    return sessionStorage.getItem('ainerd_intro_seen') !== 'true'
  })

  // Simple server & database connection status
  const [connStatus, setConnStatus] = useState<ConnStatus>('checking')
  const [connMessage, setConnMessage] = useState<string>('Checking server connection...')

  const checkConnection = async (): Promise<boolean> => {
    try {
      const data = await checkHealth()
      if (data && data.status === 'ok') {
        setConnStatus('connected')
        setConnMessage(data.db ? 'Server & database ready' : 'Server ready')
        return true
      } else {
        setConnStatus('waking_up')
        setConnMessage('Waking up server... please wait a moment')
        return false
      }
    } catch {
      setConnStatus('waking_up')
      setConnMessage('Waking up server from inactivity (15-30s)... please wait')
      return false
    }
  }

  useEffect(() => {
    let mounted = true
    let timer: any = null
    let retries = 0

    const poll = async () => {
      const ready = await checkConnection()
      if (!mounted) return
      if (!ready) {
        retries++
        if (retries < 25) {
          timer = setTimeout(poll, 2500)
        } else {
          setConnStatus('error')
          setConnMessage('Server offline or taking too long.')
        }
      }
    }

    poll()

    return () => {
      mounted = false
      if (timer) clearTimeout(timer)
    }
  }, [])

  const [pendingStart, setPendingStart] = useState(false)

  const handleStart = async (overrideName?: string) => {
    const studentName = (overrideName ?? name).trim()
    if (!studentName) { setError('Please enter your name to start!'); return }

    if (connStatus !== 'connected') {
      // Optimistic queue: wait for server to connect and automatically enter
      setPendingStart(true)
      setLoading(true)
      setError('')
      const isReady = await checkConnection()
      if (!isReady) {
        setLoading(false)
        setPendingStart(false)
        setError('Server is waking up. Please try clicking Start again in a few seconds!')
        return
      }
    }

    setLoading(true)
    setError('')
    try {
      const session = await startSession(studentName)
      sessionStorage.setItem('session', JSON.stringify(session))
      navigate('/session')
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? 'Could not connect to server. Make sure the backend is running.')
    } finally {
      setLoading(false)
      setPendingStart(false)
    }
  }

  return (
    <>
      {/* Animated Entrance Portal (Opens animately on first arrival or replay) */}
      {showIntro && (
        <AnimatedIntro
          onEnter={() => {
            setShowIntro(false)
            sessionStorage.setItem('ainerd_intro_seen', 'true')
          }}
        />
      )}

      {/* Top Glassmorphic Navigation Bar */}
      <header className="landing-navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            <span className="brand-icon">📐</span>
            <span className="brand-name">AINerd<span className="brand-dot">.</span></span>
            <span className="brand-tag">Socratic Math</span>
          </div>

          <nav className="navbar-links">
            <a href="#demo" className="nav-link">Interactive Demo</a>
            <a href="#how-it-works" className="nav-link">How It Works</a>
            <a href="#topics" className="nav-link">Math Topics</a>
          </nav>

          <div className="navbar-actions">
            <button
              className="replay-intro-btn"
              onClick={() => setShowIntro(true)}
              aria-label="Replay animated intro experience"
            >
              <Sparkles size={14} className="sparkle-accent" />
              <span>Experience Intro</span>
            </button>

            <div className={`nav-conn-pill nav-conn-pill--${connStatus}`}>
              <span className="conn-dot" />
              <span className="conn-pill-text">
                {connStatus === 'connected' ? 'Ready' : connStatus === 'waking_up' ? 'Waking Up…' : 'Connecting…'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="landing">
      {/* Hero */}
      <section className="hero">
        <h1 className="hero-headline">
          The Math Tutor That<br />
          <span className="gradient-text">Guides Your Thinking.</span>
        </h1>

        <p className="hero-sub">
          An encouraging math tutor that spots where you get stuck — asking helpful questions so you learn the concepts and solve problems on your own.
        </p>

        {/* Simple Connection Status */}
        <div className={`conn-status conn-status--${connStatus}`}>
          <span className="conn-dot" />
          <span>{connMessage}</span>
          {connStatus === 'error' && (
            <button
              className="conn-retry-btn"
              onClick={() => {
                setConnStatus('checking')
                setConnMessage('Reconnecting to server...')
                checkConnection()
              }}
            >
              Retry
            </button>
          )}
        </div>

        {/* Start form */}
        <div className="start-form">
          <input
            className="input"
            placeholder="What's your name?"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !loading && handleStart()}
            maxLength={40}
            disabled={loading}
            aria-label="Student name"
          />
          <button
            className="btn btn-amber"
            onClick={() => handleStart()}
            disabled={loading}
            aria-label="Start Learning math tutoring session"
          >
            {loading ? (
              pendingStart ? 'Connecting & Starting…' : 'Starting…'
            ) : connStatus === 'error' ? (
              'Server Offline'
            ) : (
              <>Start Learning <ChevronRight size={18} /></>
            )}
          </button>
        </div>
        {error && <p className="error-msg">{error}</p>}

        {/* Stats */}
        <div className="stats-grid">
          {STATS.map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Socratic Demo Showcase */}
      <section id="demo" className="demo-section">
        <SocraticPreview />
      </section>

      {/* Features */}
      <section id="features" className="features">
        {FEATURES.map(f => (
          <div key={f.title} className="feature-card card">
            <div className="feature-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </section>

      {/* How it works & 3 Helpers */}
      <section id="how-it-works" className="architecture-section">
        <div className="section-header">
          <span className="badge badge-indigo">How It Works</span>
          <h2>How AI Nerd Helps You Learn</h2>
          <p className="section-sub">
            Three smart helpers work together to guide your math practice, check your handwritten work, and find the perfect next problem.
          </p>
        </div>

        <div className="agents-grid">
          <div className="agent-card card">
            <div className="agent-header">
              <span className="agent-tag badge badge-violet">Helper 1 · Conversation</span>
              <h3>🎓 The Friendly Tutor</h3>
            </div>
            <p className="agent-desc">
              Guides your thinking with warm, step-by-step questions. Instead of giving away the solution, it prompts you to notice patterns and discover the answer yourself.
            </p>
            <div className="agent-feature">
              <span>Approach</span> Never gives away answers; asks one helpful question at a time
            </div>
          </div>

          <div className="agent-card card">
            <div className="agent-header">
              <span className="agent-tag badge badge-amber">Helper 2 · Homework Checker</span>
              <h3>📷 Handwritten Work Reader</h3>
            </div>
            <p className="agent-desc">
              Snap a quick picture of your paper math work. It reads your handwriting, verifies each line of working, and points out where a step went off track.
            </p>
            <div className="agent-feature">
              <span>Checks</span> Flipped signs, denominator additions, and calculation errors
            </div>
          </div>

          <div className="agent-card card">
            <div className="agent-header">
              <span className="agent-tag badge badge-emerald">Helper 3 · Practice Guide</span>
              <h3>📚 Smart Problem Finder</h3>
            </div>
            <p className="agent-desc">
              Chooses the next problem tailored to how well you understand the topic. When you're cruising, it adds a fun challenge; when you're stuck, it gives you an easier practice step.
            </p>
            <div className="agent-feature">
              <span>Pacing</span> Keeps problems at just the right challenge level
            </div>
          </div>

          <div className="agent-card card card-highlight">
            <div className="agent-header">
              <span className="agent-tag badge badge-indigo">Progress Engine</span>
              <h3>📈 Live Skill Tracker</h3>
            </div>
            <p className="agent-desc">
              Keeps a live map of your skills as you practice. Every completed problem updates your progress so parents, teachers, and you can see real growth across fractions, word problems, and equations.
            </p>
            <div className="agent-feature">
              <span>Feedback</span> Updates instantly after each problem attempt
            </div>
          </div>
        </div>

        {/* Pipeline flow */}
        <div className="pipeline-strip card">
          <span className="pipeline-label">HOW EACH PRACTICE STEP WORKS:</span>
          <div className="pipeline-steps">
            {[
              { icon: <Mic size={18} />, label: 'Student Voice / Text', color: 'var(--violet)' },
              { icon: '🧠', label: 'Tutor Thinks & Guides', color: 'var(--indigo)' },
              { icon: <Camera size={18} />, label: 'Checks Paper Work Photo', color: 'var(--amber)' },
              { icon: <BarChart3 size={18} />, label: 'Updates Your Skill Map', color: 'var(--emerald)' },
            ].map((step, i) => (
              <div key={i} className="pipeline-step-item">
                <span className="step-badge" style={{ borderColor: step.color }}>{step.icon}</span>
                <span className="step-name">{step.label}</span>
                {i < 3 && <span className="step-arrow">→</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Classroom Aligned & Standards */}
      <section className="research-section">
        <div className="section-header">
          <span className="badge badge-emerald">Classroom Aligned</span>
          <h2>Built on Proven Math Learning Standards</h2>
          <p className="section-sub">
            AI Nerd is modeled around real classroom math curricula and common student learning patterns.
          </p>
        </div>

        <div className="citations-grid">
          <div className="citation-card card">
            <div className="citation-header">
              <span className="citation-icon">📈</span>
              <h4>Real Student Practice Data</h4>
            </div>
            <p>
              Calibrated with over 55,000 real student practice sessions across fraction, equation, and arithmetic topics to make sure the tutor advances skills at a natural pace.
            </p>
            <span className="citation-source">Student Learning Data (55,000+ Sessions)</span>
          </div>

          <div className="citation-card card">
            <div className="citation-header">
              <span className="citation-icon">🔬</span>
              <h4>Common Mistake Patterns</h4>
            </div>
            <p>
              Recognizes typical elementary and middle school tricky spots — like adding fraction denominators together or flipping negative signs.
            </p>
            <span className="citation-source">Math Misconception Research</span>
          </div>

          <div className="citation-card card">
            <div className="citation-header">
              <span className="citation-icon">📐</span>
              <h4>Step-by-Step Word Problems</h4>
            </div>
            <p>
              Breaks multi-step word problems into manageable bites so students learn how to set up equations and solve with confidence.
            </p>
            <span className="citation-source">Multi-Step Math Problem Bank</span>
          </div>

          <div className="citation-card card">
            <div className="citation-header">
              <span className="citation-icon">🎯</span>
              <h4>Grade-Level Standards</h4>
            </div>
            <p>
              Aligned directly with standard elementary and middle school Common Core math standards (Grades 3 to 7) matching classroom curricula.
            </p>
            <span className="citation-source">Common Core Math Standards (CCSS-M)</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <p className="footer-lead">
            <strong>AI Nerd</strong> · Friendly, Step-by-Step Math Tutoring for Kids
          </p>
          <p className="footer-meta">
            Powered by Google Gemini · Voice & Vision · Aligned with Classroom Math Standards
          </p>
        </div>
      </footer>
    </div>
    </>
  )
}

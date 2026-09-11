import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brain, Mic, Camera, BarChart3, Sparkles, ChevronRight, Zap } from 'lucide-react'
import { startSession } from '../lib/api'
import './Landing.css'

const STATS = [
  { value: '3', label: 'Specialized Agents', icon: <Brain size={20} /> },
  { value: '10', label: 'Tracked Skills', icon: <BarChart3 size={20} /> },
  { value: '20+', label: 'Curated Problems', icon: <Sparkles size={20} /> },
  { value: 'Real-time', label: 'Misconception Detection', icon: <Zap size={20} /> },
]

const FEATURES = [
  {
    icon: '🎓',
    title: 'Socratic Tutor',
    desc: 'Never gives the answer. Asks guiding questions that help students discover solutions themselves.',
  },
  {
    icon: '🔬',
    title: 'Deep Diagnosis',
    desc: 'OCRs handwritten work and names the exact misconception — not "wrong," but "denominator addition error."',
  },
  {
    icon: '📊',
    title: 'Bayesian Mastery',
    desc: 'Tracks skill mastery with a calibrated probability model — an auditable number teachers can trust.',
  },
]

export default function Landing() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleStart = async () => {
    if (!name.trim()) { setError('Please enter your name to start!'); return }
    setLoading(true)
    setError('')
    try {
      const session = await startSession(name.trim())
      // Store session in sessionStorage for TutorSession to pick up
      sessionStorage.setItem('session', JSON.stringify(session))
      navigate('/session')
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? 'Could not connect to server. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="landing">
      {/* Hero */}
      <section className="hero">
        <div className="hero-badge badge badge-violet">
          <Sparkles size={12} /> AI-Powered Math Tutoring
        </div>

        <h1 className="hero-headline">
          The tutor that never<br />
          <span className="gradient-text">gives the answer.</span>
        </h1>

        <p className="hero-sub">
          A multi-agent Socratic tutor that diagnoses <em>exactly</em> where your thinking
          broke — and adapts what it teaches next using a real mastery model.
        </p>

        {/* Start form */}
        <div className="start-form">
          <input
            className="input"
            placeholder="What's your name?"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleStart()}
            maxLength={40}
          />
          <button className="btn btn-amber" onClick={handleStart} disabled={loading}>
            {loading ? 'Starting…' : 'Start Learning'} <ChevronRight size={18} />
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

      {/* Features */}
      <section className="features">
        {FEATURES.map(f => (
          <div key={f.title} className="feature-card card">
            <div className="feature-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section className="pipeline">
        <h2>How It Works</h2>
        <div className="pipeline-steps">
          {[
            { icon: <Mic size={22} />, label: 'You speak or type', color: 'var(--violet)' },
            { icon: '🧠', label: 'LangGraph orchestrates 3 agents', color: 'var(--indigo)' },
            { icon: <Camera size={22} />, label: 'Gemini Vision reads your work', color: 'var(--amber)' },
            { icon: <BarChart3 size={22} />, label: 'BKT updates mastery live', color: 'var(--emerald)' },
          ].map((step, i) => (
            <div key={i} className="pipeline-step">
              <div className="pipeline-dot" style={{ background: step.color, boxShadow: `0 0 20px ${step.color}` }}>
                {step.icon}
              </div>
              <p>{step.label}</p>
              {i < 3 && <div className="pipeline-arrow">→</div>}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>Built for the Nerdy Hackathon · Powered by Gemini + LangGraph + Supabase</p>
      </footer>
    </div>
  )
}

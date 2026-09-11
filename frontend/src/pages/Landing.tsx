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

      {/* How it works & 3 Agents */}
      <section className="architecture-section">
        <div className="section-header">
          <span className="badge badge-indigo">Multi-Agent System & Cognitive Science</span>
          <h2>How AI Nerd Works: 3 Agents + Calibrated BKT</h2>
          <p className="section-sub">
            Built as an autonomous LangGraph pipeline where specialized agents communicate through a shared Bayesian state.
          </p>
        </div>

        <div className="agents-grid">
          <div className="agent-card card">
            <div className="agent-header">
              <span className="agent-tag badge badge-violet">Agent 1 · Dialogue</span>
              <h3>🎓 Socratic Tutor Agent</h3>
            </div>
            <p className="agent-desc">
              Powered by <strong>Gemini 3.6 Flash</strong>. Strictly adheres to Socratic prompting: it is barred from giving the answer or next step, instead asking targeted guiding questions that lead the student to their own realization.
            </p>
            <div className="agent-feature">
              <span>Rule</span> Never reveals solutions; asks ONE question at a time
            </div>
          </div>

          <div className="agent-card card">
            <div className="agent-header">
              <span className="agent-tag badge badge-amber">Agent 2 · Multimodal</span>
              <h3>🔬 Vision Diagnostic Agent</h3>
            </div>
            <p className="agent-desc">
              Reads photos of raw handwritten paper work via <strong>Gemini Vision</strong>. It compares the work against expected solution steps to locate the exact step and name the specific cognitive misconception.
            </p>
            <div className="agent-feature">
              <span>Taxonomy</span> Grounded in the Eedi/NeurIPS diagnostic dataset
            </div>
          </div>

          <div className="agent-card card">
            <div className="agent-header">
              <span className="agent-tag badge badge-emerald">Agent 3 · Retrieval</span>
              <h3>📚 Adaptive Content Agent</h3>
            </div>
            <p className="agent-desc">
              Retrieves problems via <strong>pgvector semantic embeddings</strong> filtered by the student's target skill gap and difficulty level, keeping learning squarely in Vygotsky's Zone of Proximal Development (ZPD).
            </p>
            <div className="agent-feature">
              <span>Targeting</span> Consolidates weak skills; challenges mastered areas
            </div>
          </div>

          <div className="agent-card card card-highlight">
            <div className="agent-header">
              <span className="agent-tag badge badge-indigo">Cognitive Engine</span>
              <h3>📊 Calibrated BKT Engine</h3>
            </div>
            <p className="agent-desc">
              Implements <strong>Bayesian Knowledge Tracing</strong> with parameters calibrated via maximum-likelihood estimation on <strong>55,000+ real student responses</strong> from the <strong>ASSISTments 2009–2010</strong> benchmark (across 6 core fraction and equation skills) paired with Corbett & Anderson baseline priors for early arithmetic. Unlike arbitrary LLM "scores", BKT computes mathematically sound, auditable mastery probabilities.
            </p>
            <div className="agent-feature">
              <span>Model</span> P(L_t+1) = P(L|obs) + (1 - P(L|obs)) · P(T)
            </div>
          </div>
        </div>

        {/* Pipeline flow */}
        <div className="pipeline-strip card">
          <span className="pipeline-label">LIVE EXECUTION LOOP:</span>
          <div className="pipeline-steps">
            {[
              { icon: <Mic size={18} />, label: 'Student Speech / Text', color: 'var(--violet)' },
              { icon: '🧠', label: 'LangGraph Orchestrator', color: 'var(--indigo)' },
              { icon: <Camera size={18} />, label: 'Gemini Vision OCR', color: 'var(--amber)' },
              { icon: <BarChart3 size={18} />, label: 'Calibrated BKT Shift', color: 'var(--emerald)' },
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

      {/* Research Grounding & Data Sources */}
      <section className="research-section">
        <div className="section-header">
          <span className="badge badge-emerald">Real Research · Not Vibes</span>
          <h2>Empirical Benchmarks & Data Provenance</h2>
          <p className="section-sub">
            AI Nerd is grounded in standard educational data mining datasets and peer-reviewed cognitive science literature.
          </p>
        </div>

        <div className="citations-grid">
          <div className="citation-card card">
            <div className="citation-header">
              <span className="citation-icon">📈</span>
              <h4>ASSISTments Benchmark (Fitted)</h4>
            </div>
            <p>
              Priors and learning transitions calibrated via Maximum Likelihood Estimation on 55,455 real student interaction logs from the ASSISTments 2009–2010 Skill Builder dataset (WPI / CAHLR) across 6 core fraction and equation skills, combined with standard cognitive tutor baselines.
            </p>
            <span className="citation-source">WPI Educational Data Mining (2009–2010)</span>
          </div>

          <div className="citation-card card">
            <div className="citation-header">
              <span className="citation-icon">🔬</span>
              <h4>Eedi Misconception Taxonomy</h4>
            </div>
            <p>
              Diagnostic agent classifies errors into empirically validated misconception categories (sign flips, denominator additions, operation confusion) from the NeurIPS 2020 Education Challenge.
            </p>
            <span className="citation-source">NeurIPS 2020 Diagnostic Math Challenge</span>
          </div>

          <div className="citation-card card">
            <div className="citation-header">
              <span className="citation-icon">📐</span>
              <h4>GSM8K Multi-Step Reasoning</h4>
            </div>
            <p>
              Problem decomposition patterns and step verification chains adapted from OpenAI's Grade School Math 8K benchmark to enforce multi-step Socratic scaffolding.
            </p>
            <span className="citation-source">Cobbe et al., OpenAI (2021)</span>
          </div>

          <div className="citation-card card">
            <div className="citation-header">
              <span className="citation-icon">🎯</span>
              <h4>Common Core Standards</h4>
            </div>
            <p>
              Skills are formally tagged to Common Core State Standards (CCSS-M: 3.OA, 4.NF, 6.EE, 7.EE) ensuring pedagogical alignment with standard K-12 math curricula.
            </p>
            <span className="citation-source">National Governors Association (CCSS-M)</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <p className="footer-lead">
            <strong>AI Nerd</strong> · Multimodal Socratic Math Tutoring with Calibrated Bayesian Knowledge Tracing
          </p>
          <p className="footer-meta">
            Powered by Google Gemini 3.6 Flash · LangGraph · Supabase pgvector · BKT Calibrated on ASSISTments 2009–2010 & Eedi
          </p>
        </div>
      </footer>
    </div>
  )
}

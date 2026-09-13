import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { checkHealth } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import AnimatedIntro from '../components/AnimatedIntro'
import SocraticPreview from '../components/SocraticPreview'
import './Landing.css'

const STATS = [
  { value: '3', label: 'Smart AI Helpers' },
  { value: '10', label: 'Core Math Topics' },
  { value: '20+', label: 'Practice Problems' },
  { value: 'Instant', label: 'Step-by-Step Feedback' },
]

const FEATURES = [
  {
    title: 'The Socratic Tutor',
    desc: 'Never just hands you the answer. Asks friendly guiding questions that help you solve problems on your own.',
    tag: 'Socratic Method',
  },
  {
    title: 'Paper Work Reader',
    desc: 'Snap a picture of your handwritten work. It checks each step and pinpoints tricky spots — like flipped signs or mixed-up fractions.',
    tag: 'Paper Scanner',
  },
  {
    title: 'Real Progress Tracker',
    desc: 'Watches how you grow across every math topic so you always practice problems that are just the right challenge.',
    tag: 'Adaptive Mastery',
  },
]

const MATH_TOPICS = [
  {
    id: '3.OA.A.1',
    grade: 'Grade 3',
    name: 'Understanding Multiplication',
    desc: 'Connecting equal groups, arrays, and repeated addition to build rock-solid number sense.',
    example: '3 groups of 4 apples = 12',
    tag: 'Foundations',
  },
  {
    id: '3.OA.A.2',
    grade: 'Grade 3',
    name: 'Understanding Division',
    desc: 'Sharing quantities into equal piles and discovering how division is multiplication in reverse.',
    example: '15 stickers shared by 3 friends = 5 each',
    tag: 'Foundations',
  },
  {
    id: '3.OA.D.8',
    grade: 'Grade 3',
    name: 'Two-Step Word Problems',
    desc: 'Breaking tricky real-world scenarios into step 1 and step 2 without getting overwhelmed.',
    example: 'Earned $10, bought $4 juice, saved the rest',
    tag: 'Word Problems',
  },
  {
    id: '4.NF.A.1',
    grade: 'Grade 4',
    name: 'Equivalent Fractions',
    desc: 'Seeing why 1/2 is the same amount of pizza as 2/4 or 4/8 using visual area models.',
    example: '2/3 = 4/6 = 8/12',
    tag: 'Fractions',
  },
  {
    id: '4.NF.B.3',
    grade: 'Grade 4',
    name: 'Adding & Subtracting Fractions',
    desc: 'Finding common denominators and discovering why you never add denominators together.',
    example: '1/3 + 1/6 = 2/6 + 1/6 = 3/6 = 1/2',
    tag: 'Fractions',
  },
  {
    id: '4.NF.B.4',
    grade: 'Grade 4',
    name: 'Multiplying Fractions by Whole Numbers',
    desc: 'Scaling recipes, measuring ingredients, and repeated fraction additions.',
    example: '3 × (2/5) = 6/5 = 1 1/5',
    tag: 'Fractions',
  },
  {
    id: '5.NF.B.7',
    grade: 'Grade 5',
    name: 'Dividing Fractions',
    desc: 'Understanding how many fractional slices fit into a whole unit using intuitive visual models.',
    example: 'How many 1/4 cups in 2 cups? 2 ÷ 1/4 = 8',
    tag: 'Fractions',
  },
  {
    id: '6.EE.A.2',
    grade: 'Grade 6',
    name: 'Algebraic Expressions',
    desc: 'Translating written math phrases into algebraic expressions with variables and constants.',
    example: '"5 less than twice a number" → 2n - 5',
    tag: 'Algebra',
  },
  {
    id: '6.EE.B.7',
    grade: 'Grade 6',
    name: 'Solving One-Step Equations',
    desc: 'Balancing the scales: using inverse operations to isolate variables with confidence.',
    example: 'x + 7 = 15 → x = 8',
    tag: 'Algebra',
  },
  {
    id: '7.EE.B.4',
    grade: 'Grade 7',
    name: 'Solving Multi-Step Equations',
    desc: 'Combining like terms, distributing, and keeping track of negative signs on both sides.',
    example: '3(x - 4) + 2 = 14 → x = 8',
    tag: 'Algebra',
  },
]

type ConnStatus = 'checking' | 'connected' | 'waking_up' | 'error'

export default function Landing() {
  const navigate = useNavigate()
  const {
    user,
    role,
    setRole,
    sendMagicLink,
    verifyOtp,
    demoSignIn,
    signOut,
    rememberedProfile,
  } = useAuth()
  const [email, setEmail] = useState('')
  const [magicLinkEmail, setMagicLinkEmail] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  // Standout modern auth states
  const [authScreen, setAuthScreen] = useState<'form' | 'otp'>('form')
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', ''])
  const [resendTimer, setResendTimer] = useState(45)
  const [rememberedDismissed, setRememberedDismissed] = useState(false)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  // Resend OTP countdown
  useEffect(() => {
    let interval: any = null
    if (authScreen === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [authScreen, resendTimer])

  // Animated intro portal control
  const [showIntro, setShowIntro] = useState(() => {
    return sessionStorage.getItem('veritas_intro_seen') !== 'true' && sessionStorage.getItem('ainerd_intro_seen') !== 'true'
  })

  // Simple server & database connection status
  const [connStatus, setConnStatus] = useState<ConnStatus>('checking')
  const [connMessage, setConnMessage] = useState<string>('Connecting to learning space...')

  const checkConnection = async (): Promise<boolean> => {
    try {
      const data = await checkHealth()
      if (data && data.status === 'ok') {
        setConnStatus('connected')
        setConnMessage('Learning platform ready')
        return true
      } else {
        setConnStatus('waking_up')
        setConnMessage('Connecting to learning space... please wait a moment')
        return false
      }
    } catch {
      setConnStatus('waking_up')
      setConnMessage('Connecting to learning space... please wait a moment')
      return false
    }
  }

  useEffect(() => {
    document.title = "Veritas — The Math Tutor That Guides Your Thinking"
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
          setConnMessage('Connection taking longer than expected. Please refresh.')
        }
      }
    }

    poll()

    return () => {
      mounted = false
      if (timer) clearTimeout(timer)
    }
  }, [])

  // On verified login (Magic Link callback in URL hash/query), redirect to role destination
  useEffect(() => {
    const hasAuthToken = window.location.hash.includes('access_token') || window.location.search.includes('code')
    if (user && hasAuthToken) {
      if (role === 'parent') {
        navigate('/parent-dashboard')
      } else {
        navigate('/student-session')
      }
    }
  }, [user, role, navigate])

  const handleApplyDomain = (domain: string) => {
    const trimmed = email.trim()
    if (!trimmed) {
      setEmail(`student${domain}`)
    } else if (trimmed.includes('@')) {
      const prefix = trimmed.split('@')[0]
      setEmail(`${prefix}${domain}`)
    } else {
      setEmail(`${trimmed}${domain}`)
    }
    setAuthError('')
  }

  const handleFastResume = async () => {
    if (!rememberedProfile) return
    setAuthLoading(true)
    setAuthError('')
    await demoSignIn(rememberedProfile.role, rememberedProfile.email)
    setAuthLoading(false)
    if (rememberedProfile.role === 'parent') {
      navigate('/parent-dashboard')
    } else {
      navigate('/student-session')
    }
  }

  const handleSendMagicLinkOrOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed || !trimmed.includes('@')) {
      setAuthError('Please enter a valid email address.')
      return
    }
    setAuthLoading(true)
    setAuthError('')
    const res = await sendMagicLink(trimmed, role)
    setAuthLoading(false)
    if (res.error) {
      setAuthError(res.error)
    } else {
      setMagicLinkEmail(trimmed)
      setAuthScreen('otp')
      setResendTimer(45)
    }
  }

  const handleVerifyOtpCode = async (codeToVerify: string) => {
    const cleanCode = codeToVerify.trim()
    if (cleanCode.length !== 6) {
      setAuthError('Please enter all 6 digits of the verification code.')
      return
    }
    setAuthLoading(true)
    setAuthError('')
    const targetEmail = magicLinkEmail || email || (role === 'parent' ? 'parent.sarah@veritas.dev' : 'student.alex@veritas.dev')
    const res = await verifyOtp(targetEmail, cleanCode, role)
    setAuthLoading(false)
    if (res.error) {
      setAuthError(res.error)
    } else {
      if (role === 'parent') {
        navigate('/parent-dashboard')
      } else {
        navigate('/student-session')
      }
    }
  }

  const handleOtpChange = (index: number, val: string) => {
    const char = val.slice(-1)
    const nextDigits = [...otpDigits]
    nextDigits[index] = char
    setOtpDigits(nextDigits)
    setAuthError('')

    if (char && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }

    const fullCode = nextDigits.join('')
    if (fullCode.length === 6 && !nextDigits.includes('')) {
      handleVerifyOtpCode(fullCode)
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').trim().replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    const next = [...otpDigits]
    for (let i = 0; i < 6; i++) {
      next[i] = pasted[i] || ''
    }
    setOtpDigits(next)
    if (pasted.length === 6) {
      handleVerifyOtpCode(pasted)
    } else {
      const firstEmpty = next.findIndex(d => !d)
      if (firstEmpty !== -1) {
        otpRefs.current[firstEmpty]?.focus()
      }
    }
  }

  const handleAutofillOtp = (code: string, targetRole: 'student' | 'parent') => {
    setRole(targetRole)
    const digits = code.split('')
    setOtpDigits(digits)
    handleVerifyOtpCode(code)
  }

  const handleDemoLogin = async (targetRole: 'student' | 'parent') => {
    setAuthLoading(true)
    setAuthError('')
    await demoSignIn(targetRole)
    setAuthLoading(false)
    if (targetRole === 'parent') {
      navigate('/parent-dashboard')
    } else {
      navigate('/student-session')
    }
  }

  const handleEnterSession = () => {
    if (role === 'parent') {
      navigate('/parent-dashboard')
    } else {
      navigate('/student-session')
    }
  }

  return (
    <>
      {/* Animated Entrance Portal (Opens animately on first arrival or replay) */}
      {showIntro && (
        <AnimatedIntro
          onEnter={() => {
            setShowIntro(false)
            sessionStorage.setItem('veritas_intro_seen', 'true')
          }}
        />
      )}

      {/* Top Glassmorphic Navigation Bar */}
      <header className="landing-navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            <span className="brand-icon">✨</span>
            <span className="brand-name">Veritas<span className="brand-dot">.</span></span>
            <span className="brand-tag">Socratic Math</span>
          </div>

          <nav className="navbar-links">
            <a href="#demo" className="nav-link">Interactive Demo</a>
            <a href="#how-it-works" className="nav-link">How It Works</a>
            <a href="#topics" className="nav-link">Math Topics</a>
          </nav>

          {user && (
            <div className="navbar-actions">
              <button className="btn btn-sm btn-violet" onClick={handleEnterSession}>
                {role === 'parent' ? 'Parent Portal' : 'Math Session'}
              </button>
            </div>
          )}
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

        {/* Server Connection Status - only shown while connecting or on error; invisible once online */}
        {connStatus !== 'connected' && (
          <div className={`conn-status conn-status--${connStatus}`}>
            <span className="conn-dot" />
            <span>{connMessage}</span>
            {connStatus === 'error' && (
              <button
                className="conn-retry-btn"
                onClick={() => {
                  setConnStatus('checking')
                  setConnMessage('Connecting to learning space...')
                  checkConnection()
                }}
              >
                Retry
              </button>
            )}
          </div>
        )}

        {/* Modern Standout Split-Card Auth */}
        <div className="auth-card-container" id="auth-card">
          {user ? (
            <div className="auth-logged-in-card animate-fadein">
              <div className="logged-in-badge">
                <span className="logged-in-avatar">{role === 'parent' ? 'P' : 'S'}</span>
                <div>
                  <div className="logged-in-title">Signed In as <strong>{user.email}</strong></div>
                  <div className="logged-in-role">Active Role: <span className="badge badge-violet">{role === 'parent' ? 'Parent' : 'Student'}</span></div>
                </div>
              </div>
              <div className="logged-in-actions">
                <button
                  className="btn btn-violet btn-lg"
                  onClick={handleEnterSession}
                >
                  {role === 'parent' ? 'Enter Parent Dashboard' : 'Start Practice Session'}
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={async () => {
                    await signOut()
                    setEmail('')
                    setAuthScreen('form')
                  }}
                >
                  Switch Account / Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="auth-split-card">
              {/* Left Panel */}
              <div className="auth-card-left">
                <div className="auth-brand-row">
                  <span className="auth-brand-badge">AUTH</span>
                  <span className="auth-brand-name">Veritas<span className="auth-brand-dot">.</span></span>
                  <span className="auth-security-pill">
                    <span>Safe Socratic Auth</span>
                  </span>
                </div>

                {/* 1. Fast Account Switcher / Remembered Profile */}
                {rememberedProfile && !rememberedDismissed ? (
                  <div className="auth-remembered-card animate-fadein">
                    <div className="remembered-header">
                      <span className="remembered-avatar">{rememberedProfile.role === 'parent' ? 'P' : 'S'}</span>
                      <div className="remembered-info">
                        <div className="remembered-name-row">
                          <span className="remembered-name">{rememberedProfile.name}</span>
                          <span className="badge badge-violet">{rememberedProfile.role === 'parent' ? 'Parent' : 'Student'}</span>
                        </div>
                        <div className="remembered-email">{rememberedProfile.email}</div>
                      </div>
                    </div>
                    <div className="remembered-actions">
                      <button
                        type="button"
                        className="btn btn-violet btn-sm remembered-continue-btn"
                        onClick={handleFastResume}
                        disabled={authLoading}
                      >
                        Continue as {rememberedProfile.name.split(' ')[0]}
                      </button>
                      <button
                        type="button"
                        className="remembered-switch-btn"
                        onClick={() => setRememberedDismissed(true)}
                      >
                        Use another account
                      </button>
                    </div>
                  </div>
                ) : null}

                {/* 2. Main Login Form or OTP Verification Screen */}
                {authScreen === 'otp' ? (
                  <div className="auth-otp-screen animate-fadein">
                    <div className="otp-header-row">
                      <button
                        type="button"
                        className="otp-back-btn"
                        onClick={() => {
                          setAuthScreen('form')
                          setAuthError('')
                        }}
                      >
                        Change Email
                      </button>
                      <span className="otp-email-chip">{magicLinkEmail || email}</span>
                    </div>

                    <h2 className="auth-greeting">
                      Security Code<br />
                      <span className="auth-greeting-sub">Verification</span>
                    </h2>
                    <p className="auth-tagline">Enter the 6-digit one-time code sent to your email.</p>

                    <div className="otp-inputs-grid">
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => { otpRefs.current[idx] = el }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          className={`otp-digit-input ${digit ? 'otp-digit-input--filled' : ''}`}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          onPaste={handleOtpPaste}
                          disabled={authLoading}
                          autoFocus={idx === 0}
                        />
                      ))}
                    </div>

                    {authError && <p className="auth-error-banner">{authError}</p>}

                    <button
                      type="button"
                      className="btn-signin-gradient"
                      onClick={() => handleVerifyOtpCode(otpDigits.join(''))}
                      disabled={authLoading || otpDigits.join('').length !== 6}
                    >
                      {authLoading ? 'Verifying Code…' : 'Verify & Launch Session'}
                    </button>

                    {/* Quick Demo Access Codes */}
                    <div className="otp-evaluator-box">
                      <span className="evaluator-label">Quick Demo Access Codes:</span>
                      <div className="evaluator-chips-grid">
                        <button
                          type="button"
                          className="evaluator-code-btn evaluator-code-student"
                          onClick={() => handleAutofillOtp('777888', 'student')}
                        >
                          Student Demo: <code>777888</code>
                        </button>
                        <button
                          type="button"
                          className="evaluator-code-btn evaluator-code-parent"
                          onClick={() => handleAutofillOtp('123456', 'parent')}
                        >
                          Parent Demo: <code>123456</code>
                        </button>
                      </div>
                    </div>

                    <div className="otp-resend-row">
                      {resendTimer > 0 ? (
                        <span className="otp-timer-text">Resend new code in <strong>{resendTimer}s</strong></span>
                      ) : (
                        <button
                          type="button"
                          className="otp-resend-link"
                          onClick={() => handleSendMagicLinkOrOtp()}
                          disabled={authLoading}
                        >
                          Resend verification code
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="animate-fadein">
                    <h2 className="auth-greeting">
                      Holla,<br />
                      <span className="auth-greeting-sub">Welcome Back</span>
                    </h2>
                    <p className="auth-tagline">Hey, welcome back to your learning space</p>

                    <form onSubmit={handleSendMagicLinkOrOtp} className="auth-form-body">
                      <div className="auth-field-group">
                        <div className="auth-label-row">
                          <label htmlFor="auth-email-input">Email Address</label>
                          <span className="auth-helper-tag">Passwordless</span>
                        </div>
                        <div className="auth-input-wrapper">
                          <input
                            id="auth-email-input"
                            type="email"
                            className="auth-text-input"
                            placeholder="student.alex@veritas.dev"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value)
                              setAuthError('')
                            }}
                            required
                            disabled={authLoading}
                          />
                        </div>

                        {/* Interactive Domain Suggestion Chips */}
                        <div className="auth-domain-chips">
                          <span className="domain-chips-hint">Quick fill:</span>
                          {['@gmail.com', '@icloud.com', '@outlook.com', '@school.edu'].map((dom) => (
                            <button
                              key={dom}
                              type="button"
                              className="domain-chip-btn"
                              onClick={() => handleApplyDomain(dom)}
                            >
                              {dom}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="auth-field-group">
                        <label>Select Your Learning Role</label>
                        <div className="auth-role-tabs">
                          <button
                            type="button"
                            className={`auth-role-tab ${role === 'student' ? 'auth-role-tab--active' : ''}`}
                            onClick={() => setRole('student')}
                          >
                            <div className="role-tab-text">
                              <span className="role-tab-title">Student</span>
                              <span className="role-tab-desc">Socratic math tutor</span>
                            </div>
                          </button>

                          <button
                            type="button"
                            className={`auth-role-tab ${role === 'parent' ? 'auth-role-tab--active' : ''}`}
                            onClick={() => setRole('parent')}
                          >
                            <div className="role-tab-text">
                              <span className="role-tab-title">Parent</span>
                              <span className="role-tab-desc">Live radar & history</span>
                            </div>
                          </button>
                        </div>
                      </div>

                      {authError && <p className="auth-error-banner">{authError}</p>}

                      <div className="auth-submit-row">
                        <button
                          type="submit"
                          className="btn-signin-gradient"
                          disabled={authLoading}
                          id="magic-link-submit-btn"
                        >
                          {authLoading ? 'Sending Secure Code…' : 'Sign In with Magic Link / OTP'}
                        </button>

                        <button
                          type="button"
                          className="auth-enter-pin-toggle"
                          onClick={() => {
                            setAuthScreen('otp')
                            setAuthError('')
                          }}
                        >
                          Already have a 6-digit code? Enter code
                        </button>
                      </div>

                      {/* Quick Demo Access */}
                      <div className="auth-demo-section">
                        <span className="demo-label">Instant Demo Preview:</span>
                        <div className="demo-buttons-grid">
                          <button
                            type="button"
                            className="demo-pill-btn demo-pill-parent"
                            onClick={() => handleDemoLogin('parent')}
                          >
                            Demo as Parent
                          </button>
                          <button
                            type="button"
                            className="demo-pill-btn demo-pill-student"
                            onClick={() => handleDemoLogin('student')}
                          >
                            Demo as Student
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              {/* Right Panel: Socratic Learning Space Photo Showcase */}
              <div className="auth-card-right auth-card-photo-side">
                <div className="photo-side-image-wrapper">
                  <img
                    src="/student_math_learning.jpg"
                    alt="Student actively learning math with Veritas Socratic tutor"
                    className="photo-side-img"
                  />
                  <div className="photo-side-overlay" />
                </div>

                <div className="photo-side-content">
                  <span className="photo-side-badge">Socratic Learning Space</span>
                  <h3 className="photo-side-title">Think. Reason.<br />Master Math.</h3>
                  <p className="photo-side-desc">
                    Veritas never just gives away solutions. It guides your thinking step-by-step with encouraging questions so you discover patterns and build genuine understanding.
                  </p>
                  <div className="photo-side-chips">
                    <span className="photo-chip">Voice & Vision Scanner</span>
                    <span className="photo-chip">Adaptive Skill Mastery</span>
                    <span className="photo-chip">Student Privacy Protected</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Platform Safety & Compliance Trust Strip */}
          <div className="auth-trust-strip">
            <div className="trust-item">
              <div className="trust-text">
                <strong>FERPA & COPPA Child Safe</strong>
                <span>Zero tracking, student privacy protected</span>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-text">
                <strong>End-to-End Encryption</strong>
                <span>Safe passwordless student & parent access</span>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-text">
                <strong>Account Protection Active</strong>
                <span>Intelligent account & spam protection</span>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-text">
                <strong>Socratic AI Guardrails</strong>
                <span>Encourages independent thinking & never spoils answers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          {STATS.map(s => (
            <div key={s.label} className="stat-card">
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
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </section>

      {/* How it works & 3 Helpers */}
      <section id="how-it-works" className="architecture-section">
        <div className="section-header">
          <span className="badge badge-indigo">How It Works</span>
          <h2>How Veritas Helps You Learn</h2>
          <p className="section-sub">
            Three smart helpers work together to guide your math practice, check your handwritten work, and find the perfect next problem.
          </p>
        </div>

        <div className="agents-grid">
          <div className="agent-card card">
            <div className="agent-header">
              <span className="agent-tag badge badge-violet">Helper 1 · Conversation</span>
              <h3>The Friendly Tutor</h3>
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
              <h3>Handwritten Work Reader</h3>
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
              <h3>Smart Problem Finder</h3>
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
              <h3>Live Skill Tracker</h3>
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
              { step: '1', label: 'Student Voice / Text', color: 'var(--violet)' },
              { step: '2', label: 'Tutor Thinks & Guides', color: 'var(--indigo)' },
              { step: '3', label: 'Checks Paper Work Photo', color: 'var(--amber)' },
              { step: '4', label: 'Updates Your Skill Map', color: 'var(--emerald)' },
            ].map((stepItem, i) => (
              <div key={i} className="pipeline-step-item">
                <span className="step-badge" style={{ borderColor: stepItem.color }}>Step {stepItem.step}</span>
                <span className="step-name">{stepItem.label}</span>
                {i < 3 && <span className="step-arrow">→</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10 Core Math Topics Section */}
      <section id="topics" className="topics-section">
        <div className="section-header">
          <span className="badge badge-violet">Curriculum Topics</span>
          <h2>10 Core Math Topics You Can Master</h2>
          <p className="section-sub">
            From multiplication and visual fractions to multi-step algebra, practice with problems calibrated directly to standard classroom curricula.
          </p>
        </div>

        <div className="topics-grid">
          {MATH_TOPICS.map(topic => (
            <div key={topic.id} className="topic-card card">
              <div className="topic-card-top">
                <span className="topic-standard">{topic.id}</span>
                <span className="topic-grade">{topic.grade}</span>
              </div>
              <h3 className="topic-title">{topic.name}</h3>
              <p className="topic-desc">{topic.desc}</p>
              <div className="topic-example">
                <span className="example-tag">Sample:</span>
                <code>{topic.example}</code>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Classroom Aligned & Standards */}
      <section className="research-section">
        <div className="section-header">
          <span className="badge badge-emerald">Classroom Aligned</span>
          <h2>Built on Proven Math Learning Standards</h2>
          <p className="section-sub">
            Veritas is modeled around real classroom math curricula and common student learning patterns.
          </p>
        </div>

        <div className="citations-grid">
          <div className="citation-card card">
            <div className="citation-header">
              <h4>Real Student Practice Data</h4>
            </div>
            <p>
              Calibrated with over 55,000 real student practice sessions across fraction, equation, and arithmetic topics to make sure the tutor advances skills at a natural pace.
            </p>
            <span className="citation-source">Student Learning Data (55,000+ Sessions)</span>
          </div>

          <div className="citation-card card">
            <div className="citation-header">
              <h4>Common Mistake Patterns</h4>
            </div>
            <p>
              Recognizes typical elementary and middle school tricky spots — like adding fraction denominators together or flipping negative signs.
            </p>
            <span className="citation-source">Math Misconception Research</span>
          </div>

          <div className="citation-card card">
            <div className="citation-header">
              <h4>Step-by-Step Word Problems</h4>
            </div>
            <p>
              Breaks multi-step word problems into manageable bites so students learn how to set up equations and solve with confidence.
            </p>
            <span className="citation-source">Multi-Step Math Problem Bank</span>
          </div>

          <div className="citation-card card">
            <div className="citation-header">
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
            <strong>Veritas</strong> · Friendly, Step-by-Step Math Tutoring for Kids
          </p>
          <p className="footer-meta">
            Voice & Vision · Aligned with Classroom Math Standards
          </p>
        </div>
      </footer>
    </div>
    </>
  )
}

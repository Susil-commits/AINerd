import { useEffect, useRef, useState, useCallback } from 'react'
import './AnimatedIntro.css'

const MATH_GLYPHS = [
  { symbol: 'π', top: '15%', left: '12%', size: '1.8rem', delay: '0s', duration: '7s' },
  { symbol: '∑', top: '22%', left: '84%', size: '2.4rem', delay: '1s', duration: '9s' },
  { symbol: '√x', top: '72%', left: '10%', size: '1.9rem', delay: '2s', duration: '8s' },
  { symbol: '∞', top: '80%', left: '80%', size: '2.2rem', delay: '0.5s', duration: '10s' },
  { symbol: 'Δy/Δx', top: '35%', left: '6%', size: '1.4rem', delay: '1.5s', duration: '11s' },
  { symbol: '∫f(x)dx', top: '65%', left: '88%', size: '1.5rem', delay: '2.5s', duration: '9.5s' },
  { symbol: 'e^{iπ} + 1 = 0', top: '88%', left: '35%', size: '1.3rem', delay: '3s', duration: '12s' },
  { symbol: 'θ', top: '18%', left: '60%', size: '1.6rem', delay: '1.8s', duration: '8.5s' },
  { symbol: 'a² + b² = c²', top: '12%', left: '32%', size: '1.3rem', delay: '0.8s', duration: '10.5s' },
]

interface AnimatedIntroProps {
  onEnter: () => void
}

export default function AnimatedIntro({ onEnter }: AnimatedIntroProps) {
  const [isExiting, setIsExiting] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const hasExitedRef = useRef(false)

  const handleExit = useCallback(() => {
    if (hasExitedRef.current) return
    hasExitedRef.current = true
    setIsExiting(true)
    setTimeout(() => {
      onEnter()
    }, 750) // Transition duration matches CSS
  }, [onEnter])

  useEffect(() => {
    // Staggered text progression
    const t1 = setTimeout(() => setActiveStep(1), 400)
    const t2 = setTimeout(() => setActiveStep(2), 1200)
    const t3 = setTimeout(() => setActiveStep(3), 2000)

    // Implicitly auto-close intro after 30 seconds and enter the main website
    const autoExitTimer = setTimeout(() => {
      handleExit()
    }, 30000)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        handleExit()
      } else if (e.key === 'Escape') {
        handleExit()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(autoExitTimer)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleExit])

  return (
    <div className={`intro-portal ${isExiting ? 'intro-portal--exiting' : ''}`}>
      {/* Background Math Runes */}
      <div className="intro-math-field" aria-hidden="true">
        {MATH_GLYPHS.map((g, idx) => (
          <span
            key={idx}
            className="intro-math-glyph"
            style={{
              top: g.top,
              left: g.left,
              fontSize: g.size,
              animationDelay: g.delay,
              animationDuration: g.duration,
            }}
          >
            {g.symbol}
          </span>
        ))}
      </div>

      {/* Main Centerpiece */}
      <div className="intro-core-container">
        {/* Orbital Geometric Emblem */}
        <div className="intro-orbital-wrapper" aria-hidden="true">
          <div className="orbital-ring ring-outer" />
          <div className="orbital-ring ring-middle" />
          <div className="orbital-ring ring-inner" />
          <div className="orbital-satellite sat-1" />
          <div className="orbital-satellite sat-2" />
          <div className="orbital-satellite sat-3" />
          <div className="orbital-center-glow">
            <span className="orbital-core-dot" />
          </div>
        </div>

        {/* Cinematic Content */}
        <div className="intro-content">
          <div className={`intro-badge ${activeStep >= 1 ? 'revealed' : ''}`}>
            <span className="pulse-dot" />
            <span>AI SOCRATIC LEARNING PORTAL</span>
          </div>

          <h1 className={`intro-title ${activeStep >= 2 ? 'revealed' : ''}`}>
            Think. Reason.<br />
            <span className="intro-gradient-text">Master the Concept.</span>
          </h1>

          <p className={`intro-subtitle ${activeStep >= 3 ? 'revealed' : ''}`}>
            Every math problem is a puzzle. Every mistake is a stepping stone.
            Step inside a learning space where you discover how to solve, step by step.
          </p>

          <div className={`intro-action-box ${activeStep >= 3 ? 'revealed' : ''}`}>
            <button
              className="intro-enter-btn"
              onClick={handleExit}
              aria-label="Enter Veritas math platform"
            >
              <span className="btn-glow-layer" />
              <span className="btn-content">
                <span>Enter Veritas</span>
              </span>
            </button>
            <span className="intro-key-hint">or press <kbd>Space</kbd> / <kbd>Enter</kbd></span>
          </div>
        </div>
      </div>
    </div>
  )
}

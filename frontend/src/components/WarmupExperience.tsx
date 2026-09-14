// WarmupExperience.tsx — Engaging role-based mini-games & holding experience for cold-starts
import { useState, useEffect, useCallback, useMemo } from 'react'
import './WarmupExperience.css'

export interface WarmupExperienceProps {
  role: 'student' | 'parent'
  isReady: boolean
  isTimeout: boolean
  onComplete: (scoreData?: { score: number; total: number }) => void
  onRetry: () => void
  onDismiss: () => void
}

interface MathQuestion {
  question: string
  options: string[]
  correctIndex: number
  hint: string
}

interface ParentQuestion {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

const STUDENT_QUESTIONS: MathQuestion[] = [
  { question: '7 + 8 = ?', options: ['14', '15', '16', '13'], correctIndex: 1, hint: 'Think: 7 + 7 + 1' },
  { question: '12 × 4 = ?', options: ['46', '48', '52', '44'], correctIndex: 1, hint: '10 × 4 plus 2 × 4' },
  { question: '15 − 9 = ?', options: ['7', '5', '6', '8'], correctIndex: 2, hint: '15 − 10 + 1' },
  { question: '81 ÷ 9 = ?', options: ['8', '9', '7', '11'], correctIndex: 1, hint: '9 × ? = 81' },
  { question: '2³ = ?', options: ['6', '9', '8', '16'], correctIndex: 2, hint: '2 × 2 × 2' },
  { question: '14 + 27 = ?', options: ['39', '41', '42', '40'], correctIndex: 1, hint: '14 + 20 + 7' },
  { question: '100 − 37 = ?', options: ['63', '67', '73', '53'], correctIndex: 0, hint: '100 − 30 − 7' },
  { question: '6 × 7 = ?', options: ['48', '42', '36', '49'], correctIndex: 1, hint: '6 × 6 + 6' },
]

const PARENT_QUESTIONS: ParentQuestion[] = [
  {
    question: 'Which study habit produces the strongest long-term math retention?',
    options: [
      'Cramming 3 hours the night before a test',
      'Short 20-minute practice sessions spaced over a week',
      'Re-reading textbook chapters multiple times',
      'Highlighting every equation in neon colors',
    ],
    correctIndex: 1,
    explanation: 'Spaced repetition forces the brain to retrieve concepts just as they begin to fade, creating exponentially stronger neural pathways.',
  },
  {
    question: 'When a student gets stuck on a step, what response leads to the most durable learning?',
    options: [
      'Giving them the direct solution right away',
      'Asking a guiding question that helps them spot the discrepancy',
      'Moving them immediately to an unrelated topic',
      'Telling them speed matters more than understanding',
    ],
    correctIndex: 1,
    explanation: 'Socratic prompting activates self-monitoring. Students who self-correct retain math concepts 2.4x better than those given immediate answers.',
  },
  {
    question: 'What happens in the brain during "productive struggle" on a challenging problem?',
    options: [
      'Frustration permanently blocks memory formation',
      'New synaptic connections form as alternate strategies are evaluated',
      'Learning only begins once someone gives the solution',
      'Focus naturally drops after 30 seconds',
    ],
    correctIndex: 1,
    explanation: 'Cognitive science demonstrates that the brain grows and rewires most during the struggle before finding the solution.',
  },
  {
    question: 'How does "interleaved practice" (mixing problem types) benefit test performance?',
    options: [
      'It confuses students and should be avoided',
      'It trains students to recognize WHICH strategy to apply',
      'It is only useful for university-level calculus',
      'It increases study time with no measurable gain',
    ],
    correctIndex: 1,
    explanation: 'Blocked practice gives the method away in advance; interleaved practice teaches problem diagnosis, which is what real exams evaluate.',
  },
  {
    question: 'Which type of parental praise best fosters mathematical resilience?',
    options: [
      '"You are naturally gifted at math!"',
      '"I love how you tried three different strategies to untangle that step!"',
      '"Math is easy for our family!"',
      '"Don\'t worry, some people just aren\'t math people."',
    ],
    correctIndex: 1,
    explanation: 'Praising effort, persistence, and problem-solving strategies builds a growth mindset, while praising innate talent increases anxiety when difficulty rises.',
  },
  {
    question: 'What benefit does having a student verbalize their math reasoning provide?',
    options: [
      'It slows them down unnecessarily',
      'It offloads working memory and clarifies the logical sequence',
      'It is only effective for language arts',
      'It replaces the need for writing equations down',
    ],
    correctIndex: 1,
    explanation: 'Articulating mathematical reasoning engages the prefrontal cortex and helps students detect logical slips before committing them to paper.',
  },
]

const ROTATING_FACTS = [
  '☕ Preparing your interactive practice space — thank you for your patience!',
  '🐝 Honeybees can understand the concept of zero and perform basic addition and subtraction.',
  '💡 Zero wasn’t widely adopted in European mathematics until Fibonacci published Liber Abaci in 1202.',
  '🧠 Sleep actively consolidates mathematical concepts into long-term neural memory.',
  '⚡ To multiply any 2-digit number by 11, add the two digits and place the sum in the middle! (e.g. 35 × 11 = 385).',
  '🌌 A "googol" is 1 followed by 100 zeros — far more than the estimated number of atoms in the observable universe.',
  '🎯 Socratic questioning exercises active recall, producing 2.4x higher concept retention than lecturing.',
]

export default function WarmupExperience({
  role,
  isReady,
  isTimeout,
  onComplete,
  onRetry,
  onDismiss,
}: WarmupExperienceProps) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [userChoseToFinish, setUserChoseToFinish] = useState(false)
  const [factIndex, setFactIndex] = useState(0)

  // Rotating facts ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setFactIndex(prev => (prev + 1) % ROTATING_FACTS.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  const studentQuestions = useMemo(() => STUDENT_QUESTIONS, [])
  const parentQuestions = useMemo(() => PARENT_QUESTIONS, [])
  const totalQuestions = role === 'student' ? studentQuestions.length : parentQuestions.length

  const handleSelectOption = useCallback((optionIdx: number) => {
    if (isAnswered) return
    setSelectedOpt(optionIdx)
    setIsAnswered(true)

    const isCorrect = role === 'student'
      ? optionIdx === studentQuestions[currentIdx].correctIndex
      : optionIdx === parentQuestions[currentIdx].correctIndex

    if (isCorrect) {
      setScore(prev => prev + 1)
    }

    // Auto-advance after brief visual feedback
    const delay = role === 'student' ? 600 : 1800 // Give parents time to read the explanation
    setTimeout(() => {
      if (currentIdx + 1 < totalQuestions) {
        setCurrentIdx(prev => prev + 1)
        setSelectedOpt(null)
        setIsAnswered(false)
      } else {
        setIsFinished(true)
        // If backend is already ready, complete immediately
        if (isReady) {
          const finalScore = isCorrect ? score + 1 : score
          onComplete({ score: finalScore, total: totalQuestions })
        }
      }
    }, delay)
  }, [isAnswered, role, studentQuestions, parentQuestions, currentIdx, totalQuestions, isReady, score, onComplete])

  const handleSkipNow = () => {
    onComplete({ score, total: currentIdx + (isAnswered ? 1 : 0) || totalQuestions })
  }

  return (
    <div className="warmup-overlay animate-fadein">
      <div className="warmup-container">
        {/* Top bar with status and dismiss button */}
        <div className="warmup-header">
          <div className="warmup-badge-row">
            <span className="warmup-status-dot" />
            <span className="warmup-status-text">
              {isReady ? 'Veritas is Ready!' : 'Preparing your learning session...'}
            </span>
          </div>

          <button
            type="button"
            className="warmup-close-btn"
            onClick={onDismiss}
            title="Close warmup"
          >
            ✕
          </button>
        </div>

        {/* 90-Second Hard-Ceiling Fallback Screen */}
        {isTimeout ? (
          <div className="warmup-fallback-box animate-fadein">
            <div className="fallback-icon">⏳</div>
            <h3>Connection Taking Longer Than Usual</h3>
            <p>
              Your interactive math workspace is taking a moment to connect. You can retry or jump straight into the application.
            </p>
            <div className="fallback-actions">
              <button
                type="button"
                className="btn-warmup-primary"
                onClick={onRetry}
              >
                🔄 Try Reconnecting
              </button>
              <button
                type="button"
                className="btn-warmup-ghost"
                onClick={() => onComplete()}
              >
                Continue Anyway →
              </button>
            </div>
          </div>
        ) : isFinished && !isReady ? (
          /* Holding State — User finished game questions before backend responded */
          <div className="warmup-holding-box animate-fadein">
            <div className="holding-celebration">
              <span className="holding-emoji">🎉</span>
              <h3>Great Warm-Up Round!</h3>
              <p className="holding-score-display">
                You scored <strong>{score} / {totalQuestions}</strong>
              </p>
            </div>

            <div className="holding-spinner-area">
              <div className="holding-spinner" />
              <div className="holding-status-copy">
                <strong>Almost there!</strong>
                <span>Your personalized math workspace is getting ready...</span>
              </div>
            </div>

            <div className="holding-fact-card">
              <span className="fact-label">💡 Brain Food</span>
              <p className="fact-ticker-text">{ROTATING_FACTS[factIndex]}</p>
            </div>

            <div className="holding-actions">
              <button
                type="button"
                className="btn-warmup-ghost"
                onClick={() => onComplete({ score, total: totalQuestions })}
              >
                Enter Veritas Directly →
              </button>
            </div>
          </div>
        ) : (
          /* Active Mini-Game View */
          <div className="warmup-game-card animate-fadein">
            <div className="game-card-top">
              <div className="game-title-group">
                <span className="game-role-chip">
                  {role === 'student' ? '⚡ Student Sprint' : '🌱 Learning Insights'}
                </span>
                <h3 className="game-headline">
                  {role === 'student' ? 'Quick Mental Math Warm-Up' : 'Did You Know? Science of Learning'}
                </h3>
              </div>

              <div className="game-score-badge">
                <span>Score: <strong>{score}</strong></span>
              </div>
            </div>

            {/* Question Counter Progress */}
            <div className="game-progress-bar-wrap">
              <div
                className="game-progress-bar-fill"
                style={{ width: `${((currentIdx + 1) / totalQuestions) * 100}%` }}
              />
            </div>
            <div className="game-progress-meta">
              <span>Question {currentIdx + 1} of {totalQuestions}</span>
              <span className="game-timer-hint">Warm-up round</span>
            </div>

            {/* Question Text */}
            {role === 'student' ? (
              <div className="student-question-box">
                <div className="student-math-prompt">
                  {studentQuestions[currentIdx].question}
                </div>
                <div className="student-options-grid">
                  {studentQuestions[currentIdx].options.map((opt, optIdx) => {
                    let optState = ''
                    if (isAnswered) {
                      if (optIdx === studentQuestions[currentIdx].correctIndex) {
                        optState = 'opt--correct'
                      } else if (optIdx === selectedOpt) {
                        optState = 'opt--incorrect'
                      }
                    }
                    return (
                      <button
                        key={optIdx}
                        type="button"
                        className={`student-opt-btn ${optState} ${selectedOpt === optIdx ? 'opt--selected' : ''}`}
                        onClick={() => handleSelectOption(optIdx)}
                        disabled={isAnswered}
                      >
                        <span className="opt-letter">{['A', 'B', 'C', 'D'][optIdx]}</span>
                        <span className="opt-text">{opt}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="parent-question-box">
                <p className="parent-question-text">
                  {parentQuestions[currentIdx].question}
                </p>
                <div className="parent-options-list">
                  {parentQuestions[currentIdx].options.map((opt, optIdx) => {
                    let optState = ''
                    if (isAnswered) {
                      if (optIdx === parentQuestions[currentIdx].correctIndex) {
                        optState = 'opt--correct'
                      } else if (optIdx === selectedOpt) {
                        optState = 'opt--incorrect'
                      }
                    }
                    return (
                      <button
                        key={optIdx}
                        type="button"
                        className={`parent-opt-btn ${optState} ${selectedOpt === optIdx ? 'opt--selected' : ''}`}
                        onClick={() => handleSelectOption(optIdx)}
                        disabled={isAnswered}
                      >
                        <span className="opt-letter">{['A', 'B', 'C', 'D'][optIdx]}</span>
                        <span className="opt-text">{opt}</span>
                      </button>
                    )
                  })}
                </div>

                {isAnswered && (
                  <div className="parent-explanation-card animate-fadein">
                    <span className="explanation-title">💡 Insight:</span>
                    <p>{parentQuestions[currentIdx].explanation}</p>
                  </div>
                )}
              </div>
            )}

            {/* Rotating Fact Ticker at Bottom */}
            <div className="warmup-bottom-ticker">
              <span className="ticker-icon">☕</span>
              <span className="ticker-text">{ROTATING_FACTS[factIndex]}</span>
            </div>
          </div>
        )}

        {/* Non-Blocking "Ready" Toast / Banner (Overlaid when backend wakes up during play) */}
        {isReady && !userChoseToFinish && (
          <div className="warmup-ready-banner animate-slideup">
            <div className="ready-banner-text">
              <span className="ready-banner-icon">✅</span>
              <div>
                <strong>You're all set!</strong>
                <span>Your personalized session is ready!</span>
              </div>
            </div>
            <div className="ready-banner-buttons">
              <button
                type="button"
                className="btn-ready-skip"
                onClick={handleSkipNow}
              >
                Skip to Veritas →
              </button>
              <button
                type="button"
                className="btn-ready-finish"
                onClick={() => setUserChoseToFinish(true)}
              >
                Finish round first
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

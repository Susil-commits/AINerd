import { useState, useRef, useCallback } from 'react'
import './InteractivePipeline.css'

export interface PipelineNode {
  id: string
  title: string
  subtitle: string
  category: 'input' | 'core' | 'output'
  icon: string
  x: number
  y: number
  color: string
  badge?: string
  description: string
  sampleData: string
}

export interface Connection {
  from: string
  to: string
  label?: string
  color?: string
}

const DEFAULT_NODES: PipelineNode[] = [
  // ── LEFT: STUDENT & CONTEXT INPUTS ──
  {
    id: 'paper-work',
    title: 'Student Paper Work',
    subtitle: 'Handwritten math steps & photos',
    category: 'input',
    icon: '📝',
    x: 100,
    y: 75,
    color: '#38BDF8',
    badge: 'PHOTO',
    description: 'The student snaps a quick camera photo of their handwritten pencil work on paper.',
    sampleData: 'Line 1: 1/3 + 1/6\nLine 2: = 2/9  (Handwritten pencil)',
  },
  {
    id: 'student-voice',
    title: 'Student Voice & Chat',
    subtitle: 'Spoken questions & thoughts',
    category: 'input',
    icon: '🎙️',
    x: 100,
    y: 195,
    color: '#818CF8',
    badge: 'VOICE',
    description: 'The student can speak out loud or type their ideas, questions, and points of confusion.',
    sampleData: '"I added 1+1 and 3+6, but I am not sure if that is right."',
  },
  {
    id: 'math-problem',
    title: 'Current Math Problem',
    subtitle: 'Target concept & difficulty',
    category: 'input',
    icon: '🎯',
    x: 100,
    y: 315,
    color: '#F472B6',
    badge: 'PROBLEM',
    description: 'The math problem currently on the chalkboard (fractions, multiplication, or algebra).',
    sampleData: 'Topic: Adding Fractions\nDifficulty: Level 2 of 5\nGoal: Solve 1/3 + 1/6',
  },
  {
    id: 'student-history',
    title: 'Past Practice History',
    subtitle: 'Known strengths & struggles',
    category: 'input',
    icon: '📈',
    x: 100,
    y: 435,
    color: '#FB923C',
    badge: 'HISTORY',
    description: 'Records past problem attempts so the tutor knows what concepts need extra encouragement.',
    sampleData: 'Equivalent Fractions: 68% (Proficient)\nUnlike Denominators: 35% (Needs Practice)',
  },

  // ── CENTER: PROCESSING HUB SATELLITES ──
  {
    id: 'hub-reader',
    title: 'Read Handwriting',
    subtitle: 'Understands pencil lines & signs',
    category: 'core',
    icon: '👁️',
    x: 375,
    y: 120,
    color: '#34D399',
    badge: 'STAGE 1',
    description: 'Inspects each line of handwritten math to understand what the student wrote.',
    sampleData: 'Detected: Student wrote "2/9" on line 2.\nNumerator: 2, Denominator: 9',
  },
  {
    id: 'hub-misconception',
    title: 'Spot Misconception',
    subtitle: 'Finds exact point of confusion',
    category: 'core',
    icon: '🔍',
    x: 375,
    y: 380,
    color: '#FBBF24',
    badge: 'STAGE 2',
    description: 'Identifies the root thinking error rather than just marking the problem right or wrong.',
    sampleData: 'Root Cause: Added denominators directly (3 + 6 = 9) instead of finding common slice sizes.',
  },
  {
    id: 'hub-center',
    title: 'Veritas Thinking Core',
    subtitle: 'Socratic reasoning engine',
    category: 'core',
    icon: '🧠',
    x: 500,
    y: 250,
    color: '#A78BFA',
    badge: 'AI CORE',
    description: 'Coordinates the learning cycle: never blurts out answers, always guides with questions.',
    sampleData: 'Decision: Do not reveal 1/2.\nAction: Ask a slice-comparison visual question.',
  },
  {
    id: 'hub-socratic',
    title: 'Craft Socratic Clue',
    subtitle: 'Helpful guiding question',
    category: 'core',
    icon: '💬',
    x: 625,
    y: 120,
    color: '#A855F7',
    badge: 'STAGE 3',
    description: 'Formulates an encouraging question that prompts the student to discover their own error.',
    sampleData: '"If you have a 3-slice pizza and a 6-slice pizza, are the slices equal sizes?"',
  },
  {
    id: 'hub-mastery',
    title: 'Update Skill Level',
    subtitle: 'Calculates real understanding',
    category: 'core',
    icon: '📊',
    x: 625,
    y: 380,
    color: '#2DD4BF',
    badge: 'STAGE 4',
    description: 'Scientifically measures skill progress as the student works through steps.',
    sampleData: 'Fractions Mastery: 35% → 42% (Reflecting self-correction engagement)',
  },

  // ── RIGHT: LIVE LEARNING OUTPUTS ──
  {
    id: 'out-hint',
    title: 'Socratic Guiding Clue',
    subtitle: 'Audio speech & chat bubble',
    category: 'output',
    icon: '💡',
    x: 900,
    y: 60,
    color: '#FBBF24',
    badge: 'FOR STUDENT',
    description: 'Spoken gently through voice and shown in chat so the student experiences a "lightbulb moment".',
    sampleData: 'Tutor says: "What size slices would make both pizzas easy to compare together?"',
  },
  {
    id: 'out-box',
    title: 'Paper Step Highlight',
    subtitle: 'Visual box drawn on student work',
    category: 'output',
    icon: '✏️',
    x: 900,
    y: 155,
    color: '#F87171',
    badge: 'ON PAPER',
    description: 'Draws a color-coded guidance box over the handwritten step that needs another look.',
    sampleData: 'Highlighted: Step 2 denominator "9" in warm amber with hint label.',
  },
  {
    id: 'out-radar',
    title: 'Live Skill Radar Update',
    subtitle: 'Real-time mastery growth',
    category: 'output',
    icon: '📈',
    x: 900,
    y: 250,
    color: '#34D399',
    badge: 'GROWTH',
    description: 'Student and parent dashboards immediately reflect newly solidified math understanding.',
    sampleData: 'Understanding Fractions: +7% mastery gained this session.',
  },
  {
    id: 'out-next-problem',
    title: 'Next Practice Problem',
    subtitle: 'Calibrated to ability level',
    category: 'output',
    icon: '🚀',
    x: 900,
    y: 345,
    color: '#60A5FA',
    badge: 'NEXT UP',
    description: 'Selects a tailored follow-up question so the student can practice the new realization.',
    sampleData: 'Next: "Walking Trails: Adding 1/4 + 1/2" (reinforces common denominators).',
  },
  {
    id: 'out-parent-alert',
    title: 'Parent Progress Notice',
    subtitle: 'Celebration or friendly reminder',
    category: 'output',
    icon: '👨‍👩‍👧',
    x: 900,
    y: 440,
    color: '#C084FC',
    badge: 'FOR PARENTS',
    description: 'Parents see daily milestones or get a friendly reminder if a skill has not been practiced in 3 days.',
    sampleData: 'Alert sent: "Alex mastered unlike denominators today with 3 self-corrections!"',
  },
]

const CONNECTIONS: Connection[] = [
  // Inputs to Reader
  { from: 'paper-work', to: 'hub-reader', label: 'Work Photo', color: '#38BDF8' },
  { from: 'student-voice', to: 'hub-center', label: 'Voice Audio', color: '#818CF8' },
  { from: 'math-problem', to: 'hub-misconception', label: 'Problem Context', color: '#F472B6' },
  { from: 'student-history', to: 'hub-misconception', label: 'Past Mastery', color: '#FB923C' },

  // Internal Core flow
  { from: 'hub-reader', to: 'hub-center', label: 'Lines Read', color: '#34D399' },
  { from: 'hub-misconception', to: 'hub-center', label: 'Misconception Found', color: '#FBBF24' },
  { from: 'hub-center', to: 'hub-socratic', label: 'Socratic Plan', color: '#A78BFA' },
  { from: 'hub-center', to: 'hub-mastery', label: 'Step Evaluated', color: '#A78BFA' },

  // Core to Outputs
  { from: 'hub-socratic', to: 'out-hint', label: 'Voice Clue', color: '#FBBF24' },
  { from: 'hub-socratic', to: 'out-box', label: 'Step Highlight', color: '#F87171' },
  { from: 'hub-mastery', to: 'out-radar', label: 'Progress Update', color: '#34D399' },
  { from: 'hub-mastery', to: 'out-next-problem', label: 'Matched Problem', color: '#60A5FA' },
  { from: 'hub-mastery', to: 'out-parent-alert', label: 'Parent Milestone', color: '#C084FC' },
]

export default function InteractivePipeline() {
  const [nodes, setNodes] = useState<PipelineNode[]>(DEFAULT_NODES)
  const [selectedNodeId, setSelectedNodeId] = useState<string>('hub-center')
  const [isPaused, setIsPaused] = useState(false)
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationMessage, setSimulationMessage] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'canvas' | 'cards'>('canvas')

  // Dragging state
  const svgRef = useRef<SVGSVGElement | null>(null)
  const draggingNodeRef = useRef<{ id: string; startX: number; startY: number; mouseStartX: number; mouseStartY: number } | null>(null)

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[6]

  // Reset to default positions
  const handleResetLayout = () => {
    setNodes(DEFAULT_NODES)
  }

  // Trigger interactive practice step simulation
  const handleSimulateStep = () => {
    if (isSimulating) return
    setIsSimulating(true)
    setSimulationMessage('Step 1: Student uploaded handwritten work (1/3 + 1/6 = 2/9)...')
    setSelectedNodeId('paper-work')

    setTimeout(() => {
      setSimulationMessage('Step 2: Handwriting Reader spotted denominator addition...')
      setSelectedNodeId('hub-misconception')
    }, 1100)

    setTimeout(() => {
      setSimulationMessage('Step 3: Veritas crafted a visual pizza-slice Socratic clue...')
      setSelectedNodeId('hub-socratic')
    }, 2200)

    setTimeout(() => {
      setSimulationMessage('Step 4: Sent Socratic hint to chat & updated skill mastery radar!')
      setSelectedNodeId('out-hint')
    }, 3300)

    setTimeout(() => {
      setIsSimulating(false)
      setSimulationMessage(null)
    }, 4800)
  }

  // Pointer drag handlers
  const handlePointerDown = (id: string, e: React.PointerEvent) => {
    e.stopPropagation()
    const targetNode = nodes.find(n => n.id === id)
    if (!targetNode) return

    setSelectedNodeId(id)

    // Capture pointer
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)

    draggingNodeRef.current = {
      id,
      startX: targetNode.x,
      startY: targetNode.y,
      mouseStartX: e.clientX,
      mouseStartY: e.clientY,
    }
  }

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingNodeRef.current || !svgRef.current) return

    const rect = svgRef.current.getBoundingClientRect()
    // Convert client delta to SVG coordinate delta
    const scaleX = 1000 / rect.width
    const scaleY = 560 / rect.height

    const dx = (e.clientX - draggingNodeRef.current.mouseStartX) * scaleX
    const dy = (e.clientY - draggingNodeRef.current.mouseStartY) * scaleY

    const newX = Math.max(30, Math.min(970, draggingNodeRef.current.startX + dx))
    const newY = Math.max(30, Math.min(530, draggingNodeRef.current.startY + dy))

    setNodes(prev =>
      prev.map(node =>
        node.id === draggingNodeRef.current?.id ? { ...node, x: newX, y: newY } : node
      )
    )
  }, [])

  const handlePointerUp = useCallback(() => {
    draggingNodeRef.current = null
  }, [])

  // Calculate smooth cubic bezier path between two nodes
  const getPath = (source: PipelineNode, target: PipelineNode) => {
    const x1 = source.x
    const y1 = source.y
    const x2 = target.x
    const y2 = target.y

    // Intermediate horizontal curvature
    const dx = Math.abs(x2 - x1) * 0.5
    const cx1 = x1 + dx
    const cy1 = y1
    const cx2 = x2 - dx
    const cy2 = y2

    return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`
  }

  return (
    <div className="pipeline-wrapper">
      {/* ── Top Bar with Controls ── */}
      <div className="pipeline-topbar">
        <div className="pipeline-status">
          <span className={`pipeline-live-dot ${isPaused ? 'paused' : ''}`} />
          <span className="pipeline-title-text">
            LIVE LEARNING FLOW {isPaused ? '(PAUSED)' : '(REAL-TIME)'}
          </span>
          {simulationMessage && (
            <span className="pipeline-sim-banner animate-fadein">
              ⚡ {simulationMessage}
            </span>
          )}
        </div>

        <div className="pipeline-controls">
          <button
            type="button"
            className="pipeline-btn pipeline-btn--primary"
            onClick={handleSimulateStep}
            disabled={isSimulating}
            title="Watch a sample practice problem flow through the pipeline"
          >
            {isSimulating ? 'Simulating…' : '✨ Send Practice Step'}
          </button>

          <button
            type="button"
            className="pipeline-btn"
            onClick={() => setIsPaused(prev => !prev)}
            title={isPaused ? 'Resume animated flow' : 'Pause animation'}
          >
            {isPaused ? '▶️ Resume Flow' : '⏸️ Pause Flow'}
          </button>

          <button
            type="button"
            className="pipeline-btn"
            onClick={handleResetLayout}
            title="Reset dragged nodes to initial positions"
          >
            🔄 Reset Nodes
          </button>

          <div className="pipeline-view-toggle">
            <button
              type="button"
              className={`toggle-btn ${viewMode === 'canvas' ? 'active' : ''}`}
              onClick={() => setViewMode('canvas')}
              title="Interactive draggable canvas"
            >
              Interactive Map
            </button>
            <button
              type="button"
              className={`toggle-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
              title="Sequential step-by-step list"
            >
              Step Cards
            </button>
          </div>
        </div>
      </div>

      {/* ── Interactive SVG Canvas ── */}
      {viewMode === 'canvas' ? (
        <div className="pipeline-stage-container">
          <div className="pipeline-hint-bar">
            <span>💡 Tip: Click any node to inspect payload — or <strong>drag nodes freely</strong> to see the live cables flex!</span>
          </div>

          <div className="pipeline-svg-wrapper">
            <svg
              ref={svgRef}
              viewBox="0 0 1000 560"
              className="pipeline-svg"
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              <defs>
                {/* Radial background glow */}
                <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#818CF8" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#818CF8" stopOpacity="0" />
                </radialGradient>

                {/* Node glowing filters */}
                <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Background Glow */}
              <circle cx="500" cy="250" r="230" fill="url(#centerGlow)" />

              {/* Central Radar Rings */}
              <circle
                cx="500"
                cy="250"
                r="90"
                fill="none"
                stroke="var(--pipeline-grid-line, rgba(129, 140, 248, 0.2))"
                strokeWidth="1"
                strokeDasharray="4 4"
                className={`radar-ring ${isPaused ? 'paused' : ''}`}
              />
              <circle
                cx="500"
                cy="250"
                r="160"
                fill="none"
                stroke="var(--pipeline-grid-line, rgba(129, 140, 248, 0.12))"
                strokeWidth="1"
                strokeDasharray="6 6"
              />

              {/* ── Dynamic Connecting Curved Paths ── */}
              {CONNECTIONS.map((conn, idx) => {
                const src = nodes.find(n => n.id === conn.from)
                const tgt = nodes.find(n => n.id === conn.to)
                if (!src || !tgt) return null
                const pathD = getPath(src, tgt)
                const isSelectedConn = selectedNodeId === src.id || selectedNodeId === tgt.id

                return (
                  <g key={`conn-${idx}`} className="pipeline-cable-group">
                    {/* Base cable */}
                    <path
                      d={pathD}
                      className={`pipeline-cable ${isSelectedConn ? 'pipeline-cable--selected' : ''}`}
                      stroke={conn.color || 'var(--text-muted)'}
                      strokeWidth={isSelectedConn ? 2.5 : 1.5}
                      strokeDasharray="4 4"
                      fill="none"
                    />

                    {/* Animated moving pulse packet */}
                    {!isPaused && (
                      <circle r={isSelectedConn ? 4.5 : 3.2} fill={conn.color || '#38BDF8'} className="pulse-particle">
                        <animateMotion
                          dur={isSelectedConn ? '2s' : '3.5s'}
                          repeatCount="indefinite"
                          path={pathD}
                          keyPoints="0;1"
                          keyTimes="0;1"
                        />
                      </circle>
                    )}
                  </g>
                )
              })}

              {/* ── Draggable Pipeline Nodes ── */}
              {nodes.map(node => {
                const isSelected = selectedNodeId === node.id
                const isCenterCore = node.id === 'hub-center'

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    className={`pipeline-node-item ${isSelected ? 'selected' : ''} ${isCenterCore ? 'center-core' : ''}`}
                    onPointerDown={e => handlePointerDown(node.id, e)}
                    onClick={() => setSelectedNodeId(node.id)}
                    style={{ cursor: 'grab' }}
                  >
                    {/* Outer glow aura for selected node */}
                    {isSelected && (
                      <circle
                        cx="0"
                        cy="0"
                        r={isCenterCore ? 54 : 44}
                        fill="none"
                        stroke={node.color}
                        strokeWidth="2"
                        strokeOpacity="0.4"
                        className="node-aura-pulse"
                      />
                    )}

                    {/* Node Background Body */}
                    {isCenterCore ? (
                      // Center Core Circle
                      <circle
                        cx="0"
                        cy="0"
                        r="42"
                        className="node-core-circle"
                        stroke={node.color}
                        strokeWidth={isSelected ? 3 : 2}
                      />
                    ) : (
                      // Rounded pill card
                      <rect
                        x="-75"
                        y="-22"
                        width="150"
                        height="44"
                        rx="10"
                        className="node-pill-rect"
                        stroke={isSelected ? node.color : 'var(--pipeline-border, rgba(255,255,255,0.1))'}
                        strokeWidth={isSelected ? 2 : 1}
                      />
                    )}

                    {/* Category color indicator dot */}
                    {!isCenterCore && (
                      <circle
                        cx="-60"
                        cy="0"
                        r="4"
                        fill={node.color}
                      />
                    )}

                    {/* Icon */}
                    <text
                      x={isCenterCore ? 0 : -42}
                      y={isCenterCore ? -8 : 5}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={isCenterCore ? 24 : 15}
                      className="node-icon"
                    >
                      {node.icon}
                    </text>

                    {/* Title */}
                    <text
                      x={isCenterCore ? 0 : -24}
                      y={isCenterCore ? 16 : -4}
                      textAnchor={isCenterCore ? 'middle' : 'start'}
                      className="node-title"
                      fontSize={isCenterCore ? 9.5 : 10.5}
                      fontWeight="700"
                    >
                      {node.title}
                    </text>

                    {/* Subtitle / Category badge */}
                    <text
                      x={isCenterCore ? 0 : -24}
                      y={isCenterCore ? 27 : 9}
                      textAnchor={isCenterCore ? 'middle' : 'start'}
                      className="node-sub"
                      fontSize="8"
                    >
                      {node.badge || node.subtitle}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        </div>
      ) : (
        /* ── Mobile Step-by-Step Cards View ── */
        <div className="pipeline-cards-view">
          <div className="cards-column">
            <h4>1. Student & Problem Inputs</h4>
            <div className="cards-grid">
              {nodes.filter(n => n.category === 'input').map(n => (
                <div
                  key={n.id}
                  className={`pipeline-card-item ${selectedNodeId === n.id ? 'active' : ''}`}
                  onClick={() => setSelectedNodeId(n.id)}
                >
                  <span className="card-icon">{n.icon}</span>
                  <div>
                    <strong>{n.title}</strong>
                    <p>{n.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="cards-column">
            <h4>2. Socratic Reasoning Core</h4>
            <div className="cards-grid">
              {nodes.filter(n => n.category === 'core').map(n => (
                <div
                  key={n.id}
                  className={`pipeline-card-item ${selectedNodeId === n.id ? 'active' : ''}`}
                  onClick={() => setSelectedNodeId(n.id)}
                >
                  <span className="card-icon">{n.icon}</span>
                  <div>
                    <strong>{n.title}</strong>
                    <p>{n.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="cards-column">
            <h4>3. Student & Parent Outcomes</h4>
            <div className="cards-grid">
              {nodes.filter(n => n.category === 'output').map(n => (
                <div
                  key={n.id}
                  className={`pipeline-card-item ${selectedNodeId === n.id ? 'active' : ''}`}
                  onClick={() => setSelectedNodeId(n.id)}
                >
                  <span className="card-icon">{n.icon}</span>
                  <div>
                    <strong>{n.title}</strong>
                    <p>{n.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom Telemetry / Node Inspector ── */}
      <div className="pipeline-inspector">
        <div className="inspector-header">
          <span className="inspector-badge">
            <span className="inspector-dot" style={{ background: selectedNode.color }} />
            COMPONENT INSPECTOR
          </span>
          <span className="inspector-status">STATUS: ACTIVE & CONNECTED</span>
        </div>

        <div className="inspector-body">
          <div className="inspector-info">
            <div className="inspector-title-row">
              <span className="inspector-icon">{selectedNode.icon}</span>
              <div>
                <h3 className="inspector-title">{selectedNode.title}</h3>
                <span className="inspector-sub">{selectedNode.subtitle}</span>
              </div>
            </div>
            <p className="inspector-desc">{selectedNode.description}</p>
          </div>

          <div className="inspector-payload">
            <span className="payload-label">Live Example Data Stream:</span>
            <pre className="payload-code">{selectedNode.sampleData}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}

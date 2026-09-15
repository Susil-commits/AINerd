import { useState, useRef, useCallback } from 'react'
import {
  FileText,
  Mic,
  Target,
  History,
  Eye,
  Search,
  Cpu,
  MessageSquare,
  BarChart3,
  Lightbulb,
  PenTool,
  Activity,
  Compass,
  Bell,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import './InteractivePipeline.css'

export interface PipelineNode {
  id: string
  title: string
  subtitle: string
  category: 'input' | 'core' | 'output'
  icon: LucideIcon
  x: number
  y: number
  color: string
  badge: string
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
    icon: FileText,
    x: 120,
    y: 75,
    color: '#38BDF8',
    badge: 'PHOTO SCAN',
    description: 'The student snaps a quick camera photo of their handwritten pencil work on paper.',
    sampleData: 'Line 1: 1/3 + 1/6\nLine 2: = 2/9  (Handwritten pencil)',
  },
  {
    id: 'student-voice',
    title: 'Student Voice & Chat',
    subtitle: 'Spoken questions & thoughts',
    category: 'input',
    icon: Mic,
    x: 120,
    y: 205,
    color: '#818CF8',
    badge: 'AUDIO & TEXT',
    description: 'The student can speak out loud or type their ideas, questions, and points of confusion.',
    sampleData: '"I added 1+1 and 3+6, but I am not sure if that is right."',
  },
  {
    id: 'math-problem',
    title: 'Current Math Problem',
    subtitle: 'Target concept & difficulty',
    category: 'input',
    icon: Target,
    x: 120,
    y: 335,
    color: '#F472B6',
    badge: 'PRACTICE GOAL',
    description: 'The math problem currently on the chalkboard (fractions, multiplication, or algebra).',
    sampleData: 'Topic: Adding Fractions\nDifficulty: Level 2 of 5\nGoal: Solve 1/3 + 1/6',
  },
  {
    id: 'student-history',
    title: 'Past Practice History',
    subtitle: 'Known strengths & struggles',
    category: 'input',
    icon: History,
    x: 120,
    y: 465,
    color: '#FB923C',
    badge: 'SKILL PROFILE',
    description: 'Records past problem attempts so the tutor knows what concepts need extra encouragement.',
    sampleData: 'Equivalent Fractions: 68% (Proficient)\nUnlike Denominators: 35% (Needs Practice)',
  },

  // ── CENTER: PROCESSING SATELLITES & CORE HUB ──
  {
    id: 'hub-reader',
    title: 'Read Handwriting',
    subtitle: 'Understands pencil lines & signs',
    category: 'core',
    icon: Eye,
    x: 385,
    y: 140,
    color: '#34D399',
    badge: 'VISION STAGE 1',
    description: 'Inspects each line of handwritten math to understand what the student wrote.',
    sampleData: 'Detected: Student wrote "2/9" on line 2.\nNumerator: 2, Denominator: 9',
  },
  {
    id: 'hub-misconception',
    title: 'Spot Misconception',
    subtitle: 'Finds exact point of confusion',
    category: 'core',
    icon: Search,
    x: 385,
    y: 430,
    color: '#FBBF24',
    badge: 'ANALYSIS STAGE 2',
    description: 'Identifies the root thinking error rather than just marking the problem right or wrong.',
    sampleData: 'Root Cause: Added denominators directly (3 + 6 = 9) instead of finding common slice sizes.',
  },
  {
    id: 'hub-center',
    title: 'Veritas Thinking Core',
    subtitle: 'Socratic reasoning engine',
    category: 'core',
    icon: Cpu,
    x: 570,
    y: 285,
    color: '#A78BFA',
    badge: 'AI REASONING CORE',
    description: 'Coordinates the learning cycle: never blurts out answers, always guides with questions.',
    sampleData: 'Decision: Do not reveal 1/2.\nAction: Ask a slice-comparison visual question.',
  },
  {
    id: 'hub-socratic',
    title: 'Craft Socratic Clue',
    subtitle: 'Helpful guiding question',
    category: 'core',
    icon: MessageSquare,
    x: 755,
    y: 140,
    color: '#C084FC',
    badge: 'GUIDANCE STAGE 3',
    description: 'Formulates an encouraging question that prompts the student to discover their own error.',
    sampleData: '"If you have a 3-slice pizza and a 6-slice pizza, are the slices equal sizes?"',
  },
  {
    id: 'hub-mastery',
    title: 'Update Skill Level',
    subtitle: 'Calculates real understanding',
    category: 'core',
    icon: BarChart3,
    x: 755,
    y: 430,
    color: '#2DD4BF',
    badge: 'EVALUATION STAGE 4',
    description: 'Scientifically measures skill progress as the student works through steps.',
    sampleData: 'Fractions Mastery: 35% → 42% (Reflecting self-correction engagement)',
  },

  // ── RIGHT: LIVE LEARNING OUTPUTS ──
  {
    id: 'out-hint',
    title: 'Socratic Guiding Clue',
    subtitle: 'Audio speech & chat bubble',
    category: 'output',
    icon: Lightbulb,
    x: 1020,
    y: 65,
    color: '#FBBF24',
    badge: 'SOCRATIC HINT',
    description: 'Spoken gently through voice and shown in chat so the student experiences a "lightbulb moment".',
    sampleData: 'Tutor says: "What size slices would make both pizzas easy to compare together?"',
  },
  {
    id: 'out-box',
    title: 'Paper Step Highlight',
    subtitle: 'Visual box drawn on student work',
    category: 'output',
    icon: PenTool,
    x: 1020,
    y: 165,
    color: '#F87171',
    badge: 'PAPER BOX',
    description: 'Draws a color-coded guidance box over the handwritten step that needs another look.',
    sampleData: 'Highlighted: Step 2 denominator "9" in warm amber with hint label.',
  },
  {
    id: 'out-radar',
    title: 'Live Skill Radar Update',
    subtitle: 'Real-time mastery growth',
    category: 'output',
    icon: Activity,
    x: 1020,
    y: 265,
    color: '#34D399',
    badge: 'SKILL RADAR',
    description: 'Student and parent dashboards immediately reflect newly solidified math understanding.',
    sampleData: 'Understanding Fractions: +7% mastery gained this session.',
  },
  {
    id: 'out-next-problem',
    title: 'Next Practice Problem',
    subtitle: 'Calibrated to ability level',
    category: 'output',
    icon: Compass,
    x: 1020,
    y: 365,
    color: '#60A5FA',
    badge: 'NEXT PROBLEM',
    description: 'Selects a tailored follow-up question so the student can practice the new realization.',
    sampleData: 'Next: "Walking Trails: Adding 1/4 + 1/2" (reinforces common denominators).',
  },
  {
    id: 'out-parent-alert',
    title: 'Parent Progress Notice',
    subtitle: 'Celebration or friendly reminder',
    category: 'output',
    icon: Bell,
    x: 1020,
    y: 465,
    color: '#C084FC',
    badge: 'PARENT UPDATE',
    description: 'Parents see daily milestones or get a friendly reminder if a skill has not been practiced in 3 days.',
    sampleData: 'Alert sent: "Alex mastered unlike denominators today with 3 self-corrections!"',
  },
]

const CONNECTIONS: Connection[] = [
  // Inputs to Reader / Core / Misconception
  { from: 'paper-work', to: 'hub-reader', label: 'SCAN', color: '#38BDF8' },
  { from: 'student-voice', to: 'hub-center', label: 'AUDIO', color: '#818CF8' },
  { from: 'math-problem', to: 'hub-misconception', label: 'CONTEXT', color: '#F472B6' },
  { from: 'student-history', to: 'hub-misconception', label: 'HISTORY', color: '#FB923C' },

  // Internal Core flow
  { from: 'hub-reader', to: 'hub-center', label: 'LINES', color: '#34D399' },
  { from: 'hub-misconception', to: 'hub-center', label: 'ERROR', color: '#FBBF24' },
  { from: 'hub-center', to: 'hub-socratic', label: 'REASON', color: '#A78BFA' },
  { from: 'hub-center', to: 'hub-mastery', label: 'EVAL', color: '#A78BFA' },

  // Core to Outputs
  { from: 'hub-socratic', to: 'out-hint', label: 'HINT', color: '#FBBF24' },
  { from: 'hub-socratic', to: 'out-box', label: 'BOX', color: '#F87171' },
  { from: 'hub-mastery', to: 'out-radar', label: 'GROWTH', color: '#34D399' },
  { from: 'hub-mastery', to: 'out-next-problem', label: 'NEXT', color: '#60A5FA' },
  { from: 'hub-mastery', to: 'out-parent-alert', label: 'NOTICE', color: '#C084FC' },
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
  const SelectedNodeIcon = selectedNode.icon

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
    const scaleX = 1140 / rect.width
    const scaleY = 580 / rect.height

    const dx = (e.clientX - draggingNodeRef.current.mouseStartX) * scaleX
    const dy = (e.clientY - draggingNodeRef.current.mouseStartY) * scaleY

    const newX = Math.max(90, Math.min(1050, draggingNodeRef.current.startX + dx))
    const newY = Math.max(45, Math.min(535, draggingNodeRef.current.startY + dy))

    setNodes(prev =>
      prev.map(node =>
        node.id === draggingNodeRef.current?.id ? { ...node, x: newX, y: newY } : node
      )
    )
  }, [])

  const handlePointerUp = useCallback(() => {
    draggingNodeRef.current = null
  }, [])

  // Calculate clean anchor endpoints on boundary of capsules
  const getEndpoints = (source: PipelineNode, target: PipelineNode) => {
    let x1 = source.x
    let y1 = source.y
    if (source.id === 'hub-center') {
      x1 = source.x + 48
    } else if (source.category === 'input') {
      x1 = source.x + 102
    } else if (source.category === 'core') {
      x1 = source.x + 92
    }

    let x2 = target.x
    let y2 = target.y
    if (target.id === 'hub-center') {
      x2 = target.x - 48
    } else if (target.category === 'output') {
      x2 = target.x - 102
    } else if (target.category === 'core') {
      x2 = target.x - 92
    }

    return { x1, y1, x2, y2 }
  }

  // Calculate smooth cubic bezier path between two nodes
  const getPath = (source: PipelineNode, target: PipelineNode) => {
    const { x1, y1, x2, y2 } = getEndpoints(source, target)
    const dx = Math.abs(x2 - x1) * 0.55
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
              {simulationMessage}
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
            <Sparkles size={14} />
            <span>{isSimulating ? 'Simulating…' : 'Send Practice Step'}</span>
          </button>

          <button
            type="button"
            className="pipeline-btn"
            onClick={() => setIsPaused(prev => !prev)}
            title={isPaused ? 'Resume animated flow' : 'Pause animation'}
          >
            {isPaused ? <Play size={13} /> : <Pause size={13} />}
            <span>{isPaused ? 'Resume Flow' : 'Pause Flow'}</span>
          </button>

          <button
            type="button"
            className="pipeline-btn"
            onClick={handleResetLayout}
            title="Reset dragged nodes to initial positions"
          >
            <RotateCcw size={13} />
            <span>Reset Nodes</span>
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
            <Lightbulb size={14} style={{ color: '#FBBF24', flexShrink: 0 }} />
            <span>Click any node to inspect payload — or <strong>drag nodes freely</strong> to see live cables flex!</span>
          </div>

          <div className="pipeline-svg-wrapper">
            <svg
              ref={svgRef}
              viewBox="0 0 1140 580"
              className="pipeline-svg"
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              <defs>
                {/* Radial background glow */}
                <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#818CF8" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#818CF8" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Background Glow */}
              <circle cx="570" cy="285" r="260" fill="url(#centerGlow)" />

              {/* Central Radar Rings */}
              <circle
                cx="570"
                cy="285"
                r="95"
                fill="none"
                stroke="var(--pipeline-grid-line, rgba(129, 140, 248, 0.22))"
                strokeWidth="1"
                strokeDasharray="4 4"
                className={`radar-ring ${isPaused ? 'paused' : ''}`}
              />
              <circle
                cx="570"
                cy="285"
                r="170"
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
                const { x1, y1, x2, y2 } = getEndpoints(src, tgt)
                const midX = (x1 + x2) / 2
                const midY = (y1 + y2) / 2

                return (
                  <g key={`conn-${idx}`} className="pipeline-cable-group">
                    {/* Base cable */}
                    <path
                      d={pathD}
                      className={`pipeline-cable ${isSelectedConn ? 'pipeline-cable--selected' : ''}`}
                      stroke={conn.color || 'var(--text-muted)'}
                      strokeWidth={isSelectedConn ? 2.5 : 1.5}
                      strokeDasharray="5 4"
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

                    {/* Cybernetic Floating Cable Badge (like reference HUD) */}
                    {conn.label && (
                      <g transform={`translate(${midX}, ${midY})`} className="cable-badge-group">
                        <rect
                          x="-22"
                          y="-8"
                          width="44"
                          height="16"
                          rx="8"
                          className="cable-badge-rect"
                          stroke={conn.color || 'var(--border)'}
                          strokeWidth="1"
                        />
                        <text
                          x="0"
                          y="3.5"
                          textAnchor="middle"
                          fontSize="7"
                          fontWeight="700"
                          letterSpacing="0.08em"
                          fill={conn.color || '#94a3b8'}
                          className="cable-badge-text"
                        >
                          {conn.label}
                        </text>
                      </g>
                    )}
                  </g>
                )
              })}

              {/* ── Draggable Pipeline Nodes ── */}
              {nodes.map(node => {
                const isSelected = selectedNodeId === node.id
                const isCenterCore = node.id === 'hub-center'
                const isSatellite = node.category === 'core' && !isCenterCore
                const NodeIcon = node.icon

                // Widths: 204 for input/output, 184 for satellites
                const rectW = isSatellite ? 184 : 204
                const rectH = 48
                const halfW = rectW / 2
                const halfH = rectH / 2

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    className={`pipeline-node-item ${isSelected ? 'selected' : ''} ${isCenterCore ? 'center-core' : ''}`}
                    onPointerDown={e => handlePointerDown(node.id, e)}
                    onClick={() => setSelectedNodeId(node.id)}
                    style={{ cursor: 'grab' }}
                  >
                    {/* Clip path ensuring no text or child element ever overflows outside the capsule */}
                    {!isCenterCore && (
                      <defs>
                        <clipPath id={`clip-${node.id}`}>
                          <rect
                            x={-halfW + 1}
                            y={-halfH + 1}
                            width={rectW - 2}
                            height={rectH - 2}
                            rx="10"
                          />
                        </clipPath>
                      </defs>
                    )}

                    {/* Outer glow aura for selected node */}
                    {isSelected && (
                      <circle
                        cx="0"
                        cy="0"
                        r={isCenterCore ? 58 : 50}
                        fill="none"
                        stroke={node.color}
                        strokeWidth="2"
                        strokeOpacity="0.4"
                        className="node-aura-pulse"
                      />
                    )}

                    {isCenterCore ? (
                      // ── Center Core Hub (HUD Style) ──
                      <g className="center-core-group">
                        <circle
                          cx="0"
                          cy="0"
                          r="48"
                          className="node-core-circle"
                          stroke={node.color}
                          strokeWidth={isSelected ? 3 : 2}
                        />

                        {/* Inner rotating orbit of radar dots */}
                        <g className={`core-dot-orbit ${isPaused ? 'paused' : ''}`}>
                          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
                            const rad = (deg * Math.PI) / 180
                            const dx = Math.cos(rad) * 36
                            const dy = Math.sin(rad) * 36
                            return (
                              <circle
                                key={i}
                                cx={dx}
                                cy={dy}
                                r="2"
                                fill={node.color}
                                opacity="0.6"
                              />
                            )
                          })}
                        </g>

                        {/* Vector CPU icon */}
                        <NodeIcon
                          x="-13"
                          y="-22"
                          size={26}
                          color={node.color}
                          strokeWidth={2}
                        />

                        {/* Core Title */}
                        <text
                          x="0"
                          y="12"
                          textAnchor="middle"
                          className="node-core-title"
                          fontSize="9"
                          fontWeight="700"
                          fill="#ffffff"
                        >
                          VERITAS CORE
                        </text>

                        {/* Core Subtitle */}
                        <text
                          x="0"
                          y="23"
                          textAnchor="middle"
                          className="node-core-sub"
                          fontSize="7"
                          fontWeight="600"
                          fill={node.color}
                          letterSpacing="0.08em"
                        >
                          SOCRATIC AI
                        </text>
                      </g>
                    ) : (
                      // ── Standard Pill Capsule ──
                      <g clipPath={`url(#clip-${node.id})`}>
                        {/* Main Capsule Body */}
                        <rect
                          x={-halfW}
                          y={-halfH}
                          width={rectW}
                          height={rectH}
                          rx="11"
                          className="node-pill-rect"
                          stroke={isSelected ? node.color : 'var(--pipeline-border, rgba(255,255,255,0.12))'}
                          strokeWidth={isSelected ? 2 : 1}
                        />

                        {/* Circular Vector Icon Badge Container */}
                        <circle
                          cx={-halfW + 28}
                          cy="0"
                          r="15"
                          className="node-icon-bg"
                          fill={`${node.color}15`}
                          stroke={`${node.color}40`}
                          strokeWidth="1"
                        />

                        {/* Vector Lucide Icon */}
                        <NodeIcon
                          x={-halfW + 20}
                          y="-8"
                          size={16}
                          color={node.color}
                          strokeWidth={2}
                        />

                        {/* Text Group */}
                        <text
                          x={-halfW + 52}
                          y="-4"
                          className="node-title"
                          fontSize="10.2"
                          fontWeight="700"
                          textLength={node.title.length > 20 ? (isSatellite ? 116 : 130) : undefined}
                          lengthAdjust="spacing"
                        >
                          {node.title}
                        </text>

                        <text
                          x={-halfW + 52}
                          y="11"
                          className="node-sub"
                          fontSize="7.6"
                          fontWeight="600"
                          letterSpacing="0.06em"
                        >
                          {node.badge}
                        </text>
                      </g>
                    )}

                    {/* Connection Anchor Port Dots (Cybernetic HUD detail) */}
                    {!isCenterCore && node.category === 'input' && (
                      <circle cx={halfW} cy="0" r="3.5" fill={node.color} className="anchor-port" />
                    )}
                    {!isCenterCore && node.category === 'output' && (
                      <circle cx={-halfW} cy="0" r="3.5" fill={node.color} className="anchor-port" />
                    )}
                    {!isCenterCore && node.category === 'core' && (
                      <>
                        <circle cx={-halfW} cy="0" r="3.5" fill={node.color} className="anchor-port" />
                        <circle cx={halfW} cy="0" r="3.5" fill={node.color} className="anchor-port" />
                      </>
                    )}
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
              {nodes.filter(n => n.category === 'input').map(n => {
                const CardIcon = n.icon
                return (
                  <div
                    key={n.id}
                    className={`pipeline-card-item ${selectedNodeId === n.id ? 'active' : ''}`}
                    onClick={() => setSelectedNodeId(n.id)}
                  >
                    <div
                      className="card-icon-badge"
                      style={{
                        background: `${n.color}15`,
                        borderColor: `${n.color}40`,
                        color: n.color,
                      }}
                    >
                      <CardIcon size={17} strokeWidth={2} />
                    </div>
                    <div>
                      <strong>{n.title}</strong>
                      <p>{n.subtitle}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="cards-column">
            <h4>2. Socratic Reasoning Core</h4>
            <div className="cards-grid">
              {nodes.filter(n => n.category === 'core').map(n => {
                const CardIcon = n.icon
                return (
                  <div
                    key={n.id}
                    className={`pipeline-card-item ${selectedNodeId === n.id ? 'active' : ''}`}
                    onClick={() => setSelectedNodeId(n.id)}
                  >
                    <div
                      className="card-icon-badge"
                      style={{
                        background: `${n.color}15`,
                        borderColor: `${n.color}40`,
                        color: n.color,
                      }}
                    >
                      <CardIcon size={17} strokeWidth={2} />
                    </div>
                    <div>
                      <strong>{n.title}</strong>
                      <p>{n.subtitle}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="cards-column">
            <h4>3. Student & Parent Outcomes</h4>
            <div className="cards-grid">
              {nodes.filter(n => n.category === 'output').map(n => {
                const CardIcon = n.icon
                return (
                  <div
                    key={n.id}
                    className={`pipeline-card-item ${selectedNodeId === n.id ? 'active' : ''}`}
                    onClick={() => setSelectedNodeId(n.id)}
                  >
                    <div
                      className="card-icon-badge"
                      style={{
                        background: `${n.color}15`,
                        borderColor: `${n.color}40`,
                        color: n.color,
                      }}
                    >
                      <CardIcon size={17} strokeWidth={2} />
                    </div>
                    <div>
                      <strong>{n.title}</strong>
                      <p>{n.subtitle}</p>
                    </div>
                  </div>
                )
              })}
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
              <div
                className="inspector-icon-badge"
                style={{
                  background: `${selectedNode.color}15`,
                  borderColor: `${selectedNode.color}45`,
                  color: selectedNode.color,
                }}
              >
                <SelectedNodeIcon size={22} strokeWidth={2} />
              </div>
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

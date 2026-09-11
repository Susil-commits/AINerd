import { useEffect, useRef } from 'react'

interface Dot {
  x: number
  y: number
  baseOpacity: number
  maxOpacity: number
  phase: number
  speed: number
  isShiningStar: boolean
  radius: number
  glowColor: string
}

export default function ShiningDots() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let dots: Dot[] = []
    const spacing = 28 // Exact grid spacing matching modern AI hackathon aesthetic

    let mouseX = -1000
    let mouseY = -1000

    const setupCanvas = () => {
      const dpr = window.devicePixelRatio || 1
      const width = window.innerWidth
      const height = window.innerHeight

      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      ctx.resetTransform?.()
      ctx.scale(dpr, dpr)

      const cols = Math.ceil(width / spacing) + 1
      const rows = Math.ceil(height / spacing) + 1

      dots = []
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          // ~25% of dots continuously shine and twinkle with halo
          const isShiningStar = Math.random() < 0.25
          const isViolet = Math.random() < 0.7 // mostly violet, some soft cyan/amber
          dots.push({
            x: c * spacing,
            y: r * spacing,
            baseOpacity: isShiningStar ? 0.22 : 0.12,
            maxOpacity: isShiningStar ? 0.95 : 0.35,
            phase: Math.random() * Math.PI * 2,
            speed: 0.018 + Math.random() * 0.035, // organic twinkle rate
            isShiningStar,
            radius: isShiningStar ? 1.5 : 1.1,
            glowColor: isViolet ? 'rgba(167, 139, 250, 0.9)' : 'rgba(96, 165, 250, 0.85)',
          })
        }
      }
    }

    setupCanvas()

    let time = 0
    const render = () => {
      time += 0.04
      const width = window.innerWidth
      const height = window.innerHeight

      ctx.clearRect(0, 0, width, height)

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i]

        // Continuous harmonic sine oscillation for uninterrupted natural shining
        const naturalPulse = (Math.sin(time * dot.speed * 30 + dot.phase) + 1) / 2
        let currentOpacity = dot.baseOpacity + (dot.maxOpacity - dot.baseOpacity) * naturalPulse

        // Subtle interactive mouse shine
        const dx = dot.x - mouseX
        const dy = dot.y - mouseY
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 140) {
          const mouseFactor = (1 - dist / 140) * 0.4
          currentOpacity = Math.min(1, currentOpacity + mouseFactor)
        }

        ctx.beginPath()
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2)

        if (dot.isShiningStar && currentOpacity > 0.4) {
          // Continuous bright shine with halo glow
          ctx.shadowBlur = 8 * (currentOpacity / dot.maxOpacity)
          ctx.shadowColor = dot.glowColor
          ctx.fillStyle = `rgba(230, 225, 255, ${currentOpacity})`
        } else {
          ctx.shadowBlur = 0
          ctx.fillStyle = `rgba(145, 160, 220, ${currentOpacity})`
        }

        ctx.fill()
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    const handleResize = () => {
      setupCanvas()
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    const handleMouseLeave = () => {
      mouseX = -1000
      mouseY = -1000
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}

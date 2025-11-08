'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './page.module.css'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: string
  life: number
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [particleCount, setParticleCount] = useState(100)
  const [particleSize, setParticleSize] = useState(3)
  const [speed, setSpeed] = useState(2)
  const [colorScheme, setColorScheme] = useState('rainbow')
  const [interactionMode, setInteractionMode] = useState('attract')
  const particles = useRef<Particle[]>([])
  const mouse = useRef({ x: 0, y: 0, active: false })
  const animationFrame = useRef<number>()

  const getColor = (index: number, total: number) => {
    switch (colorScheme) {
      case 'rainbow':
        const hue = (index / total) * 360
        return `hsl(${hue}, 80%, 60%)`
      case 'fire':
        const fireHue = 30 * Math.random()
        return `hsl(${fireHue}, 100%, 50%)`
      case 'ocean':
        return `hsl(${200 + Math.random() * 40}, 80%, 60%)`
      case 'purple':
        return `hsl(${270 + Math.random() * 60}, 80%, 60%)`
      default:
        return '#ffffff'
    }
  }

  const initParticles = (canvas: HTMLCanvasElement) => {
    particles.current = []
    for (let i = 0; i < particleCount; i++) {
      particles.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        radius: particleSize + Math.random() * particleSize,
        color: getColor(i, particleCount),
        life: 1
      })
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initParticles(canvas)
    }

    resize()
    window.addEventListener('resize', resize)

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX
      mouse.current.y = e.clientY
    }

    const handleMouseDown = () => {
      mouse.current.active = true
    }

    const handleMouseUp = () => {
      mouse.current.active = false
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mousedown', handleMouseDown)
    canvas.addEventListener('mouseup', handleMouseUp)

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles.current.forEach((particle, i) => {
        // Mouse interaction
        if (mouse.current.active) {
          const dx = mouse.current.x - particle.x
          const dy = mouse.current.y - particle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 200) {
            const force = (200 - distance) / 200
            if (interactionMode === 'attract') {
              particle.vx += (dx / distance) * force * 0.5
              particle.vy += (dy / distance) * force * 0.5
            } else {
              particle.vx -= (dx / distance) * force * 0.5
              particle.vy -= (dy / distance) * force * 0.5
            }
          }
        }

        // Update position
        particle.x += particle.vx
        particle.y += particle.vy

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.vx *= -0.9
          particle.x = Math.max(0, Math.min(canvas.width, particle.x))
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.vy *= -0.9
          particle.y = Math.max(0, Math.min(canvas.height, particle.y))
        }

        // Friction
        particle.vx *= 0.99
        particle.vy *= 0.99

        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        ctx.fillStyle = particle.color
        ctx.fill()

        // Draw connections
        particles.current.forEach((other, j) => {
          if (i < j) {
            const dx = other.x - particle.x
            const dy = other.y - particle.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < 100) {
              ctx.beginPath()
              ctx.moveTo(particle.x, particle.y)
              ctx.lineTo(other.x, other.y)
              ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - distance / 100) * 0.2})`
              ctx.lineWidth = 1
              ctx.stroke()
            }
          }
        })
      })

      animationFrame.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('mouseup', handleMouseUp)
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current)
      }
    }
  }, [particleCount, particleSize, speed, colorScheme, interactionMode])

  const reset = () => {
    const canvas = canvasRef.current
    if (canvas) {
      initParticles(canvas)
    }
  }

  return (
    <main className={styles.main}>
      <canvas ref={canvasRef} className={styles.canvas} />

      <div className={styles.controls}>
        <h1 className={styles.title}>Particle Playground</h1>

        <div className={styles.controlGroup}>
          <label>
            Particles: {particleCount}
            <input
              type="range"
              min="10"
              max="300"
              value={particleCount}
              onChange={(e) => setParticleCount(Number(e.target.value))}
            />
          </label>

          <label>
            Size: {particleSize}
            <input
              type="range"
              min="1"
              max="8"
              value={particleSize}
              onChange={(e) => setParticleSize(Number(e.target.value))}
            />
          </label>

          <label>
            Speed: {speed}
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.5"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
          </label>

          <label>
            Color Scheme:
            <select value={colorScheme} onChange={(e) => setColorScheme(e.target.value)}>
              <option value="rainbow">Rainbow</option>
              <option value="fire">Fire</option>
              <option value="ocean">Ocean</option>
              <option value="purple">Purple</option>
            </select>
          </label>

          <label>
            Mouse Mode:
            <select value={interactionMode} onChange={(e) => setInteractionMode(e.target.value)}>
              <option value="attract">Attract</option>
              <option value="repel">Repel</option>
            </select>
          </label>

          <button onClick={reset} className={styles.button}>
            Reset Particles
          </button>
        </div>

        <p className={styles.instructions}>
          Click and drag to interact with particles
        </p>
      </div>
    </main>
  )
}

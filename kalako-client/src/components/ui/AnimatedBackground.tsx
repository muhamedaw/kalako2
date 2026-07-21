import { useEffect, useRef } from 'react'

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    // Just CSS blobs — no JS needed for slow animation
  }, [])

  return (
    <div
      ref={canvasRef}
      className="fixed inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #12071F 0%, #1B0E2E 50%, #12071F 100%)',
        }}
      />
      <div
        className="animate-blob absolute -top-32 -right-32 h-96 w-96 rounded-full opacity-30"
        style={{
          background: 'radial-gradient(circle, #7B5CFA 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
      <div
        className="animate-blob absolute top-1/2 -left-48 h-80 w-80 rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, #FF5DA2 0%, transparent 70%)',
          filter: 'blur(80px)',
          animationDelay: '7s',
        }}
      />
      <div
        className="animate-blob absolute -bottom-24 right-1/4 h-72 w-72 rounded-full opacity-25"
        style={{
          background: 'radial-gradient(circle, #34E4EA 0%, transparent 70%)',
          filter: 'blur(80px)',
          animationDelay: '14s',
        }}
      />
    </div>
  )
}

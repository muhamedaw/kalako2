import { useReducedMotion } from 'framer-motion'

export default function AnimatedBackground() {
  const reducedMotion = useReducedMotion()

  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      <div
        className="absolute inset-0"
        style={{ background: '#3A2143' }}
      />

      {!reducedMotion && (
        <div className="mesh-gradient-container absolute inset-0">
          <div className="mesh-blob mesh-blob-1" />
          <div className="mesh-blob mesh-blob-2" />
          <div className="mesh-blob mesh-blob-3" />
          <div className="mesh-blob mesh-blob-4" />
        </div>
      )}

      <div className="dot-grid-overlay" />
    </div>
  )
}

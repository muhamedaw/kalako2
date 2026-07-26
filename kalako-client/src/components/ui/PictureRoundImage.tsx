import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface PictureRoundImageProps {
  src: string
  alt: string
  sourceAttribution?: string | null
}

export default function PictureRoundImage({ src, alt, sourceAttribution }: PictureRoundImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  return (
    <div className="relative w-full flex flex-col items-center">
      <div className="relative w-full max-h-64 rounded-xl overflow-hidden bg-white/5">
        {!loaded && !error && (
          <div className="w-full h-48 animate-pulse bg-white/10 rounded-xl" />
        )}
        <AnimatePresence>
          {!error && (
            <motion.img
              src={src}
              alt={alt}
              initial={{ opacity: 0 }}
              animate={{ opacity: loaded ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              onLoad={() => setLoaded(true)}
              onError={() => setError(true)}
              className="w-full object-contain max-h-64"
            />
          )}
        </AnimatePresence>
        {error && (
          <div className="w-full h-48 flex flex-col items-center justify-center gap-2 text-white/50">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs">Image unavailable</span>
          </div>
        )}
      </div>
      {sourceAttribution && (
        <p className="text-[10px] text-white/50 mt-1 px-2 text-center leading-tight" dir="auto">
          {sourceAttribution}
        </p>
      )}
    </div>
  )
}

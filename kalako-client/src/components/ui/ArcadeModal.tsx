import { motion } from 'framer-motion'

interface ArcadeModalProps {
  onClose?: () => void
  children: React.ReactNode
}

export default function ArcadeModal({ onClose, children }: ArcadeModalProps) {

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.85, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, y: 20 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="bg-[#FFE600] border-4 border-[#0A0A0A] shadow-[6px_6px_0_#0A0A0A] w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

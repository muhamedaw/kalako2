import { Settings } from 'lucide-react'
import { useTranslation } from '@/i18n/context'

interface Props {
  onClick: () => void
}

export default function SettingsGearButton({ onClick }: Props) {
  const t = useTranslation()
  return (
    <button
      onClick={onClick}
      className="fixed top-4 start-4 z-50 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
      style={{
        background: '#FF6B35',
        border: '4px solid #0A0A0A',
      }}
      aria-label={t.settingsTitle}
    >
      <Settings size={18} className="text-white/70" />
    </button>
  )
}

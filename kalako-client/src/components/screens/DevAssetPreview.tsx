import { motion } from 'framer-motion'
import { ComposedAvatar, getAvatarConfig } from '@/components/avatarParts'
import LogoHorizontal from '@/components/brand/LogoHorizontal'
import LogoSquare from '@/components/brand/LogoSquare'
import CategoryIcon from '@/components/brand/CategoryIcon'
import ThemedQRCode from '@/components/brand/ThemedQRCode'
import ResultsShareCard from '@/components/brand/ResultsShareCard'
import SplashScreen from '@/components/brand/SplashScreen'
import LobbyBackground from '@/components/brand/LobbyBackground'
import { ScoreMultiplier, BlindVote, MostDeceptive, FamilyAdults } from '@/components/brand/icons'
import { useSFX } from '@/components/brand/useSFX'
import { CATEGORIES } from '@/components/brand/theme'
import { useGameStore } from '@/store/gameStore'
import { useTranslation } from '@/i18n/context'

export default function DevAssetPreview() {
  const setScreen = useGameStore((s) => s.setScreen)
  const t = useTranslation()

  return (
    <div className="min-h-screen p-4 pb-32 overflow-x-hidden" dir="ltr">
      <div className="max-w-6xl mx-auto space-y-16">

        {/* HEADER */}
        <div className="text-center space-y-2 pt-4">
          <h1 className="text-3xl font-heading font-black text-primary">{t.devPreviewTitle}</h1>
          <p className="text-white/50">{t.devPreviewSubtitle}</p>
          <button onClick={() => setScreen('welcome')} className="text-sm text-white/30 hover:text-white/60 underline cursor-pointer">{t.devPreviewBack}</button>
        </div>

        {/* 1. LOGOS */}
        <section className="space-y-4">
          <h2 className="text-xl font-heading font-bold text-secondary">{t.devPreviewLogos}</h2>
          <div className="grid md:grid-cols-2 gap-6 items-center bg-white/5 rounded-2xl p-6 border border-white/10">
            <div><p className="text-white/50 text-sm mb-2">{t.devPreviewHorizontal}</p><LogoHorizontal className="w-full max-w-md" /></div>
            <div><p className="text-white/50 text-sm mb-2">{t.devPreviewSquare}</p><LogoSquare className="w-32 h-32" /></div>
          </div>
        </section>

        {/* 2. AVATARS */}
        <section className="space-y-4">
          <h2 className="text-xl font-heading font-bold text-secondary">{t.devPreviewAvatars}</h2>
          <div className="space-y-4">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <p className="text-white/50 text-sm mb-3">Composed Avatars</p>
              <div className="flex flex-wrap gap-2" style={{ direction: 'ltr' }}>
                {Array.from({ length: 16 }, (_, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <ComposedAvatar {...getAvatarConfig(i + 1)} size={60} />
                    <span className="text-[10px] text-white/30 mt-1">#{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 3. CATEGORY ICONS */}
        <section className="space-y-4">
          <h2 className="text-xl font-heading font-bold text-secondary">{t.devPreviewCategoryIcons}</h2>
          <div className="flex flex-wrap gap-4 bg-white/5 rounded-2xl p-6 border border-white/10">
            {CATEGORIES.map((cat) => (
              <div key={cat.id} className="flex flex-col items-center gap-2">
                <CategoryIcon categoryId={cat.id} size={80} />
                <span className="text-xs text-white/50">{cat.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 4. EXTRA ICONS */}
        <section className="space-y-4">
          <h2 className="text-xl font-heading font-bold text-secondary">{t.devPreviewExtraIcons}</h2>
          <div className="flex flex-wrap gap-6 items-center bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="flex flex-col items-center gap-1"><ScoreMultiplier size={64} /><span className="text-xs text-white/50">{t.devPreviewScoreMultiplier}</span></div>
            <div className="flex flex-col items-center gap-1"><BlindVote size={64} /><span className="text-xs text-white/50">{t.devPreviewBlindVote}</span></div>
            <div className="flex flex-col items-center gap-1"><MostDeceptive size={72} /><span className="text-xs text-white/50">{t.devPreviewMostDeceptive}</span></div>
            <div className="flex flex-col items-center gap-1"><FamilyAdults size={64} variant="family" /><span className="text-xs text-white/50">{t.devPreviewFamily}</span></div>
            <div className="flex flex-col items-center gap-1"><FamilyAdults size={64} variant="adults" /><span className="text-xs text-white/50">{t.devPreviewAdults}</span></div>
          </div>
        </section>

        {/* 5. SOUND FX */}
        <section className="space-y-4">
          <h2 className="text-xl font-heading font-bold text-secondary">{t.devPreviewSoundFx}</h2>
          <SoundButtons />
        </section>

        {/* 6. QR CODE */}
        <section className="space-y-4">
          <h2 className="text-xl font-heading font-bold text-secondary">{t.devPreviewQrCode}</h2>
          <div className="flex flex-wrap gap-8 items-center bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="flex flex-col items-center gap-2">
              <p className="text-white/50 text-sm">{t.devPreviewWithNeon}</p>
              <ThemedQRCode value={`${window.location.origin}/?join=ABC123`} size={120} />
            </div>
            <div className="flex flex-col items-center gap-2">
              <p className="text-white/50 text-sm">{t.devPreviewSmall}</p>
              <ThemedQRCode value={`${window.location.origin}/?join=DEV42`} size={80} />
            </div>
          </div>
        </section>

        {/* 7. SHARE CARD */}
        <section className="space-y-4">
          <h2 className="text-xl font-heading font-bold text-secondary">{t.devPreviewShareCard}</h2>
          <div className="grid md:grid-cols-2 gap-4 bg-white/5 rounded-2xl p-6 border border-white/10">
            <ResultsShareCard playerName="أحمد" score={420} rank={1} totalPlayers={6} />
            <ResultsShareCard playerName="سارة" score={280} rank={2} totalPlayers={6} />
            <ResultsShareCard playerName="محمد" score={150} rank={3} totalPlayers={6} />
            <ResultsShareCard playerName="نورة" score={50} rank={4} totalPlayers={6} />
          </div>
        </section>

        {/* 8. SPLASH SCREEN */}
        <section className="space-y-4">
          <h2 className="text-xl font-heading font-bold text-secondary">{t.devPreviewSplash}</h2>
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="relative w-full max-w-[270px] mx-auto aspect-[9/16] overflow-hidden rounded-2xl border border-white/20">
              <SplashScreen />
            </div>
          </div>
        </section>

        {/* 9. LOBBY BACKGROUND */}
        <section className="space-y-4">
          <h2 className="text-xl font-heading font-bold text-secondary">{t.devPreviewLobbyBg}</h2>
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="relative w-full max-w-[270px] mx-auto aspect-[9/16] overflow-hidden rounded-2xl border border-white/20">
              <LobbyBackground />
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}

function SoundButtons() {
  const sfx = useSFX()
  const t = useTranslation()
  const buttons: { label: string; action: keyof typeof sfx }[] = [
    { label: t.devPreviewJoin, action: 'playJoin' },
    { label: t.devPreviewCountdown, action: 'playCountdown' },
    { label: t.devPreviewSubmit, action: 'playSubmit' },
    { label: t.devPreviewVote, action: 'playVoteStart' },
    { label: t.devPreviewCorrect, action: 'playCorrect' },
    { label: t.devPreviewTricked, action: 'playTricked' },
    { label: t.devPreviewWin, action: 'playWin' },
  ]
  return (
    <div className="flex flex-wrap gap-3 bg-white/5 rounded-2xl p-6 border border-white/10">
      {buttons.map((b) => (
        <motion.button
          key={b.action}
          whileTap={{ scale: 0.92 }}
          onClick={() => sfx[b.action]()}
          className="px-5 py-2.5 rounded-xl font-heading font-bold text-sm cursor-pointer transition-all"
        >
          {b.label}
        </motion.button>
      ))}
    </div>
  )
}

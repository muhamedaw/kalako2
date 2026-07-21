import { useRef, useEffect, useCallback } from 'react'
import { COLORS } from './theme'

interface Props {
  playerName: string
  score: number
  rank: number
  totalPlayers?: number
  onDataUrl?: (url: string) => void
}

const CARD_W = 600
const CARD_H = 315

export default function ResultsShareCard({ playerName, score, rank, totalPlayers = 4, onDataUrl }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = CARD_W * dpr
    canvas.height = CARD_H * dpr
    ctx.scale(dpr, dpr)

    const bg = ctx.createLinearGradient(0, 0, 0, CARD_H)
    bg.addColorStop(0, COLORS.bgStart)
    bg.addColorStop(1, COLORS.bgEnd)
    ctx.fillStyle = bg
    ctx.beginPath()
    ctx.roundRect(0, 0, CARD_W, CARD_H, 24)
    ctx.fill()

    ctx.shadowColor = COLORS.primary + '40'
    ctx.shadowBlur = 30
    ctx.strokeStyle = COLORS.primary
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(4, 4, CARD_W - 8, CARD_H - 8, 22)
    ctx.stroke()
    ctx.shadowBlur = 0

    const inner = ctx.createLinearGradient(0, 0, 0, CARD_H)
    inner.addColorStop(0, 'rgba(255,255,255,0.04)')
    inner.addColorStop(1, 'rgba(255,255,255,0.01)')
    ctx.fillStyle = inner
    ctx.beginPath()
    ctx.roundRect(12, 12, CARD_W - 24, CARD_H - 24, 16)
    ctx.fill()

    ctx.shadowColor = COLORS.warning + '50'
    ctx.shadowBlur = 15
    ctx.fillStyle = COLORS.warning
    ctx.beginPath()
    const cx = 108, cy = 78, s = 34
    ctx.moveTo(cx, cy - s)
    ctx.lineTo(cx + s * 0.224, cy - s * 0.309)
    ctx.lineTo(cx + s * 0.951, cy - s * 0.309)
    ctx.lineTo(cx + s * 0.364, cy + s * 0.118)
    ctx.lineTo(cx + s * 0.588, cy + s * 0.809)
    ctx.lineTo(cx, cy + s * 0.382)
    ctx.lineTo(cx - s * 0.588, cy + s * 0.809)
    ctx.lineTo(cx - s * 0.364, cy + s * 0.118)
    ctx.lineTo(cx - s * 0.951, cy - s * 0.309)
    ctx.lineTo(cx - s * 0.224, cy - s * 0.309)
    ctx.closePath()
    ctx.fill()
    ctx.shadowBlur = 0

    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 18px Cairo, Tajawal, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('تحدي الإجابات', 108, 118)
    ctx.fillStyle = COLORS.warning
    ctx.font = 'bold 12px Cairo, Tajawal, sans-serif'
    ctx.fillText('لعبة خداع جماعية', 108, 140)

    const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32', COLORS.success]
    const rankLabel = rank <= 3 ? ['الأول', 'الثاني', 'الثالث'][rank - 1] : `#${rank}`
    ctx.shadowColor = (rankColors[rank - 1] || COLORS.success) + '60'
    ctx.shadowBlur = 20
    ctx.fillStyle = rankColors[rank - 1] || COLORS.success
    ctx.font = 'bold 28px Cairo, Tajawal, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(rankLabel, 108, 235)
    ctx.shadowBlur = 0
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.font = '12px Tajawal, sans-serif'
    ctx.fillText(`من أصل ${totalPlayers}`, 108, 260)

    const y0 = 50
    ctx.shadowColor = COLORS.primary + '50'
    ctx.shadowBlur = 15
    ctx.fillStyle = COLORS.primary
    ctx.font = 'bold 14px Cairo, Tajawal, sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText('اللاعب', 540, y0 + 28)
    ctx.shadowBlur = 0
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 36px Cairo, Tajawal, sans-serif'
    ctx.fillText(playerName, 540, y0 + 80)

    ctx.shadowColor = COLORS.success + '50'
    ctx.shadowBlur = 15
    ctx.fillStyle = COLORS.success
    ctx.font = 'bold 14px Cairo, Tajawal, sans-serif'
    ctx.fillText('النقاط', 540, y0 + 125)
    ctx.shadowBlur = 0
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 48px Cairo, Tajawal, sans-serif'
    ctx.fillText(String(score), 540, y0 + 185)

    ctx.shadowColor = COLORS.secondary + '40'
    ctx.shadowBlur = 10
    ctx.fillStyle = COLORS.secondary
    ctx.font = 'bold 12px Cairo, Tajawal, sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText('kalako.app', 540, 290)
    ctx.shadowBlur = 0

    const url = canvas.toDataURL('image/png')
    onDataUrl?.(url)
  }, [playerName, score, rank, totalPlayers, onDataUrl])

  useEffect(() => { draw() }, [draw])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: CARD_W, height: CARD_H, borderRadius: 24, maxWidth: '100%' }}
      aria-label={`نتيجة ${playerName}: ${score} نقطة - المرتبة ${rank}`}
    />
  )
}

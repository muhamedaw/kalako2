import { toPng } from 'html-to-image'
import confetti from 'canvas-confetti'

export async function captureScreenshot(elementId: string) {
  const el = document.getElementById(elementId)
  if (!el) return
  try {
    const dataUrl = await toPng(el, {
      backgroundColor: '#0F172A',
      pixelRatio: 2,
      width: 400,
      style: { direction: 'rtl' },
    })
    const link = document.createElement('a')
    link.download = `كلاكو-نتيجة-${Date.now()}.png`
    link.href = dataUrl
    link.click()
  } catch {
    console.error('Screenshot failed')
  }
}

export function fireConfetti() {
  const duration = 3000
  const end = Date.now() + duration

  const colors = ['#2DD4BF', '#0EA5E9', '#10B981', '#F59E0B', '#38BDF8']

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors,
    })
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors,
    })
    if (Date.now() < end) requestAnimationFrame(frame)
  }
  frame()
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

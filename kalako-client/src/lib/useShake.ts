import { useCallback, useRef, useState } from 'react'

export function useShake(duration = 500) {
  const [shaking, setShaking] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const trigger = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setShaking(true)
    timerRef.current = setTimeout(() => setShaking(false), duration)
  }, [duration])

  return { shaking, trigger }
}

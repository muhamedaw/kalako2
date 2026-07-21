import { useCallback, useRef } from 'react'

type SoundName =
  | 'join'
  | 'countdown'
  | 'submitAnswer'
  | 'voteStart'
  | 'correct'
  | 'tricked'
  | 'win'

const SOUND_CONFIGS: Record<SoundName, {
  freq: number
  duration: number
  type: OscillatorType
  ramp?: 'up' | 'down' | 'both'
  repeat?: number
  delay?: number
}> = {
  join: { freq: 660, duration: 0.15, type: 'sine', ramp: 'up' },
  countdown: { freq: 440, duration: 0.1, type: 'square', ramp: 'down' },
  submitAnswer: { freq: 520, duration: 0.12, type: 'sine', ramp: 'up' },
  voteStart: { freq: 880, duration: 0.08, type: 'sine', ramp: 'both', repeat: 3, delay: 0.1 },
  correct: { freq: 1047, duration: 0.2, type: 'sine', ramp: 'up' },
  tricked: { freq: 200, duration: 0.3, type: 'sawtooth', ramp: 'down' },
  win: { freq: 784, duration: 0.18, type: 'sine', ramp: 'both', repeat: 4, delay: 0.12 },
}

function playTone(config: typeof SOUND_CONFIGS[keyof typeof SOUND_CONFIGS], volume = 0.15) {
  try {
    const ctx = new AudioContext()
    const gain = ctx.createGain()
    gain.connect(ctx.destination)
    gain.gain.setValueAtTime(volume, ctx.currentTime)

    const osc = ctx.createOscillator()
    osc.type = config.type
    osc.frequency.setValueAtTime(config.freq, ctx.currentTime)

    if (config.ramp === 'up') {
      osc.frequency.linearRampToValueAtTime(config.freq * 1.5, ctx.currentTime + config.duration)
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + config.duration)
    } else if (config.ramp === 'down') {
      osc.frequency.linearRampToValueAtTime(config.freq * 0.5, ctx.currentTime + config.duration)
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + config.duration)
    } else {
      osc.frequency.setValueAtTime(config.freq, ctx.currentTime)
      osc.frequency.linearRampToValueAtTime(config.freq * 1.3, ctx.currentTime + config.duration / 2)
      osc.frequency.linearRampToValueAtTime(config.freq, ctx.currentTime + config.duration)
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + config.duration)
    }

    osc.connect(gain)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + config.duration)
    setTimeout(() => ctx.close(), config.duration * 1000 + 100)
  } catch {
    // Audio not available
  }
}

function playSequence(config: typeof SOUND_CONFIGS[keyof typeof SOUND_CONFIGS]) {
  if (!config.repeat) {
    playTone(config)
    return
  }
  for (let i = 0; i < config.repeat; i++) {
    setTimeout(() => playTone(config), (config.delay ?? 0.1) * 1000 * i)
  }
}

export function useSounds() {
  const enabledRef = useRef(true)

  const play = useCallback((name: SoundName) => {
    if (!enabledRef.current) return
    const config = SOUND_CONFIGS[name]
    if (config.repeat) {
      playSequence(config)
    } else {
      playTone(config)
    }
  }, [])

  const setEnabled = useCallback((val: boolean) => {
    enabledRef.current = val
  }, [])

  return { play, setEnabled }
}

export function playSound(name: SoundName) {
  const config = SOUND_CONFIGS[name]
  if (config.repeat) {
    playSequence(config)
  } else {
    playTone(config)
  }
}

import { useSounds } from './useSounds'

export function useSFX() {
  const { play } = useSounds()
  return {
    playJoin: () => play('join'),
    playCountdown: () => play('countdown'),
    playSubmit: () => play('submitAnswer'),
    playVoteStart: () => play('voteStart'),
    playCorrect: () => play('correct'),
    playTricked: () => play('tricked'),
    playWin: () => play('win'),
  }
}

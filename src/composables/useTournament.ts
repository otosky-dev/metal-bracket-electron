import { ref, computed, watch } from 'vue'
import type { Album, Match, Round, Tournament } from '../types'

const STORAGE_KEY = 'metal-bracket-tournament'

const ROUND_NAMES: Record<number, string> = {
  16: 'Premier tour',
  8: 'Huitièmes',
  4: 'Quarts de finale',
  2: 'Demi-finales',
  1: 'Finale',
}

function createRounds(albums: Album[]): Round[] {
  const shuffled = [...albums].sort(() => Math.random() - 0.5)
  const rounds: Round[] = []

  // First round: 16 matches from 32 albums
  const firstRoundMatches: Match[] = []
  for (let i = 0; i < shuffled.length; i += 2) {
    firstRoundMatches.push({
      id: `r0-m${i / 2}`,
      album1: shuffled[i],
      album2: shuffled[i + 1],
      winner: null,
    })
  }
  rounds.push({ name: ROUND_NAMES[firstRoundMatches.length] ?? `Tour ${firstRoundMatches.length}`, matches: firstRoundMatches })

  // Create empty subsequent rounds
  let matchCount = firstRoundMatches.length / 2
  let roundIndex = 1
  while (matchCount >= 1) {
    const matches: Match[] = []
    for (let i = 0; i < matchCount; i++) {
      matches.push({
        id: `r${roundIndex}-m${i}`,
        album1: null,
        album2: null,
        winner: null,
      })
    }
    rounds.push({ name: ROUND_NAMES[matchCount] ?? `Tour ${matchCount}`, matches })
    matchCount = matchCount / 2
    roundIndex++
  }

  return rounds
}

function loadFromStorage(): Tournament | null {
  const data = localStorage.getItem(STORAGE_KEY)
  if (!data) return null
  try {
    return JSON.parse(data) as Tournament
  } catch {
    return null
  }
}

function saveToStorage(tournament: Tournament) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tournament))
}

export function useTournament() {
  const saved = loadFromStorage()

  const started = ref(saved !== null)

  const tournament = ref<Tournament>(
    saved ?? {
      year: new Date().getFullYear(),
      rounds: [],
      eliminated: [],
      currentRoundIndex: 0,
      currentMatchIndex: 0,
      finished: false,
    }
  )

  const currentRound = computed(() => tournament.value.rounds[tournament.value.currentRoundIndex])

  const currentMatch = computed(() => {
    const round = currentRound.value
    if (!round) return null
    return round.matches[tournament.value.currentMatchIndex] ?? null
  })

  const champion = computed(() => {
    if (!tournament.value.finished) return null
    const finalRound = tournament.value.rounds[tournament.value.rounds.length - 1]
    return finalRound.matches[0].winner
  })

  function advanceToNextMatch() {
    const t = tournament.value
    const round = t.rounds[t.currentRoundIndex]

    // Find the next unresolved match in current round
    for (let i = t.currentMatchIndex + 1; i < round.matches.length; i++) {
      if (!round.matches[i].winner) {
        t.currentMatchIndex = i
        return
      }
    }

    // Current round complete — check if all matches decided
    const allDecided = round.matches.every(m => m.winner)
    if (!allDecided) {
      // Find first undecided
      const idx = round.matches.findIndex(m => !m.winner)
      if (idx !== -1) {
        t.currentMatchIndex = idx
        return
      }
    }

    // Move to next round
    if (t.currentRoundIndex < t.rounds.length - 1) {
      t.currentRoundIndex++
      t.currentMatchIndex = 0
    } else {
      t.finished = true
    }
  }

  function pickWinner(album: Album) {
    const t = tournament.value
    const match = currentMatch.value
    if (!match || t.finished) return

    // Set winner
    match.winner = album

    // Track eliminated album
    const loser = match.album1?.id === album.id ? match.album2 : match.album1
    if (loser) {
      t.eliminated.push(loser)
    }

    // Propagate winner to next round
    const nextRoundIndex = t.currentRoundIndex + 1
    if (nextRoundIndex < t.rounds.length) {
      const nextRound = t.rounds[nextRoundIndex]
      const matchIndexInNextRound = Math.floor(t.currentMatchIndex / 2)
      const nextMatch = nextRound.matches[matchIndexInNextRound]
      if (t.currentMatchIndex % 2 === 0) {
        nextMatch.album1 = album
      } else {
        nextMatch.album2 = album
      }
    }

    advanceToNextMatch()
    saveToStorage(t)
  }

  function start(year: number, albums: Album[]) {
    const fresh: Tournament = {
      year,
      rounds: createRounds(albums),
      eliminated: [],
      currentRoundIndex: 0,
      currentMatchIndex: 0,
      finished: false,
    }
    tournament.value = fresh
    started.value = true
    saveToStorage(fresh)
  }

  function reset() {
    started.value = false
    localStorage.removeItem(STORAGE_KEY)
  }

  // Auto-save on any change
  watch(tournament, (val) => saveToStorage(val), { deep: true })

  return {
    tournament,
    started,
    currentRound,
    currentMatch,
    champion,
    pickWinner,
    start,
    reset,
  }
}

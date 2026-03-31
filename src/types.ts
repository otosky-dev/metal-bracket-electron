export type Album = {
  id: string
  name: string
  artist: string
  cover: string
}

export type Match = {
  id: string
  album1: Album | null
  album2: Album | null
  winner: Album | null
}

export type Round = {
  name: string
  matches: Match[]
}

export type Tournament = {
  year: number
  rounds: Round[]
  eliminated: Album[]
  currentRoundIndex: number
  currentMatchIndex: number
  finished: boolean
}

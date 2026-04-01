export type Album = {
  id: string
  name: string
  artist: string
  cover: string
}

export type Replacement = {
  type: 'replace' | 'forceWin'
  slot: 'album1' | 'album2'
  replaced: Album
  replacement: Album
  evicted?: [Album, Album]
}

export type Match = {
  id: string
  album1: Album | null
  album2: Album | null
  winner: Album | null
  replacement?: Replacement | null
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

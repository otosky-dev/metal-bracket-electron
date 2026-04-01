<script setup lang="ts">
import { computed } from 'vue'
import type { Tournament, Match } from '../types'
import BracketEntry from './BracketEntry.vue'

const props = defineProps<{
  tournament: Tournament
  viewingMatchId?: string | null
  currentMatchId?: string | null
}>()

defineEmits<{
  selectMatch: [match: Match]
}>()

const topRounds = computed(() => {
  return props.tournament.rounds.slice(0, -1).map((round) => ({
    name: round.name,
    matches: round.matches.slice(0, round.matches.length / 2),
  }))
})

const bottomRounds = computed(() => {
  return props.tournament.rounds.slice(0, -1).map((round) => ({
    name: round.name,
    matches: round.matches.slice(round.matches.length / 2),
  }))
})

const finale = computed(() => {
  const lastRound = props.tournament.rounds[props.tournament.rounds.length - 1]
  return lastRound?.matches[0] ?? null
})

function isForceWin(match: Match) {
  return match.replacement?.type === 'forceWin'
}

function is493Slot(match: Match, slot: 'album1' | 'album2') {
  if (!match.replacement) return false
  if (isForceWin(match)) return false
  return match.replacement.slot === slot
}

function forceWinTooltip(match: Match) {
  const evicted = match.replacement?.evicted
  if (!evicted) return '49.3 — Victoire forcée'
  return `49.3 — Victoire forcée\nÉvincés : ${evicted[0].artist} — ${evicted[0].name} / ${evicted[1].artist} — ${evicted[1].name}`
}

function replaceTooltip(match: Match) {
  if (!match.replacement) return ''
  return `49.3 — ${match.replacement.replaced.artist} — ${match.replacement.replaced.name} remplacé`
}
</script>

<template>
  <div class="w-full overflow-x-auto pb-4">
    <!-- Top sub-bracket -->
    <div class="flex flex-col items-center mb-6">
      <div
        v-for="(round, roundIndex) in topRounds"
        :key="'top-' + roundIndex"
        class="w-full"
      >
        <hr v-if="roundIndex > 0" class="border-doom-700 my-3" />
        <h3 class="text-lg font-doom text-ochre text-center mb-3 tracking-wide">
          {{ round.name }}
        </h3>
        <div class="flex flex-wrap justify-center gap-4">
          <div
            v-for="match in round.matches"
            :key="match.id"
            class="flex flex-col gap-2 rounded-lg p-3 w-80 transition-all border"
            :class="[
              match.winner ? 'bg-doom-900/60 border-doom-700' : 'bg-doom-900/30 border-transparent',
              match.winner ? 'cursor-pointer hover:border-ochre/40' : '',
              viewingMatchId === match.id ? 'border-ochre shadow-[0_0_12px_rgba(212,160,64,0.15)]' : '',
              currentMatchId === match.id ? '!border-ochre !border-2 !bg-ochre/10 shadow-[0_0_30px_rgba(212,160,64,0.4)] scale-105 z-10' : '',
            ]"
            @click="match.winner && $emit('selectMatch', match)"
          >
            <template v-if="isForceWin(match)">
              <BracketEntry :album="match.winner" :is-winner="true" :is493="true" :tooltip-text="forceWinTooltip(match)" />
            </template>
            <template v-else>
              <BracketEntry :album="match.album1" :is-winner="match.winner?.id === match.album1?.id" :is493="is493Slot(match, 'album1')" :tooltip-text="replaceTooltip(match)" />
              <BracketEntry :album="match.album2" :is-winner="match.winner?.id === match.album2?.id" :is493="is493Slot(match, 'album2')" :tooltip-text="replaceTooltip(match)" />
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Finale -->
    <hr class="border-doom-700 my-3" />
    <div v-if="finale" class="flex justify-center my-6">
      <div class="flex flex-col items-center gap-2">
        <h3 class="text-3xl font-doom text-ochre tracking-wide">Finale</h3>
        <div
          class="flex gap-8 items-center rounded-xl p-6 border-2 transition-all"
          :class="[
            finale.winner ? 'bg-ochre/10 cursor-pointer' : 'bg-doom-900/50',
            viewingMatchId === finale.id ? 'border-ochre shadow-[0_0_20px_rgba(212,160,64,0.2)]' : 'border-ochre/30',
            currentMatchId === finale.id ? '!border-ochre !bg-ochre/10 shadow-[0_0_40px_rgba(212,160,64,0.5)] scale-105' : '',
          ]"
          @click="finale.winner && $emit('selectMatch', finale)"
        >
          <template v-if="isForceWin(finale)">
            <BracketEntry :album="finale.winner" :is-winner="true" :is493="true" :tooltip-text="forceWinTooltip(finale)" />
          </template>
          <template v-else>
            <BracketEntry :album="finale.album1" :is-winner="finale.winner?.id === finale.album1?.id" :is493="is493Slot(finale, 'album1')" :tooltip-text="replaceTooltip(finale)" />
            <span class="text-doom-600 font-doom text-xl select-none">VS</span>
            <BracketEntry :album="finale.album2" :is-winner="finale.winner?.id === finale.album2?.id" :is493="is493Slot(finale, 'album2')" :tooltip-text="replaceTooltip(finale)" />
          </template>
        </div>
      </div>
    </div>

    <hr class="border-doom-700 my-3" />

    <!-- Bottom sub-bracket -->
    <div class="flex flex-col-reverse items-center mt-6">
      <div
        v-for="(round, roundIndex) in bottomRounds"
        :key="'bot-' + roundIndex"
        class="w-full"
      >
        <hr v-if="roundIndex < bottomRounds.length - 1" class="border-doom-700 my-3" />
        <div class="flex flex-wrap justify-center gap-4">
          <div
            v-for="match in round.matches"
            :key="match.id"
            class="flex flex-col gap-2 rounded-lg p-3 w-80 transition-all border"
            :class="[
              match.winner ? 'bg-doom-900/60 border-doom-700' : 'bg-doom-900/30 border-transparent',
              match.winner ? 'cursor-pointer hover:border-ochre/40' : '',
              viewingMatchId === match.id ? 'border-ochre shadow-[0_0_12px_rgba(212,160,64,0.15)]' : '',
              currentMatchId === match.id ? '!border-ochre !border-2 !bg-ochre/10 shadow-[0_0_30px_rgba(212,160,64,0.4)] scale-105 z-10' : '',
            ]"
            @click="match.winner && $emit('selectMatch', match)"
          >
            <template v-if="isForceWin(match)">
              <BracketEntry :album="match.winner" :is-winner="true" :is493="true" :tooltip-text="forceWinTooltip(match)" />
            </template>
            <template v-else>
              <BracketEntry :album="match.album1" :is-winner="match.winner?.id === match.album1?.id" :is493="is493Slot(match, 'album1')" :tooltip-text="replaceTooltip(match)" />
              <BracketEntry :album="match.album2" :is-winner="match.winner?.id === match.album2?.id" :is493="is493Slot(match, 'album2')" :tooltip-text="replaceTooltip(match)" />
            </template>
          </div>
        </div>
        <h3 class="text-lg font-doom text-ochre text-center mt-3 tracking-wide">
          {{ round.name }}
        </h3>
      </div>
    </div>
  </div>
</template>

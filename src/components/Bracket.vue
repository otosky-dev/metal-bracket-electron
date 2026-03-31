<script setup lang="ts">
import { computed } from 'vue'
import type { Tournament, Match } from '../types'
import BracketEntry from './BracketEntry.vue'

const props = defineProps<{
  tournament: Tournament
  viewingMatchId?: string | null
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
        <h3 class="text-base font-doom text-ochre text-center mb-2 tracking-wide">
          {{ round.name }}
        </h3>
        <div class="flex flex-wrap justify-center gap-3">
          <div
            v-for="match in round.matches"
            :key="match.id"
            class="flex flex-col gap-1.5 rounded-lg p-2 w-64 transition-all border"
            :class="[
              match.winner ? 'bg-doom-900/60 border-doom-700' : 'bg-doom-900/30 border-transparent',
              match.winner ? 'cursor-pointer hover:border-ochre/40' : '',
              viewingMatchId === match.id ? 'border-ochre shadow-[0_0_12px_rgba(212,160,64,0.15)]' : '',
            ]"
            @click="match.winner && $emit('selectMatch', match)"
          >
            <BracketEntry :album="match.album1" :is-winner="match.winner?.id === match.album1?.id" />
            <BracketEntry :album="match.album2" :is-winner="match.winner?.id === match.album2?.id" />
          </div>
        </div>
      </div>
    </div>

    <!-- Finale -->
    <hr class="border-doom-700 my-3" />
    <div v-if="finale" class="flex justify-center my-6">
      <div class="flex flex-col items-center gap-2">
        <h3 class="text-2xl font-doom text-ochre tracking-wide">Finale</h3>
        <div
          class="flex gap-6 items-center rounded-xl p-4 border-2 transition-all"
          :class="[
            finale.winner ? 'bg-ochre/10 cursor-pointer' : 'bg-doom-900/50',
            viewingMatchId === finale.id ? 'border-ochre shadow-[0_0_20px_rgba(212,160,64,0.2)]' : 'border-ochre/30',
          ]"
          @click="finale.winner && $emit('selectMatch', finale)"
        >
          <BracketEntry :album="finale.album1" :is-winner="finale.winner?.id === finale.album1?.id" />
          <span class="text-doom-600 font-doom text-lg select-none">VS</span>
          <BracketEntry :album="finale.album2" :is-winner="finale.winner?.id === finale.album2?.id" />
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
        <div class="flex flex-wrap justify-center gap-3">
          <div
            v-for="match in round.matches"
            :key="match.id"
            class="flex flex-col gap-1.5 rounded-lg p-2 w-64 transition-all border"
            :class="[
              match.winner ? 'bg-doom-900/60 border-doom-700' : 'bg-doom-900/30 border-transparent',
              match.winner ? 'cursor-pointer hover:border-ochre/40' : '',
              viewingMatchId === match.id ? 'border-ochre shadow-[0_0_12px_rgba(212,160,64,0.15)]' : '',
            ]"
            @click="match.winner && $emit('selectMatch', match)"
          >
            <BracketEntry :album="match.album1" :is-winner="match.winner?.id === match.album1?.id" />
            <BracketEntry :album="match.album2" :is-winner="match.winner?.id === match.album2?.id" />
          </div>
        </div>
        <h3 class="text-base font-doom text-ochre text-center mt-2 tracking-wide">
          {{ round.name }}
        </h3>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Album, Match } from '../types'
import AlbumCard from './AlbumCard.vue'

const props = defineProps<{
  match: Match
  active: boolean
}>()

defineEmits<{
  pick: [album: Album]
  pick493: [album: Album]
}>()
</script>

<template>
  <div
    class="flex items-center gap-14 p-10 rounded-2xl transition-all border"
    :class="active
      ? 'bg-doom-900/80 border-ochre/30 shadow-[0_0_30px_rgba(212,160,64,0.1)]'
      : 'bg-doom-900/40 border-doom-700'"
  >
    <div class="flex flex-col items-center gap-2">
      <AlbumCard
        v-if="match.album1"
        :album="match.album1"
        :clickable="active && !match.winner"
        :highlighted="match.winner?.id === match.album1.id"
        @pick="$emit('pick', $event)"
      />
      <div v-else class="w-64 h-64 rounded-lg bg-doom-800/50 flex items-center justify-center border border-doom-700">
        <span class="text-dust text-xl">En attente</span>
      </div>
      <button
        v-if="active && !match.winner && match.album1"
        @click="$emit('pick493', match.album1)"
        class="mt-1 px-3 py-1.5 text-sm text-blood hover:text-red-400 border border-blood/30 hover:border-blood/60 rounded-lg transition inline-flex items-center gap-1.5 cursor-pointer"
      >
        <img src="/logo_tdd_dark.png" alt="49.3" class="h-4 w-4 object-contain mix-blend-screen" />
        Victoire par 49.3
      </button>
    </div>

    <div class="text-5xl font-doom text-doom-600 select-none">VS</div>

    <div class="flex flex-col items-center gap-2">
      <AlbumCard
        v-if="match.album2"
        :album="match.album2"
        :clickable="active && !match.winner"
        :highlighted="match.winner?.id === match.album2.id"
        @pick="$emit('pick', $event)"
      />
      <div v-else class="w-64 h-64 rounded-lg bg-doom-800/50 flex items-center justify-center border border-doom-700">
        <span class="text-dust text-xl">En attente</span>
      </div>
      <button
        v-if="active && !match.winner && match.album2"
        @click="$emit('pick493', match.album2)"
        class="mt-1 px-3 py-1.5 text-sm text-blood hover:text-red-400 border border-blood/30 hover:border-blood/60 rounded-lg transition inline-flex items-center gap-1.5 cursor-pointer"
      >
        <img src="/logo_tdd_dark.png" alt="49.3" class="h-4 w-4 object-contain mix-blend-screen" />
        Victoire par 49.3
      </button>
    </div>
  </div>
</template>

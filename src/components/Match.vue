<script setup lang="ts">
import type { Album, Match } from '../types'
import AlbumCard from './AlbumCard.vue'

const props = defineProps<{
  match: Match
  active: boolean
}>()

defineEmits<{
  pick: [album: Album]
}>()
</script>

<template>
  <div
    class="flex items-center gap-14 p-10 rounded-2xl transition-all border"
    :class="active
      ? 'bg-doom-900/80 border-ochre/30 shadow-[0_0_30px_rgba(212,160,64,0.1)]'
      : 'bg-doom-900/40 border-doom-700'"
  >
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

    <div class="text-5xl font-doom text-doom-600 select-none">VS</div>

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
  </div>
</template>

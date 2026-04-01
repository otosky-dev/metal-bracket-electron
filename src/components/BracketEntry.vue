<script setup lang="ts">
import type { Album } from '../types'

defineProps<{
  album: Album | null
  isWinner: boolean
  is493?: boolean
}>()
</script>

<template>
  <div
    class="px-3 py-2 rounded w-72 h-14 flex items-center gap-2.5"
    :class="[
      isWinner ? 'bg-ochre/15 text-ochre font-bold' : 'text-dust',
      is493 ? 'ring-1 ring-blood/40' : '',
    ]"
  >
    <template v-if="album">
      <img :src="album.cover" :alt="album.name" class="w-12 h-12 rounded shrink-0 object-cover" />
      <div class="min-w-0 flex flex-col justify-center flex-1">
        <div class="truncate text-lg leading-tight">{{ album.name }}</div>
        <div class="truncate text-base leading-tight opacity-70">{{ album.artist }}</div>
      </div>
      <span v-if="is493" class="shrink-0 text-blood text-base" title="49.3 — Participant remplacé">⚡</span>
    </template>
    <div v-else class="text-base text-doom-600">—</div>
  </div>
</template>

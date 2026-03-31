<script setup lang="ts">
import type { Album } from '../types'

defineProps<{
  album: Album | null
  isWinner: boolean
}>()
</script>

<template>
  <div
    class="px-2 py-1.5 rounded w-60 h-12 flex items-center gap-2"
    :class="isWinner ? 'bg-ochre/15 text-ochre font-bold' : 'text-dust'"
  >
    <template v-if="album">
      <img :src="album.cover" :alt="album.name" class="w-10 h-10 rounded shrink-0 object-cover" />
      <div class="min-w-0 flex flex-col justify-center">
        <div class="truncate text-base leading-tight">{{ album.name }}</div>
        <div class="truncate text-sm leading-tight opacity-70">{{ album.artist }}</div>
      </div>
    </template>
    <div v-else class="text-sm text-doom-600">—</div>
  </div>
</template>

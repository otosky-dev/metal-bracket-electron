<script setup lang="ts">
import { ref } from 'vue'
import type { Album } from '../types'

const props = defineProps<{
  album: Album
  clickable?: boolean
  highlighted?: boolean
}>()

defineEmits<{
  pick: [album: Album]
}>()

const copied = ref(false)

function copyToClipboard(e: Event) {
  e.stopPropagation()
  navigator.clipboard.writeText(`${props.album.artist} - ${props.album.name}`)
  copied.value = true
  setTimeout(() => copied.value = false, 1500)
}
</script>

<template>
  <div
    class="flex flex-col items-center gap-2 transition-all duration-200"
    :class="{
      'cursor-pointer hover:scale-105 hover:brightness-110': clickable,
      'ring-4 ring-ochre rounded-lg shadow-[0_0_20px_rgba(212,160,64,0.25)]': highlighted,
      'opacity-50 grayscale': !clickable && !highlighted,
    }"
    @click="clickable && $emit('pick', album)"
  >
    <img
      :src="album.cover"
      :alt="album.name"
      class="w-56 h-56 object-cover rounded-lg shadow-lg"
    />
    <div class="flex items-center gap-1.5 max-w-56">
      <div class="text-center flex-1 min-w-0">
        <p class="text-lg font-bold text-parchment leading-tight truncate">{{ album.name }}</p>
        <p class="text-base text-dust truncate">{{ album.artist }}</p>
      </div>
      <button
        @click="copyToClipboard"
        class="shrink-0 p-1 rounded hover:bg-doom-800 text-dust hover:text-parchment transition text-sm"
        :title="copied ? 'Copié !' : 'Copier le nom'"
      >
        <svg v-if="copied" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-ochre" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 20 20" fill="currentColor">
          <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
          <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
        </svg>
      </button>
    </div>
  </div>
</template>

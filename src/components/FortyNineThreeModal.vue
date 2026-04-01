<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Album, Match } from '../types'

const PLACEHOLDER_COVER = '/covers/placeholder.svg'

const props = defineProps<{
  match: Match
  eliminated: Album[]
}>()

const emit = defineEmits<{
  close: []
  apply: [slot: 'album1' | 'album2', replacement: Album, fromEliminated: boolean]
  forceWin: [winner: Album, fromEliminated: boolean]
}>()

// Step 0: choose action mode
type Mode = 'replace' | 'forceWin'
const mode = ref<Mode | null>(null)

// Replace flow — Step 1: pick which album to replace
const selectedSlot = ref<'album1' | 'album2' | null>(null)

// Shared — pick source (eliminated or new)
type Source = 'eliminated' | 'new'
const source = ref<Source | null>(null)

// For picking from eliminated
const selectedEliminated = ref<Album | null>(null)

// For creating new participant
const newArtist = ref('')
const newName = ref('')
const newCover = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

const canConfirm = computed(() => {
  if (mode.value === 'replace') {
    if (!selectedSlot.value) return false
  }
  if (source.value === 'eliminated') return selectedEliminated.value !== null
  if (source.value === 'new') return newArtist.value.trim() !== '' && newName.value.trim() !== ''
  return false
})

function buildAlbum(): { album: Album; fromEliminated: boolean } | null {
  if (source.value === 'eliminated' && selectedEliminated.value) {
    return { album: selectedEliminated.value, fromEliminated: true }
  }
  if (source.value === 'new') {
    return {
      album: {
        id: `493-${Date.now()}`,
        artist: newArtist.value.trim(),
        name: newName.value.trim(),
        cover: newCover.value || PLACEHOLDER_COVER,
      },
      fromEliminated: false,
    }
  }
  return null
}

function confirm() {
  if (!canConfirm.value) return
  const result = buildAlbum()
  if (!result) return

  if (mode.value === 'replace' && selectedSlot.value) {
    emit('apply', selectedSlot.value, result.album, result.fromEliminated)
  } else if (mode.value === 'forceWin') {
    emit('forceWin', result.album, result.fromEliminated)
  }
}

function goBack() {
  if (source.value) {
    source.value = null
    selectedEliminated.value = null
    newArtist.value = ''
    newName.value = ''
    newCover.value = ''
  } else if (mode.value === 'replace' && selectedSlot.value) {
    selectedSlot.value = null
  } else if (mode.value) {
    mode.value = null
  } else {
    emit('close')
  }
}

function triggerUpload() {
  fileInput.value?.click()
}

function handleFileUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const maxSize = 300
      let { width, height } = img
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = (height / width) * maxSize
          width = maxSize
        } else {
          width = (width / height) * maxSize
          height = maxSize
        }
      }
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)
      newCover.value = canvas.toDataURL('image/jpeg', 0.8)
    }
    img.src = e.target!.result as string
  }
  reader.readAsDataURL(file)
}

const stepTitle = computed(() => {
  if (!mode.value) return 'Que souhaitez-vous faire ?'
  if (mode.value === 'replace') {
    if (!selectedSlot.value) return 'Quel participant remplacer ?'
    if (!source.value) return 'Comment le remplacer ?'
    if (source.value === 'eliminated') return 'Repêcher un éliminé'
    return 'Nouveau participant'
  }
  // forceWin
  if (!source.value) return 'Qui faire gagner ?'
  if (source.value === 'eliminated') return 'Repêcher un éliminé comme vainqueur'
  return 'Nouveau participant vainqueur'
})
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50" @click.self="$emit('close')">
      <div class="bg-doom-900 border border-doom-700 rounded-xl p-6 w-full max-w-xl mx-4 shadow-2xl">
        <!-- Header -->
        <div class="flex items-center justify-between mb-5">
          <h3 class="text-2xl font-doom text-blood tracking-wide flex items-center gap-2"><img src="/logo_tdd_dark.png" alt="49.3" class="h-7 w-7 object-contain mix-blend-screen" /> 49.3</h3>
          <button
            @click="$emit('close')"
            class="text-dust hover:text-parchment transition text-2xl leading-none"
          >&times;</button>
        </div>

        <p class="text-lg font-doom text-ochre mb-4">{{ stepTitle }}</p>

        <!-- Step 0: Choose action mode -->
        <div v-if="!mode" class="flex flex-col gap-3">
          <button
            @click="mode = 'replace'"
            class="flex items-center gap-3 p-4 rounded-lg border border-doom-700 hover:border-ochre/60 hover:bg-doom-800/60 transition"
          >
            <span class="text-3xl">🔄</span>
            <div class="text-left">
              <p class="text-parchment font-bold text-lg">Remplacer un participant</p>
              <p class="text-dust text-sm">Remplacer un des deux participants du match en cours</p>
            </div>
          </button>
          <button
            @click="mode = 'forceWin'"
            class="flex items-center gap-3 p-4 rounded-lg border border-doom-700 hover:border-ochre/60 hover:bg-doom-800/60 transition"
          >
            <span class="text-3xl">🏆</span>
            <div class="text-left">
              <p class="text-parchment font-bold text-lg">Faire gagner directement</p>
              <p class="text-dust text-sm">Forcer la victoire d'un éliminé ou d'un nouveau participant</p>
            </div>
          </button>
        </div>

        <!-- Replace flow — Step 1: Pick which album to replace -->
        <div v-else-if="mode === 'replace' && !selectedSlot" class="flex flex-col gap-3">
          <button
            v-if="match.album1"
            @click="selectedSlot = 'album1'"
            class="flex items-center gap-3 p-3 rounded-lg border border-doom-700 hover:border-blood/60 hover:bg-doom-800/60 transition text-left"
          >
            <img :src="match.album1.cover" class="w-12 h-12 rounded object-cover" />
            <div>
              <p class="text-parchment font-bold">{{ match.album1.name }}</p>
              <p class="text-dust text-sm">{{ match.album1.artist }}</p>
            </div>
          </button>
          <button
            v-if="match.album2"
            @click="selectedSlot = 'album2'"
            class="flex items-center gap-3 p-3 rounded-lg border border-doom-700 hover:border-blood/60 hover:bg-doom-800/60 transition text-left"
          >
            <img :src="match.album2.cover" class="w-12 h-12 rounded object-cover" />
            <div>
              <p class="text-parchment font-bold">{{ match.album2.name }}</p>
              <p class="text-dust text-sm">{{ match.album2.artist }}</p>
            </div>
          </button>
        </div>

        <!-- Source picker (shared by both modes) -->
        <div v-else-if="!source" class="flex flex-col gap-3">
          <button
            v-if="eliminated.length > 0"
            @click="source = 'eliminated'"
            class="flex items-center gap-3 p-4 rounded-lg border border-doom-700 hover:border-ochre/60 hover:bg-doom-800/60 transition"
          >
            <span class="text-3xl">🔄</span>
            <div class="text-left">
              <p class="text-parchment font-bold text-lg">Repêcher un éliminé</p>
              <p class="text-dust text-sm">{{ eliminated.length }} éliminé{{ eliminated.length > 1 ? 's' : '' }} disponible{{ eliminated.length > 1 ? 's' : '' }}</p>
            </div>
          </button>
          <button
            @click="source = 'new'"
            class="flex items-center gap-3 p-4 rounded-lg border border-doom-700 hover:border-ochre/60 hover:bg-doom-800/60 transition"
          >
            <span class="text-3xl">✨</span>
            <div class="text-left">
              <p class="text-parchment font-bold text-lg">Nouveau participant</p>
              <p class="text-dust text-sm">Ajouter un album qui n'était pas dans le tournoi</p>
            </div>
          </button>
        </div>

        <!-- Step 3a: Pick from eliminated -->
        <div v-else-if="source === 'eliminated'" class="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
          <button
            v-for="album in eliminated"
            :key="album.id"
            @click="selectedEliminated = album"
            class="flex items-center gap-3 p-2.5 rounded-lg border transition text-left"
            :class="selectedEliminated?.id === album.id
              ? 'border-ochre bg-ochre/10'
              : 'border-doom-700 hover:border-ochre/40 hover:bg-doom-800/60'"
          >
            <img :src="album.cover" class="w-10 h-10 rounded object-cover" />
            <div class="flex-1 min-w-0">
              <p class="text-parchment font-bold truncate">{{ album.name }}</p>
              <p class="text-dust text-sm truncate">{{ album.artist }}</p>
            </div>
            <svg v-if="selectedEliminated?.id === album.id" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-ochre shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>

        <!-- Step 3b: New participant form -->
        <div v-else-if="source === 'new'" class="flex flex-col gap-4">
          <div>
            <label class="block text-sm text-dust mb-1">Artiste</label>
            <input
              v-model="newArtist"
              type="text"
              placeholder="Nom de l'artiste..."
              class="w-full px-3 py-2 bg-doom-950 border border-doom-700 rounded-lg text-parchment placeholder-doom-600 focus:outline-none focus:border-ochre/50 transition"
            />
          </div>
          <div>
            <label class="block text-sm text-dust mb-1">Album</label>
            <input
              v-model="newName"
              type="text"
              placeholder="Nom de l'album..."
              class="w-full px-3 py-2 bg-doom-950 border border-doom-700 rounded-lg text-parchment placeholder-doom-600 focus:outline-none focus:border-ochre/50 transition"
            />
          </div>
          <div>
            <label class="block text-sm text-dust mb-1">Pochette (optionnel)</label>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleFileUpload"
            />
            <div class="flex items-center gap-3">
              <button
                v-if="!newCover"
                @click="triggerUpload"
                class="w-14 h-14 rounded-lg border border-dashed border-doom-600 hover:border-ochre/50 flex items-center justify-center text-doom-600 hover:text-ochre transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
              <div v-else class="relative group">
                <img :src="newCover" class="w-14 h-14 rounded-lg object-cover cursor-pointer" @click="triggerUpload" />
                <button
                  @click="newCover = ''"
                  class="absolute -top-1 -right-1 w-5 h-5 bg-blood rounded-full text-white text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >&times;</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex justify-between mt-6">
          <button
            @click="goBack"
            class="px-4 py-2 text-base text-dust hover:text-parchment border border-doom-700 rounded-lg transition"
          >
            Retour
          </button>
          <button
            v-if="source"
            @click="confirm"
            :disabled="!canConfirm"
            class="px-5 py-2 text-base font-bold rounded-lg transition"
            :class="canConfirm
              ? 'bg-blood hover:bg-red-700 text-white shadow-[0_0_15px_rgba(200,40,40,0.2)]'
              : 'bg-doom-800 text-doom-600 cursor-not-allowed'"
          >
            Appliquer le 49.3
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Album } from '../types'

const TOTAL = 32
const PLACEHOLDER_COVER = '/covers/placeholder.svg'

type Entry = {
  artist: string
  name: string
  cover: string
}

function emptyEntries(): Entry[] {
  return Array.from({ length: TOTAL }, () => ({ artist: '', name: '', cover: '' }))
}

const entries = ref<Entry[]>(emptyEntries())

const filledCount = computed(() =>
  entries.value.filter(e => e.artist.trim() && e.name.trim()).length
)

const isValid = computed(() => filledCount.value === TOTAL)

const emit = defineEmits<{
  confirm: [albums: Album[]]
}>()

function buildAlbums(): Album[] {
  return entries.value.map((e, i) => ({
    id: String(i + 1),
    name: e.name.trim(),
    artist: e.artist.trim(),
    cover: e.cover || PLACEHOLDER_COVER,
  }))
}

function confirm() {
  if (!isValid.value) return
  emit('confirm', buildAlbums())
}

// --- Cover upload ---
const fileInputs = ref<(HTMLInputElement | null)[]>([])

function triggerUpload(index: number) {
  fileInputs.value[index]?.click()
}

function handleFileUpload(index: number, event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  resizeAndStore(file, index)
}

function resizeAndStore(file: File, index: number) {
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
      entries.value[index].cover = canvas.toDataURL('image/jpeg', 0.8)
    }
    img.src = e.target!.result as string
  }
  reader.readAsDataURL(file)
}

function removeCover(index: number) {
  entries.value[index].cover = ''
}

// --- Bulk import ---
const showImport = ref(false)
const importText = ref('')

function parseImport() {
  const lines = importText.value
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0)

  lines.forEach((line, i) => {
    if (i >= TOTAL) return

    let artist = ''
    let name = ''

    if (line.includes('\t')) {
      // Tab-separated: Artist\tAlbum
      const parts = line.split('\t')
      artist = parts[0]?.trim() ?? ''
      name = parts[1]?.trim() ?? ''
    } else if (line.includes(' - ')) {
      // Dash-separated: Artist - Album
      const idx = line.indexOf(' - ')
      artist = line.slice(0, idx).trim()
      name = line.slice(idx + 3).trim()
    } else if (line.includes(';')) {
      // Semicolon-separated: Artist;Album
      const parts = line.split(';')
      artist = parts[0]?.trim() ?? ''
      name = parts[1]?.trim() ?? ''
    } else {
      // Fallback: treat entire line as album name
      name = line
    }

    entries.value[i].artist = artist
    entries.value[i].name = name
  })

  showImport.value = false
  importText.value = ''
}

function clearAll() {
  entries.value = emptyEntries()
}
</script>

<template>
  <div class="w-full max-w-4xl mx-auto">
    <!-- Toolbar -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <button
          @click="showImport = true"
          class="px-4 py-2 text-base bg-doom-800 hover:bg-doom-700 text-parchment border border-doom-600 rounded-lg transition flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Coller une liste
        </button>
        <button
          @click="clearAll"
          class="px-4 py-2 text-base text-dust hover:text-blood border border-doom-700 hover:border-blood/50 rounded-lg transition"
        >
          Tout effacer
        </button>
      </div>
      <span class="text-base text-dust">
        <span :class="isValid ? 'text-ochre font-bold' : ''">{{ filledCount }}</span> / {{ TOTAL }} participants
      </span>
    </div>

    <!-- Participants table -->
    <div class="border border-doom-700 rounded-lg overflow-hidden">
      <!-- Header -->
      <div class="grid grid-cols-[2.5rem_1fr_1fr_3.5rem] gap-2 px-3 py-2 bg-doom-800 text-sm text-dust uppercase tracking-wider border-b border-doom-700">
        <span class="text-center">#</span>
        <span>Artiste</span>
        <span>Album</span>
        <span class="text-center">Cover</span>
      </div>

      <!-- Rows -->
      <div class="max-h-[28rem] overflow-y-auto">
        <div
          v-for="(entry, i) in entries"
          :key="i"
          class="grid grid-cols-[2.5rem_1fr_1fr_3.5rem] gap-2 px-3 py-1.5 items-center border-b border-doom-800/50 hover:bg-doom-900/50 transition-colors"
          :class="{ 'bg-doom-900/30': i % 2 === 0 }"
        >
          <!-- Number -->
          <span class="text-center text-sm text-doom-600 font-mono">{{ i + 1 }}</span>

          <!-- Artist -->
          <input
            v-model="entry.artist"
            type="text"
            placeholder="Artiste..."
            class="w-full px-2 py-1.5 bg-transparent border border-doom-700/50 rounded text-base text-parchment placeholder-doom-600 focus:outline-none focus:border-ochre/50 transition"
          />

          <!-- Album -->
          <input
            v-model="entry.name"
            type="text"
            placeholder="Nom de l'album..."
            class="w-full px-2 py-1.5 bg-transparent border border-doom-700/50 rounded text-base text-parchment placeholder-doom-600 focus:outline-none focus:border-ochre/50 transition"
          />

          <!-- Cover -->
          <div class="flex justify-center">
            <input
              :ref="(el) => { fileInputs[i] = el as HTMLInputElement }"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleFileUpload(i, $event)"
            />
            <button
              v-if="!entry.cover"
              @click="triggerUpload(i)"
              class="w-10 h-10 rounded border border-dashed border-doom-600 hover:border-ochre/50 flex items-center justify-center text-doom-600 hover:text-ochre transition"
              title="Ajouter une pochette"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            <div v-else class="relative group">
              <img
                :src="entry.cover"
                class="w-10 h-10 rounded object-cover cursor-pointer"
                @click="triggerUpload(i)"
                title="Changer la pochette"
              />
              <button
                @click.stop="removeCover(i)"
                class="absolute -top-1 -right-1 w-5 h-5 bg-blood rounded-full text-white text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                title="Supprimer"
              >
                &times;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Start button -->
    <div class="text-center mt-6">
      <button
        @click="confirm"
        :disabled="!isValid"
        class="px-8 py-3 font-bold rounded-lg transition text-xl"
        :class="isValid
          ? 'bg-ochre hover:bg-[#e0b050] text-doom-950 shadow-[0_0_20px_rgba(212,160,64,0.2)]'
          : 'bg-doom-800 text-doom-600 cursor-not-allowed'"
      >
        Démarrer le tournoi
      </button>
    </div>

    <!-- Import modal -->
    <Teleport to="body">
      <div v-if="showImport" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50" @click.self="showImport = false">
        <div class="bg-doom-900 border border-doom-700 rounded-xl p-6 w-full max-w-lg mx-4 shadow-2xl">
          <h3 class="text-xl font-doom text-ochre mb-3">Coller une liste</h3>
          <p class="text-base text-dust mb-4">
            Une ligne par album. Formats accept&eacute;s :<br />
            <code class="text-parchment">Artiste - Nom de l'album</code><br />
            <code class="text-parchment">Artiste&#9;Nom de l'album</code> (tabulation)<br />
            <code class="text-parchment">Artiste;Nom de l'album</code>
          </p>
          <textarea
            v-model="importText"
            rows="12"
            placeholder="Opeth - Ghost Reveries&#10;Gojira - From Mars to Sirius&#10;Meshuggah - Catch Thirtythree&#10;..."
            class="w-full px-3 py-2 bg-doom-950 border border-doom-700 rounded-lg text-base text-parchment placeholder-doom-600 focus:outline-none focus:border-ochre/50 transition font-mono resize-none"
          ></textarea>
          <div class="flex justify-end gap-3 mt-4">
            <button
              @click="showImport = false"
              class="px-4 py-2 text-base text-dust hover:text-parchment border border-doom-700 rounded-lg transition"
            >
              Annuler
            </button>
            <button
              @click="parseImport"
              class="px-4 py-2 text-base bg-ochre hover:bg-[#e0b050] text-doom-950 font-bold rounded-lg transition"
            >
              Importer
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

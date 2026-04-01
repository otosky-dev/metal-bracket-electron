<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Album } from '../types'

const PARTICIPANT_OPTIONS = [16, 32] as const
const PLACEHOLDER_COVER = '/covers/placeholder.svg'

type Entry = {
  artist: string
  name: string
  cover: string
}

const participantCount = ref<number>(32)

function emptyEntries(count: number): Entry[] {
  return Array.from({ length: count }, () => ({ artist: '', name: '', cover: '' }))
}

const entries = ref<Entry[]>(emptyEntries(participantCount.value))

watch(participantCount, (newCount, oldCount) => {
  if (newCount > oldCount) {
    const extra = emptyEntries(newCount - oldCount)
    entries.value = [...entries.value, ...extra]
  } else {
    entries.value = entries.value.slice(0, newCount)
  }
})

const filledCount = computed(() =>
  entries.value.filter(e => e.artist.trim() && e.name.trim()).length
)

const isValid = computed(() => filledCount.value === participantCount.value)

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

// --- Image resize helper (returns a Promise) ---
function resizeFile(file: File): Promise<string> {
  return new Promise((resolve) => {
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
        resolve(canvas.toDataURL('image/jpeg', 0.8))
      }
      img.src = e.target!.result as string
    }
    reader.readAsDataURL(file)
  })
}

// --- Single cover upload ---
const fileInputs = ref<(HTMLInputElement | null)[]>([])

function triggerUpload(index: number) {
  if (!isValid.value) return
  fileInputs.value[index]?.click()
}

async function handleFileUpload(index: number, event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file || !isValid.value) return
  entries.value[index].cover = await resizeFile(file)
}

function removeCover(index: number) {
  entries.value[index].cover = ''
}

// --- Bulk cover upload ---
const bulkFileInput = ref<HTMLInputElement | null>(null)

function triggerBulkUpload() {
  if (!isValid.value) return
  bulkFileInput.value?.click()
}

async function handleBulkUpload(event: Event) {
  const files = (event.target as HTMLInputElement).files
  if (!files || !isValid.value) return

  const sorted = Array.from(files).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }))

  for (let i = 0; i < sorted.length && i < participantCount.value; i++) {
    entries.value[i].cover = await resizeFile(sorted[i])
  }

  // Reset input so re-selecting the same files triggers change
  if (bulkFileInput.value) bulkFileInput.value.value = ''
}

// --- Drag & drop covers ---
const dragSourceIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

function onDragStart(index: number, event: DragEvent) {
  if (!entries.value[index].cover) return
  dragSourceIndex.value = index
  event.dataTransfer!.effectAllowed = 'move'
}

function onDragOver(index: number, event: DragEvent) {
  if (dragSourceIndex.value === null) return
  event.preventDefault()
  event.dataTransfer!.dropEffect = 'move'
  dragOverIndex.value = index
}

function onDragLeave() {
  dragOverIndex.value = null
}

function onDrop(targetIndex: number) {
  const srcIndex = dragSourceIndex.value
  if (srcIndex === null || srcIndex === targetIndex) {
    dragSourceIndex.value = null
    dragOverIndex.value = null
    return
  }

  // Swap covers
  const temp = entries.value[srcIndex].cover
  entries.value[srcIndex].cover = entries.value[targetIndex].cover
  entries.value[targetIndex].cover = temp

  dragSourceIndex.value = null
  dragOverIndex.value = null
}

function onDragEnd() {
  dragSourceIndex.value = null
  dragOverIndex.value = null
}

// --- Bulk text import ---
const showImport = ref(false)
const importText = ref('')

function parseImport() {
  const lines = importText.value
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0)

  lines.forEach((line, i) => {
    if (i >= participantCount.value) return

    let artist = ''
    let name = ''

    if (line.includes('\t')) {
      const parts = line.split('\t')
      artist = parts[0]?.trim() ?? ''
      name = parts[1]?.trim() ?? ''
    } else if (line.includes(' - ')) {
      const idx = line.indexOf(' - ')
      artist = line.slice(0, idx).trim()
      name = line.slice(idx + 3).trim()
    } else if (line.includes(';')) {
      const parts = line.split(';')
      artist = parts[0]?.trim() ?? ''
      name = parts[1]?.trim() ?? ''
    } else {
      name = line
    }

    entries.value[i].artist = artist
    entries.value[i].name = name
  })

  showImport.value = false
  importText.value = ''
}

function clearAll() {
  entries.value = emptyEntries(participantCount.value)
}
</script>

<template>
  <div class="w-full max-w-4xl mx-auto">
    <!-- Toolbar -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <!-- Participant count selector -->
        <div class="flex items-center gap-2">
          <span class="text-base text-dust">Participants :</span>
          <div class="flex rounded-lg border border-doom-700 overflow-hidden">
            <button
              v-for="option in PARTICIPANT_OPTIONS"
              :key="option"
              @click="participantCount = option"
              class="px-3 py-2 text-base font-bold transition"
              :class="participantCount === option
                ? 'bg-ochre text-doom-950'
                : 'bg-doom-800 text-dust hover:bg-doom-700 hover:text-parchment'"
            >
              {{ option }}
            </button>
          </div>
        </div>
        <button
          @click="showImport = true"
          class="px-4 py-2 text-base bg-doom-800 hover:bg-doom-700 text-parchment border border-doom-600 rounded-lg transition flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Coller une liste
        </button>
        <!-- Bulk cover upload -->
        <input
          ref="bulkFileInput"
          type="file"
          accept="image/*"
          multiple
          class="hidden"
          @change="handleBulkUpload"
        />
        <button
          @click="triggerBulkUpload"
          :disabled="!isValid"
          class="px-4 py-2 text-base border rounded-lg transition flex items-center gap-2"
          :class="isValid
            ? 'bg-doom-800 hover:bg-doom-700 text-parchment border-doom-600'
            : 'bg-doom-900 text-doom-600 border-doom-800 cursor-not-allowed'"
          :title="isValid ? 'Importer toutes les pochettes d\'un coup' : 'Remplissez tous les participants d\'abord'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Importer les pochettes
        </button>
        <button
          @click="clearAll"
          class="px-4 py-2 text-base text-dust hover:text-blood border border-doom-700 hover:border-blood/50 rounded-lg transition"
        >
          Tout effacer
        </button>
      </div>
      <span class="text-base text-dust">
        <span :class="isValid ? 'text-ochre font-bold' : ''">{{ filledCount }}</span> / {{ participantCount }} participants
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

          <!-- Cover (drag & drop enabled, blocked until all text filled) -->
          <div
            class="flex justify-center"
            @dragover="isValid ? onDragOver(i, $event) : undefined"
            @dragleave="onDragLeave"
            @drop="isValid ? onDrop(i) : undefined"
            :class="dragOverIndex === i ? 'ring-2 ring-ochre/60 rounded' : ''"
          >
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
              :disabled="!isValid"
              class="w-10 h-10 rounded border border-dashed flex items-center justify-center transition"
              :class="isValid
                ? 'border-doom-600 hover:border-ochre/50 text-doom-600 hover:text-ochre cursor-pointer'
                : 'border-doom-800 text-doom-800 cursor-not-allowed'"
              :title="isValid ? 'Ajouter une pochette' : 'Remplissez tous les participants d\'abord'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            <div
              v-else
              class="relative group"
              draggable="true"
              @dragstart="onDragStart(i, $event)"
              @dragend="onDragEnd"
            >
              <img
                :src="entry.cover"
                class="w-10 h-10 rounded object-cover cursor-grab active:cursor-grabbing"
                :class="dragSourceIndex === i ? 'opacity-40' : ''"
                @click="triggerUpload(i)"
                title="Glisser pour réordonner · Cliquer pour changer"
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

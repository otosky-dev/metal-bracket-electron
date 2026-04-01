<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTournament } from './composables/useTournament'
import type { Album, Match as MatchType } from './types'
import Match from './components/Match.vue'
import Bracket from './components/Bracket.vue'
import AlbumCard from './components/AlbumCard.vue'
import SetupParticipants from './components/SetupParticipants.vue'
import FortyNineThreeModal from './components/FortyNineThreeModal.vue'

const { tournament, started, currentRound, currentMatch, champion, pickWinner, pickWinnerBy493, applyFortyNineThree, forceWinner, start, reset } = useTournament()

const yearInput = ref(2009)

function startTournament(albums: Album[]) {
  start(yearInput.value, albums)
}

const viewingMatch = ref<MatchType | null>(null)

function viewPastMatch(match: MatchType) {
  viewingMatch.value = match
}

function backToCurrentMatch() {
  viewingMatch.value = null
}

const showFortyNineThree = ref(false)

const fortyNineThreeCount = computed(() =>
  tournament.value.rounds.reduce((sum, round) =>
    sum + round.matches.filter(m => m.replacement).length, 0
  )
)

function handleFortyNineThree(slot: 'album1' | 'album2', replacement: Album, fromEliminated: boolean) {
  applyFortyNineThree(slot, replacement, fromEliminated)
  showFortyNineThree.value = false
}

function handleForceWin(winner: Album, fromEliminated: boolean) {
  forceWinner(winner, fromEliminated)
  showFortyNineThree.value = false
}
</script>

<template>
  <div class="min-h-screen text-parchment">
    <!-- Header -->
    <header class="border-b border-doom-700 overflow-hidden">
      <div class="flex items-center justify-center gap-6 max-w-6xl mx-auto">
        <!-- Left illustration -->
        <img
          src="/left-cropped.png"
          alt=""
          class="h-40 w-auto object-contain opacity-80 mix-blend-screen hidden md:block"
        />
        <!-- Logo -->
        <div class="flex flex-col items-center py-4">
          <img
            src="/logo-cropped-clean.png"
            alt="Doomocracy"
            class="h-32 md:h-36 w-auto object-contain mix-blend-screen"
          />
          <span v-if="started" class="text-parchment text-2xl font-doom mt-1">{{ tournament.year }}</span>
        </div>
        <!-- Right illustration -->
        <img
          src="/right-cropped.png"
          alt=""
          class="h-40 w-auto object-contain opacity-80 mix-blend-screen hidden md:block"
        />
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-6 py-8">
      <!-- Setup screen -->
      <div v-if="!started" class="py-8">
        <h2 class="text-4xl font-doom text-parchment mb-6 text-center">Lancer un nouveau tournoi</h2>
        <div class="flex items-center justify-center gap-4 mb-8">
          <label for="year" class="text-dust">Année :</label>
          <input
            id="year"
            v-model.number="yearInput"
            type="number"
            min="2000"
            max="2099"
            class="w-28 px-3 py-2 bg-doom-900 border border-doom-700 rounded-lg text-parchment text-center text-xl font-bold focus:outline-none focus:border-ochre transition"
          />
        </div>
        <SetupParticipants @confirm="startTournament" />
      </div>

      <!-- Champion screen -->
      <div v-else-if="champion">
        <div class="text-center py-12">
          <h2 class="text-5xl font-doom text-ochre mb-6">Champion !</h2>
          <div class="flex justify-center">
            <AlbumCard :album="champion" :highlighted="true" />
          </div>
          <p v-if="fortyNineThreeCount > 0" class="mt-6 text-blood text-lg italic inline-flex items-center justify-center gap-2 w-full">
            <b>{{ fortyNineThreeCount }}</b>
            <img src="/logo_tdd_dark.png" alt="49.3" class="h-5 w-5 object-contain mix-blend-screen" />
            49.3 ont été lâchement appliqués lors de ce tournoi !
          </p>
        </div>

        <!-- Full bracket recap -->
        <div class="mt-8">
          <h2 class="text-4xl font-doom text-ochre mb-6">Tableau</h2>
          <Bracket :tournament="tournament" />
        </div>

        <div class="text-center mt-8 mb-8">
          <button
            @click="reset()"
            class="px-6 py-3 bg-ochre hover:bg-[#e0b050] text-doom-950 font-bold rounded-lg transition shadow-[0_0_20px_rgba(212,160,64,0.2)]"
          >
            Nouveau tournoi
          </button>
        </div>
      </div>

      <!-- Active tournament -->
      <template v-else>
        <!-- Viewing a past match -->
        <div v-if="viewingMatch" class="mb-10">
          <div class="text-center mb-4">
            <span class="text-lg text-dust">Match terminé</span>
          </div>

          <!-- ForceWin: show only the winner -->
          <template v-if="viewingMatch.replacement?.type === 'forceWin'">
            <div class="flex justify-center">
              <div class="flex flex-col items-center gap-3">
                <div class="flex items-center gap-4 px-8 py-5 bg-ochre/10 border border-ochre/30 rounded-xl">
                  <img :src="viewingMatch.winner?.cover" class="w-16 h-16 rounded-lg object-cover" />
                  <div>
                    <p class="text-xl text-ochre font-bold">{{ viewingMatch.winner?.name }}</p>
                    <p class="text-lg text-dust">{{ viewingMatch.winner?.artist }}</p>
                  </div>
                  <img src="/logo_tdd_dark.png" alt="49.3" class="h-6 w-6 object-contain mix-blend-screen" />
                </div>
              </div>
            </div>
            <div class="text-center mt-4 px-4 py-3 bg-blood/10 border border-blood/30 rounded-lg max-w-xl mx-auto">
              <p class="text-blood font-bold inline-flex items-center gap-1.5">
                <img src="/logo_tdd_dark.png" alt="49.3" class="inline h-5 w-5 object-contain mix-blend-screen" /> 49.3 — Victoire forcée
              </p>
              <div v-if="viewingMatch.replacement.evicted" class="flex justify-center items-center gap-4 mt-3">
                <div v-for="(album, i) in viewingMatch.replacement.evicted" :key="i" class="flex items-center gap-2 opacity-60">
                  <img :src="album.cover" class="w-12 h-12 rounded object-cover grayscale" />
                  <div class="text-left">
                    <p class="text-parchment text-sm font-semibold">{{ album.name }}</p>
                    <p class="text-dust text-xs">{{ album.artist }}</p>
                  </div>
                </div>
              </div>
              <p class="text-dust text-sm mt-2 italic">ont été évincés</p>
            </div>
          </template>

          <!-- Normal match or replacement -->
          <template v-else>
            <div class="flex justify-center">
              <Match
                :match="viewingMatch"
                :active="false"
              />
            </div>
            <!-- 49.3 info -->
            <div v-if="viewingMatch.replacement?.type === 'directWin'" class="text-center mt-4 px-4 py-3 bg-blood/10 border border-blood/30 rounded-lg max-w-xl mx-auto">
              <p class="text-blood font-bold inline-flex items-center gap-1.5">
                <img src="/logo_tdd_dark.png" alt="49.3" class="inline h-5 w-5 object-contain mix-blend-screen" /> Victoire par 49.3
              </p>
            </div>
            <!-- 49.3 replacement info -->
            <div v-else-if="viewingMatch.replacement" class="text-center mt-4 px-4 py-3 bg-blood/10 border border-blood/30 rounded-lg max-w-xl mx-auto">
              <p class="text-blood font-bold inline-flex items-center gap-1.5">
                <img src="/logo_tdd_dark.png" alt="49.3" class="inline h-5 w-5 object-contain mix-blend-screen" /> 49.3 appliqué sur ce match
              </p>
              <p class="text-dust text-base mt-1">
                <span class="text-parchment font-semibold">{{ viewingMatch.replacement.replaced.artist }} — {{ viewingMatch.replacement.replaced.name }}</span>
                a été remplacé par
                <span class="text-parchment font-semibold">{{ viewingMatch.replacement.replacement.artist }} — {{ viewingMatch.replacement.replacement.name }}</span>
              </p>
            </div>
          </template>

          <div class="text-center mt-4">
            <button
              @click="backToCurrentMatch()"
              class="px-4 py-2 text-base text-ochre hover:text-[#e0b050] border border-doom-700 hover:border-ochre/50 rounded-lg transition"
            >
              Retour au match en cours
            </button>
          </div>
        </div>

        <!-- Current match -->
        <div v-else-if="currentMatch" class="mb-10">
          <div class="text-center mb-4">
            <span class="text-ochre font-doom text-4xl">
              {{ currentRound?.name }}
            </span>
            <span class="text-doom-600 mx-3">—</span>
            <span class="text-xl text-dust">
              Match {{ tournament.currentMatchIndex + 1 }} / {{ currentRound?.matches.length }}
            </span>
          </div>
          <div class="flex justify-center">
            <Match
              :match="currentMatch"
              :active="true"
              @pick="pickWinner"
              @pick493="pickWinnerBy493"
            />
          </div>
          <!-- 49.3 button -->
          <div class="text-center mt-4">
            <button
              @click="showFortyNineThree = true"
              class="px-5 py-2.5 text-lg text-blood hover:text-red-400 border border-doom-700 hover:border-blood/50 rounded-lg transition inline-flex items-center gap-2 cursor-pointer"
            >
              <img src="/logo_tdd_dark.png" alt="49.3" class="h-6 w-6 object-contain mix-blend-screen" />
              49.3
            </button>
          </div>
          <!-- 49.3 modal -->
          <FortyNineThreeModal
            v-if="showFortyNineThree && currentMatch"
            :match="currentMatch"
            :eliminated="tournament.eliminated"
            @close="showFortyNineThree = false"
            @apply="handleFortyNineThree"
            @force-win="handleForceWin"
          />
        </div>

        <!-- Bracket overview -->
        <div class="mt-8">
          <h2 class="text-4xl font-doom text-ochre mb-6">Tableau</h2>
          <Bracket
            :tournament="tournament"
            :viewing-match-id="viewingMatch?.id"
            :current-match-id="currentMatch?.id"
            @select-match="viewPastMatch"
          />
        </div>

        <!-- Reset button -->
        <div class="text-center mt-8">
          <button
            @click="reset()"
            class="px-4 py-2 text-base text-dust hover:text-blood border border-doom-700 hover:border-blood/50 rounded-lg transition cursor-pointer"
          >
            Recommencer
          </button>
        </div>
      </template>
    </main>
  </div>
</template>

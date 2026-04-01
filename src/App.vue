<script setup lang="ts">
import { ref } from 'vue'
import { useTournament } from './composables/useTournament'
import type { Album, Match as MatchType } from './types'
import Match from './components/Match.vue'
import Bracket from './components/Bracket.vue'
import AlbumCard from './components/AlbumCard.vue'
import SetupParticipants from './components/SetupParticipants.vue'
import FortyNineThreeModal from './components/FortyNineThreeModal.vue'

const { tournament, started, currentRound, currentMatch, champion, pickWinner, applyFortyNineThree, start, reset } = useTournament()

const yearInput = ref(new Date().getFullYear())

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

function handleFortyNineThree(slot: 'album1' | 'album2', replacement: Album, fromEliminated: boolean) {
  applyFortyNineThree(slot, replacement, fromEliminated)
  showFortyNineThree.value = false
}
</script>

<template>
  <div class="min-h-screen text-parchment">
    <!-- Header -->
    <header class="text-center py-8 border-b border-doom-700">
      <h1 class="text-7xl font-doom tracking-wide text-ochre">
        Metal Album of the Year
        <span v-if="started" class="text-parchment">{{ tournament.year }}</span>
      </h1>
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
          <div class="flex justify-center">
            <Match
              :match="viewingMatch"
              :active="false"
            />
          </div>
          <!-- 49.3 replacement info -->
          <div v-if="viewingMatch.replacement" class="text-center mt-4 px-4 py-3 bg-blood/10 border border-blood/30 rounded-lg max-w-xl mx-auto">
            <p class="text-blood font-bold inline-flex items-center gap-1.5">
              <span>⚡</span> 49.3 appliqué sur ce match
            </p>
            <p class="text-dust text-base mt-1">
              <span class="text-parchment font-semibold">{{ viewingMatch.replacement.replaced.artist }} — {{ viewingMatch.replacement.replaced.name }}</span>
              a été remplacé par
              <span class="text-parchment font-semibold">{{ viewingMatch.replacement.replacement.artist }} — {{ viewingMatch.replacement.replacement.name }}</span>
            </p>
          </div>
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
            />
          </div>
          <!-- 49.3 button -->
          <div class="text-center mt-4">
            <button
              @click="showFortyNineThree = true"
              class="px-5 py-2.5 text-lg text-blood hover:text-red-400 border border-doom-700 hover:border-blood/50 rounded-lg transition inline-flex items-center gap-2 cursor-pointer"
            >
              <span class="text-xl">⚡</span>
              49.3 — Remplacer un participant
            </button>
          </div>
          <!-- 49.3 modal -->
          <FortyNineThreeModal
            v-if="showFortyNineThree && currentMatch"
            :match="currentMatch"
            :eliminated="tournament.eliminated"
            @close="showFortyNineThree = false"
            @apply="handleFortyNineThree"
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

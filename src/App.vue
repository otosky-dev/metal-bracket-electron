<script setup lang="ts">
import { ref } from 'vue'
import { useTournament } from './composables/useTournament'
import type { Album, Match as MatchType } from './types'
import Match from './components/Match.vue'
import Bracket from './components/Bracket.vue'
import AlbumCard from './components/AlbumCard.vue'
import SetupParticipants from './components/SetupParticipants.vue'

const { tournament, started, currentRound, currentMatch, champion, pickWinner, start, reset } = useTournament()

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
          <h2 class="text-3xl font-doom text-ochre mb-4">Tableau</h2>
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
            <span class="text-base text-dust">Match terminé</span>
          </div>
          <div class="flex justify-center">
            <Match
              :match="viewingMatch"
              :active="false"
            />
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
            <span class="text-ochre font-doom text-3xl">
              {{ currentRound?.name }}
            </span>
            <span class="text-doom-600 mx-2">—</span>
            <span class="text-lg text-dust">
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
        </div>

        <!-- Bracket overview -->
        <div class="mt-8">
          <h2 class="text-3xl font-doom text-ochre mb-4">Tableau</h2>
          <Bracket
            :tournament="tournament"
            :viewing-match-id="viewingMatch?.id"
            @select-match="viewPastMatch"
          />
        </div>

        <!-- Reset button -->
        <div class="text-center mt-8">
          <button
            @click="reset()"
            class="px-4 py-2 text-base text-dust hover:text-blood border border-doom-700 hover:border-blood/50 rounded-lg transition"
          >
            Recommencer
          </button>
        </div>
      </template>
    </main>
  </div>
</template>

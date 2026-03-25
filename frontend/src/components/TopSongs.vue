<template>
  <div v-for="topSong in topSongs">{{ topSong.name }}</div>
</template>
<script setup lang="ts">
import { getTopSongs } from '@/services/spotify'
import { onMounted, ref } from 'vue'
const topSongs = ref([])
const spotToken = ref('')
const timeRange = ref('medium_term')

onMounted(async () => {
  spotToken.value = localStorage.getItem('spotify_token') || ''
  await getTopSongsByUser()
})

const getTopSongsByUser = async () => {
  topSongs.value = await getTopSongs(spotToken.value, timeRange.value)
}
</script>

<template>
  <div v-for="topSong in topSongs">{{ topSong.name }}</div>
</template>
<script setup lang="ts">
import { getTopSongs } from '@/services/spotify'
import { onMounted, ref } from 'vue'
const topSongs = ref<TopSongs[]>([])
const spotToken = ref('')
const timeRange = ref('medium_term')
interface TopSongs {
  name: string
}
onMounted(async () => {
  spotToken.value = localStorage.getItem('spotify_token') || ''
  await getTopSongsByUser()
})

const getTopSongsByUser = async () => {
  topSongs.value = await getTopSongs(spotToken.value, timeRange.value)
}
</script>

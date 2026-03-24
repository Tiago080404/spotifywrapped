<template>
  <div v-for="artist in favArtists">
    {{ artist.name }} <img :src="artist.images[0]?.url" alt="" />
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
const spotToken = ref('')
const favArtists = ref([])
onMounted(async () => {
  spotToken.value = localStorage.getItem('spotify_token') || ''
  await getUsersTopArtists()
})

const getUsersTopArtists = async () => {
  const response = await fetch('https://api.spotify.com/v1/me/top/artists', {
    method: 'GET',
    headers: { Authorization: `Bearer ${spotToken.value}` },
  })
  const data = await response.json()
  console.log(data)
  favArtists.value = data.items
}
</script>

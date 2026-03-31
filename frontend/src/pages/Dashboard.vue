<template></template>
<script setup lang="ts">
import { getTopGenres } from '@/services/spotify'
import { onMounted, ref } from 'vue'
const topGenres = ref([])
const spotToken = ref('')

const time = ref('medium_term')
onMounted(async () => {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')

  if (code) {
    const res = await fetch(`http://127.0.0.1:3000/exchange?code=${code}`)
    const data = await res.json()
    localStorage.setItem('spotify_token', data.access_token)
    localStorage.setItem('spotify_refresh_token', data.refresh_token)
    localStorage.setItem('user_id', data.user_id)
    spotToken.value = localStorage.getItem('spotify_token') || ''
    window.history.replaceState({}, '', '/dashboard')
  }

  await getUsersTopGenres()

  //loading.value = false
})
const getUsersTopGenres = async () => {
  await getTopGenres(spotToken.value, time.value)
}
</script>

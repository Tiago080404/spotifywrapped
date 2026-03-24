<template>
  <div style="display: flex; justify-content: center;">

    <TopArtists></TopArtists>
  </div>
</template>
<script setup lang="ts">
import TopArtists from '@/components/TopArtists.vue'
import { onMounted } from 'vue'

onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  const token = params.get('access_token')

  if (token) {
    localStorage.setItem('spotify_token', token)
    //router.push('/dashboard')
  }
})
</script>
<style>

</style>
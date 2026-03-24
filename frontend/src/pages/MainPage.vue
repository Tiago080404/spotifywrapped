<template>
  <TopSongs></TopSongs>
</template>
<script setup lang="ts">
import TopSongs from '@/components/TopSongs.vue'
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

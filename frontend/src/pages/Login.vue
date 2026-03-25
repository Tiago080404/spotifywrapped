<template>
  <div><button @click="login">Login mit Spotify</button></div>
</template>

<script setup lang="ts">
async function login() {
  const res = await fetch('http://127.0.0.1:3000/login')
  const data = await res.json()
  window.location.href = data.url
}
</script>

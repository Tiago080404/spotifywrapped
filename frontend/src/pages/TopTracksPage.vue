<template>
  <div class="grid-container">
    <div class="div1">
      <NavBar />
    </div>
    <div class="div2">
      <TopTracks />
    </div>
  </div>
</template>

<script setup lang="ts">
import NavBar from '@/components/NavBar.vue'
import TopTracks from '@/components/TopTracks.vue'
</script>

<style scoped>
.grid-container {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  min-height: 100vh;
  column-gap: 20px;
  align-items: stretch;
}

.div1 {
  padding: 16px 10px 16px 16px;
}

.div2 {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 24px 24px 24px 12px;
}

@media (max-width: 900px) {
  .grid-container {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    row-gap: 12px;
  }

  .div1 {
    padding: 12px;
  }

  .div2 {
    padding: 8px 12px 20px;
  }
}
</style>

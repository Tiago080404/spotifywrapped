<template>
  <WrappedStory @close="goBack" />
</template>

<script setup lang="ts">
import WrappedStory from '@/components/WrappedStory.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

function goBack() {
  router.push('/dashboard')
}
</script>

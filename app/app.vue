<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useColorMode } from '#imports'

const colorMode = useColorMode()

onMounted(() => {
  if (colorMode.preference === 'system') {
    colorMode.preference = 'light'
  }
})
</script>

<template>
  <svg
    v-bind="$attrs"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <path d="M9 13h1a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9v-4z"/>
    <path d="M13 13h2"/>
    <path d="M13 17h2"/>
    <path d="M13 15h1"/>
  </svg>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })
withDefaults(defineProps<{ size?: number | string }>(), { size: 20 })
</script>

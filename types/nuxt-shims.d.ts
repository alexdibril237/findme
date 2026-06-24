import type { Translator } from 'vue-i18n'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $t: Translator['t']
  }
}

declare global {
  function definePageMeta(meta: Record<string, unknown>): void

  function useSeoMeta(meta: Record<string, unknown>): void

  function useRuntimeConfig(): import('nuxt/schema').RuntimeConfig
}

declare global {
  function defineNuxtConfig(config: any): any
}

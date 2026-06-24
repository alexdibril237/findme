import type { Translator } from 'vue-i18n'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $t: Translator['t']
  }
}

// ── Nuxt auto-imports ────────────────────────────────────────────────────────
declare global {
  const definePageMeta: typeof import('nuxt/app')['definePageMeta']
  const useSeoMeta: typeof import('nuxt/app')['useSeoMeta']
  const useRuntimeConfig: typeof import('nuxt/app')['useRuntimeConfig']
  const useRoute: typeof import('nuxt/app')['useRoute']
  const useRouter: typeof import('nuxt/app')['useRouter']
  const navigateTo: typeof import('nuxt/app')['navigateTo']
  const clearError: typeof import('nuxt/app')['clearError']
  const defineNuxtRouteMiddleware: typeof import('nuxt/app')['defineNuxtRouteMiddleware']
  const defineNuxtConfig: (config: any) => any
}

// ── Vue auto-imports ─────────────────────────────────────────────────────────
declare global {
  const ref: typeof import('vue')['ref']
  const computed: typeof import('vue')['computed']
  const reactive: typeof import('vue')['reactive']
  const readonly: typeof import('vue')['readonly']
  const onMounted: typeof import('vue')['onMounted']
  const onUnmounted: typeof import('vue')['onUnmounted']
  const onBeforeMount: typeof import('vue')['onBeforeMount']
  const watch: typeof import('vue')['watch']
  const watchEffect: typeof import('vue')['watchEffect']
  const nextTick: typeof import('vue')['nextTick']
  const toRef: typeof import('vue')['toRef']
  const toRefs: typeof import('vue')['toRefs']
}

// ── Nitro / H3 server auto-imports ───────────────────────────────────────────
declare global {
  const defineEventHandler: typeof import('h3')['defineEventHandler']
  const readBody: typeof import('h3')['readBody']
  const getRouterParam: typeof import('h3')['getRouterParam']
  const getHeader: typeof import('h3')['getHeader']
  const createError: typeof import('h3')['createError']
  const setResponseStatus: typeof import('h3')['setResponseStatus']
  function useStorage(base?: string): {
    getItem<T = any>(key: string): Promise<T | null>
    setItem(key: string, value: any, opts?: any): Promise<void>
    removeItem(key: string): Promise<void>
    hasItem(key: string): Promise<boolean>
  }
}

// ── CSS module declarations ───────────────────────────────────────────────────
declare module '*.css' {
  const styles: Record<string, string>
  export default styles
}

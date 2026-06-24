import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import { useAuthStore } from '../stores/auth'

export default defineNuxtRouteMiddleware(() => {
  if (!process.client) return

  const authStore = useAuthStore()
  authStore.restoreSession()

  if (authStore.isAuthenticated) {
    return navigateTo('/dashboard')
  }
})

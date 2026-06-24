import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import { useAuthStore } from '../stores/auth'

export default defineNuxtRouteMiddleware((to) => {
  if (!process.client) return   // localStorage uniquement côté client

  const authStore = useAuthStore()
  authStore.restoreSession()

  if (!authStore.isAuthenticated) {
    return navigateTo('/auth/login')
  }

  if (to.path.startsWith('/admin') && !authStore.isAdmin) {
    return navigateTo('/dashboard')
  }
})

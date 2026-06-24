import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useToast } from '../composables/useToast'
import { navigateTo, useRuntimeConfig, useNuxtApp } from '#imports'

// Traducteur lazy — appelé dans chaque action, jamais au niveau setup
const tr = (key: string): string => {
  try {
    return (useNuxtApp().$i18n as any).t(key)
  } catch {
    return key
  }
}

// ── Registre local d'utilisateurs ────────────────────────────────────────────
// Stocké dans localStorage pour que login retourne le vrai nom de l'utilisateur
const LOCAL_USERS_KEY = 'findme_local_users'
const OTP_PREFIX = 'findme_otp_'

const getLocalUsers = (): any[] => {
  if (!process.client) return []
  try { return JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]') }
  catch { return [] }
}

const pwKey = (email: string, password: string) => btoa(`${email}::${password}`)

const findLocalUser = (email: string, password: string) => {
  return getLocalUsers().find((u: any) => u.email === email && u.passwordKey === pwKey(email, password)) || null
}

const saveLocalUser = (id: string, name: string, email: string, password: string) => {
  if (!process.client) return
  const users = getLocalUsers()
  const existing = users.findIndex((u: any) => u.email === email)
  const entry = { id, name, email, passwordKey: pwKey(email, password), role: 'user', createdAt: new Date().toISOString() }
  if (existing !== -1) { users[existing] = entry } else { users.push(entry) }
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users))
}

const updateLocalPassword = (email: string, newPassword: string) => {
  if (!process.client) return
  const users = getLocalUsers()
  const idx = users.findIndex((u: any) => u.email === email)
  if (idx !== -1) {
    users[idx].passwordKey = pwKey(email, newPassword)
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users))
  }
}

// ── Stockage OTP côté client (localStorage) ────────────────────────────────
// Pas besoin de serveur — le code est généré et vérifié localement
const storeOtp = (email: string, otp: string) => {
  if (!process.client) return
  const expiry = Date.now() + 15 * 60 * 1000 // 15 min
  localStorage.setItem(`${OTP_PREFIX}${email}`, JSON.stringify({ otp, expiry }))
}

const verifyOtp = (email: string, code: string): boolean => {
  if (!process.client) return false
  try {
    const raw = localStorage.getItem(`${OTP_PREFIX}${email}`)
    if (!raw) return false
    const { otp, expiry } = JSON.parse(raw)
    if (Date.now() > expiry) { localStorage.removeItem(`${OTP_PREFIX}${email}`); return false }
    return otp === code.trim()
  } catch { return false }
}

const clearOtp = (email: string) => {
  if (process.client) localStorage.removeItem(`${OTP_PREFIX}${email}`)
}

// ─────────────────────────────────────────────────────────────────────────────

export const useAuthStore = defineStore('auth', () => {
  const { showToast } = useToast()
  const config = useRuntimeConfig()
  const api = config.public.apiBase

  const currentUser = ref<any>(null)
  const token = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!(token.value && currentUser.value))
  const isAdmin = computed(() => currentUser.value?.role === 'admin')
  const firstName = computed(() => (currentUser.value?.name || '').split(' ')[0])
  const userInitials = computed(() => {
    const name = currentUser.value?.name || ''
    return name.split(' ').map((n: string) => n[0] || '').join('').substring(0, 2).toUpperCase()
  })

  const authHeaders = computed(() => ({
    Authorization: token.value ? `Bearer ${token.value}` : '',
  }))

  const restoreSession = () => {
    if (!process.client) return
    try {
      const t = localStorage.getItem('findme_token')
      const u = localStorage.getItem('findme_user')
      if (t && u) { token.value = t; currentUser.value = JSON.parse(u) }
    } catch { currentUser.value = null; token.value = null }
  }

  const resolveRole = (user: any, email: string) => {
    if (user.role && user.role !== 'user') return user
    const adminEmails = ['admin@findme.app', 'admin@geolink.africa']
    if (adminEmails.includes(email.toLowerCase()) || email.toLowerCase().startsWith('admin')) {
      return { ...user, role: 'admin' }
    }
    return user
  }

  // POST /auth/login — vérifie le registre local d'abord, puis l'API mock
  const login = async (email: string, password: string): Promise<boolean> => {
    loading.value = true
    error.value = null
    try {
      // 1. Vérifier le registre local (utilisateurs inscrits dans l'app)
      const localUser = findLocalUser(email, password)
      if (localUser) {
        const user = resolveRole({ ...localUser }, email)
        token.value = `local_${Date.now()}`
        currentUser.value = user
        if (process.client) {
          localStorage.setItem('findme_token', token.value)
          localStorage.setItem('findme_user', JSON.stringify(user))
        }
        showToast(`${tr('auth.login.success')}, ${firstName.value} !`, 'success')
        return true
      }

      // 2. Fallback vers l'API mock (pour les tests sans inscription préalable)
      const res = await $fetch<any>(`${api}/auth/login`, {
        method: 'POST',
        body: { email, password },
      })
      const { user: rawUser, token: tok } = res.data
      const user = resolveRole({ ...rawUser, email }, email)
      token.value = tok
      currentUser.value = user
      if (process.client) {
        localStorage.setItem('findme_token', tok)
        localStorage.setItem('findme_user', JSON.stringify(user))
      }
      showToast(`${tr('auth.login.success')}, ${firstName.value} !`, 'success')
      return true
    } catch {
      error.value = 'INVALID_CREDENTIALS'
      showToast(tr('errors.invalid_credentials'), 'error')
      return false
    } finally {
      loading.value = false
    }
  }

  // POST /auth/signup — appelle l'API mock + sauvegarde les vrais identifiants localement
  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    loading.value = true
    error.value = null
    try {
      // Vérifier si l'email existe déjà dans le registre local
      if (getLocalUsers().find((u: any) => u.email === email)) {
        showToast(tr('errors.email_taken'), 'error')
        error.value = 'EMAIL_ALREADY_EXISTS'
        return false
      }

      const res = await $fetch<any>(`${api}/auth/signup`, {
        method: 'POST',
        body: { name, email, password },
      })
      const { user: rawUser, token: tok } = res.data
      const user = resolveRole({ ...rawUser, name, email }, email)
      token.value = tok
      currentUser.value = user

      // Sauvegarder dans le registre local avec le vrai nom + mot de passe
      saveLocalUser(user.id, name, email, password)

      if (process.client) {
        localStorage.setItem('findme_token', tok)
        localStorage.setItem('findme_user', JSON.stringify(user))
        sessionStorage.setItem('findme_new_user', '1')
      }
      showToast(`${tr('auth.signup.success')}, ${firstName.value} !`, 'success')
      return true
    } catch (err: any) {
      const code = err?.data?.error?.code || ''
      error.value = code
      if (code === 'EMAIL_ALREADY_EXISTS') {
        showToast(tr('errors.email_taken'), 'error')
      } else {
        showToast(tr('errors.server'), 'error')
      }
      return false
    } finally {
      loading.value = false
    }
  }

  // Mot de passe oublié — génère un OTP côté client et le stocke dans localStorage
  // L'OTP est affiché à l'écran (mode démo). Pour envoyer par email en production,
  // configurer RESEND_API_KEY dans .env et activer les routes serveur.
  const forgotPassword = async (email: string): Promise<{ ok: boolean; devOtp?: string }> => {
    loading.value = true
    error.value = null
    try {
      const otp = Math.floor(100000 + Math.random() * 900000).toString()
      storeOtp(email, otp)

      // Tenter d'appeler l'API pour envoyer un email (si le serveur est configuré)
      try {
        const res = await $fetch<any>(`${api}/auth/forgot-password`, {
          method: 'POST',
          body: { email, otp },
        })
        // Si l'API renvoie un devOtp, l'afficher ; sinon l'email a été envoyé
        return { ok: true, devOtp: res.devOtp || undefined }
      } catch {
        // L'API mock ne supporte pas l'envoi d'email → afficher l'OTP à l'écran
        return { ok: true, devOtp: otp }
      }
    } finally {
      loading.value = false
    }
  }

  // Vérifier l'OTP + changer le mot de passe (100% localStorage, aucun serveur)
  const resetPassword = async (email: string, otp: string, newPassword: string): Promise<boolean> => {
    loading.value = true
    error.value = null
    try {
      if (!verifyOtp(email, otp)) {
        showToast(tr('errors.otp_invalid'), 'error')
        return false
      }
      clearOtp(email)
      updateLocalPassword(email, newPassword)
      showToast(tr('auth.reset.success'), 'success')
      return true
    } finally {
      loading.value = false
    }
  }

  // POST /auth/logout
  const logout = async () => {
    try {
      if (token.value) {
        await $fetch(`${api}/auth/logout`, {
          method: 'POST',
          headers: authHeaders.value,
        })
      }
    } catch { /* ignore */ } finally {
      currentUser.value = null
      token.value = null
      if (process.client) {
        localStorage.removeItem('findme_token')
        localStorage.removeItem('findme_user')
        sessionStorage.removeItem('findme_new_user')
      }
      return navigateTo('/')
    }
  }

  return {
    currentUser, token, loading, error,
    isAuthenticated, isAdmin, firstName, userInitials, authHeaders,
    login, signup, forgotPassword, resetPassword, logout, restoreSession,
  }
})

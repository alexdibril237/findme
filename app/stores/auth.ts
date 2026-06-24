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
const RESET_PREFIX = 'findme_reset_'

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

// ── Stockage token de réinitialisation (localStorage, 1h TTL) ─────────────
const storeResetToken = (email: string, token: string) => {
  if (!process.client) return
  const expiry = Date.now() + 60 * 60 * 1000 // 1h
  localStorage.setItem(`${RESET_PREFIX}${token}`, JSON.stringify({ email, expiry }))
}

const verifyResetToken = (token: string): string | null => {
  if (!process.client) return null
  try {
    const raw = localStorage.getItem(`${RESET_PREFIX}${token}`)
    if (!raw) return null
    const { email, expiry } = JSON.parse(raw)
    if (Date.now() > expiry) { localStorage.removeItem(`${RESET_PREFIX}${token}`); return null }
    return email
  } catch { return null }
}

const clearResetToken = (token: string) => {
  if (process.client) localStorage.removeItem(`${RESET_PREFIX}${token}`)
}

// ── Compte administrateur pré-configuré ───────────────────────────────────────
const ADMIN_EMAILS = ['adminfindme@gmail.com']

const isAdminEmail = (email: string) =>
  ADMIN_EMAILS.includes(email.toLowerCase()) || email.toLowerCase().startsWith('admin')

const seedAdminAccount = () => {
  if (!process.client) return
  const users = getLocalUsers()
  const adminEmail = 'adminfindme@gmail.com'
  if (!users.find((u: any) => u.email === adminEmail)) {
    users.push({
      id: 'admin-001',
      name: 'Administrateur findMe',
      email: adminEmail,
      passwordKey: pwKey(adminEmail, 'Admin2026!'),
      role: 'admin',
      createdAt: new Date().toISOString(),
    })
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users))
  }
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
    seedAdminAccount()
    try {
      const t = localStorage.getItem('findme_token')
      const u = localStorage.getItem('findme_user')
      if (t && u) { token.value = t; currentUser.value = JSON.parse(u) }
    } catch { currentUser.value = null; token.value = null }
  }

  const resolveRole = (user: any, email: string) => {
    if (user.role && user.role !== 'user') return user
    if (ADMIN_EMAILS.includes(email.toLowerCase())) {
      return { ...user, role: 'admin' }
    }
    return user
  }

  // POST /auth/login — registre local strict, API mock réservée aux comptes admin
  const login = async (email: string, password: string): Promise<boolean> => {
    loading.value = true
    error.value = null
    try {
      // 1. Bon email + bon mot de passe dans le registre local → connexion
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

      // 2. Email trouvé localement mais mauvais mot de passe → bloquer
      const emailRegistered = getLocalUsers().some((u: any) => u.email === email)
      if (emailRegistered) {
        error.value = 'INVALID_CREDENTIALS'
        showToast(tr('errors.invalid_credentials'), 'error')
        return false
      }

      // 3. Email non enregistré et non-admin → bloquer (ne pas laisser le mock accepter)
      if (!isAdminEmail(email)) {
        error.value = 'INVALID_CREDENTIALS'
        showToast(tr('errors.invalid_credentials'), 'error')
        return false
      }

      // 4. Email admin uniquement → fallback API mock (mode démo)
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

  // Mot de passe oublié — génère un token sécurisé stocké dans localStorage
  // En production, ce token serait envoyé par email via Resend.
  // En mode démo, le lien est affiché à l'écran.
  const forgotPassword = async (email: string): Promise<{ ok: boolean; devToken?: string }> => {
    loading.value = true
    error.value = null
    try {
      const token = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36)
      storeResetToken(email, token)

      // Tenter d'appeler l'API (si Resend est configuré, l'email est envoyé)
      try {
        await $fetch<any>(`${api}/auth/forgot-password`, {
          method: 'POST',
          body: { email },
        })
        return { ok: true } // email envoyé par le service réel
      } catch {
        // Mode démo : renvoyer le token pour afficher le lien à l'écran
        return { ok: true, devToken: token }
      }
    } finally {
      loading.value = false
    }
  }

  // Valider le token de réinitialisation + changer le mot de passe
  const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
    loading.value = true
    error.value = null
    try {
      const email = verifyResetToken(token)
      if (!email) {
        showToast(tr('errors.token_expired'), 'error')
        return false
      }
      clearResetToken(token)
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

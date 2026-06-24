<template>
  <div class="auth-page">
    <!-- Panel branding gauche -->
    <div class="auth-brand">
      <div class="auth-brand-inner">
        <NuxtLink to="/" class="logo" aria-label="findMe">
          <div class="logo-icon">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="7.5" r="2.8" fill="white"/>
              <path d="M9 1.5C5.96 1.5 3.5 3.96 3.5 7c0 4.1 5.5 9.5 5.5 9.5S14.5 11.1 14.5 7c0-3.04-2.46-5.5-5.5-5.5z"
                stroke="white" stroke-width="1.4" fill="none"/>
            </svg>
          </div>
          <span class="logo-text">find<span>Me</span></span>
        </NuxtLink>

        <div class="brand-hero">
          <h1>{{ $t('auth.login.title') }}</h1>
          <p>{{ $t('auth.login.subtitle') }}</p>
        </div>

        <ul class="brand-features">
          <li v-for="f in features" :key="f">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1AC47D" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            {{ f }}
          </li>
        </ul>

        <div class="brand-stats">
          <div class="brand-stat">
            <span class="stat-n">25 000+</span>
            <span class="stat-l">Utilisateurs</span>
          </div>
          <div class="brand-stat">
            <span class="stat-n">70 000+</span>
            <span class="stat-l">Adresses créées</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Panel formulaire droite -->
    <div class="auth-form-panel">
      <div class="auth-form-inner">
        <div class="form-header">
          <h2>{{ $t('auth.login.title') }}</h2>
          <p>{{ $t('auth.login.subtitle') }}</p>
        </div>

        <form @submit.prevent="handleLogin" novalidate aria-label="Formulaire de connexion">
          <!-- Email -->
          <div class="form-group">
            <label for="email" class="form-label">
              {{ $t('auth.login.email') }} <span class="required" aria-hidden="true">*</span>
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              class="form-input"
              :class="{ error: errors.email }"
              :placeholder="'ex: jean@example.cm'"
              autocomplete="email"
              required
              @blur="validateEmail"
              aria-describedby="email-error"
            />
            <p v-if="errors.email" id="email-error" class="form-error" role="alert">
              {{ errors.email }}
            </p>
          </div>

          <!-- Mot de passe -->
          <div class="form-group">
            <div class="label-row">
              <label for="password" class="form-label">
                {{ $t('auth.login.password') }} <span class="required" aria-hidden="true">*</span>
              </label>
              <NuxtLink to="/auth/forgot-password" class="forgot-link">
                {{ $t('auth.login.forgot') }}
              </NuxtLink>
            </div>
            <div class="input-password">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                :class="{ error: errors.password }"
                autocomplete="current-password"
                required
                @blur="validatePassword"
                aria-describedby="password-error"
              />
              <button
                type="button"
                class="password-toggle"
                @click="showPassword = !showPassword"
                :aria-label="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
              >
                <svg v-if="showPassword" width="16" height="16" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
                <svg v-else width="16" height="16" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </div>
            <p v-if="errors.password" id="password-error" class="form-error" role="alert">
              {{ errors.password }}
            </p>
          </div>

          <!-- Bouton soumettre -->
          <button
            type="submit"
            class="btn btn-primary btn-full"
            :disabled="authStore.loading"
            aria-label="Se connecter"
          >
            <svg v-if="authStore.loading" class="animate-spin" width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            {{ authStore.loading ? $t('common.loading') : $t('auth.login.submit') }}
          </button>
        </form>

        <p class="auth-switch">
          {{ $t('auth.login.no_account') }}
          <NuxtLink to="/auth/signup">{{ $t('auth.login.signup_link') }}</NuxtLink>
        </p>
      </div>
    </div>

    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSeoMeta, navigateTo } from '#imports'
import { useAuthStore } from '../../stores/auth'
import Toast from '../../components/ui/Toast.vue'

definePageMeta({ layout: false, middleware: 'guest' })

const { t } = useI18n()
const authStore = useAuthStore()

useSeoMeta({
  title: 'Connexion — findMe',
  description: 'Connectez-vous à votre espace findMe.',
})

const form = reactive({ email: '', password: '' })
const errors = reactive({ email: '', password: '' })
const showPassword = ref(false)

const features = [
  'Adresse numérique officielle',
  'Partageable par lien ou QR code',
  'Certificat PDF téléchargeable',
  'Vérifiable par tous les services',
]

const validateEmail = () => {
  if (!form.email) {
    errors.email = t('validation.required')
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = t('validation.email_invalid')
  } else {
    errors.email = ''
  }
}

const validatePassword = () => {
  if (!form.password) {
    errors.password = t('validation.required')
  } else {
    errors.password = ''
  }
}

const handleLogin = async () => {
  validateEmail()
  validatePassword()
  if (errors.email || errors.password) return

  const ok = await authStore.login(form.email, form.password)
  if (ok) {
    await navigateTo(authStore.isAdmin ? '/admin' : '/dashboard')
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh; display: flex;
  background: var(--color-bg);
}

/* ── PANEL GAUCHE ── */
.auth-brand {
  width: 42%; background: var(--color-night);
  display: flex; align-items: center; justify-content: center;
  padding: 48px;
  position: relative; overflow: hidden;
}
.auth-brand::before {
  content: '';
  position: absolute; inset: 0;
  background-image: linear-gradient(rgba(24,95,165,0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(24,95,165,0.07) 1px, transparent 1px);
  background-size: 40px 40px;
}
.auth-brand-inner { max-width: 380px; position: relative; z-index: 2; }

.logo { display: flex; align-items: center; gap: 10px; text-decoration: none; margin-bottom: 48px; }
.logo-icon {
  width: 38px; height: 38px; border-radius: 10px;
  background: var(--color-primary);
  display: flex; align-items: center; justify-content: center;
}
.logo-text { font-family: var(--font-display); font-weight: 800; font-size: 22px; color: white; }
.logo-text span { color: #5DCAA5; }

.brand-hero h1 { font-size: 38px; color: white; margin-bottom: 14px; letter-spacing: -1.5px; }
.brand-hero p { color: rgba(230,241,251,0.55); font-size: 16px; line-height: 1.65; margin-bottom: 40px; }

.brand-features { list-style: none; display: flex; flex-direction: column; gap: 12px; margin-bottom: 40px; }
.brand-features li {
  display: flex; align-items: center; gap: 10px;
  color: rgba(230,241,251,0.75); font-size: 14px;
}

.brand-stats { display: flex; gap: 32px; }
.brand-stat { display: flex; flex-direction: column; gap: 4px; }
.stat-n { font-family: var(--font-display); font-size: 26px; font-weight: 800; color: white; }
.stat-l { font-size: 12px; color: rgba(230,241,251,0.4); }

/* ── PANEL DROITE ── */
.auth-form-panel {
  flex: 1; display: flex; align-items: center; justify-content: center;
  padding: 48px 32px;
}
.auth-form-inner { width: 100%; max-width: 420px; }
.form-header { margin-bottom: 36px; }
.form-header h2 { font-size: 28px; margin-bottom: 8px; }
.form-header p { color: var(--color-text-secondary); font-size: 15px; }

.label-row { display: flex; justify-content: space-between; align-items: baseline; }
.forgot-link { font-size: 13px; color: var(--color-primary); text-decoration: none; }
.forgot-link:hover { text-decoration: underline; }

.input-password { position: relative; }
.input-password .form-input { padding-right: 44px; }
.password-toggle {
  position: absolute; right: 12px; top: 50%;
  transform: translateY(-50%);
  background: none; border: none; cursor: pointer;
  color: var(--color-text-tertiary); padding: 4px;
  transition: color var(--transition-fast);
}
.password-toggle:hover { color: var(--color-primary); }

.auth-switch {
  text-align: center; margin-top: 24px;
  color: var(--color-text-secondary); font-size: 14px;
}
.auth-switch a { color: var(--color-primary); text-decoration: none; font-weight: 600; }
.auth-switch a:hover { text-decoration: underline; }
.required { color: var(--color-error); }

@media (max-width: 768px) {
  .auth-page { flex-direction: column; }
  .auth-brand { width: 100%; padding: 32px 24px; min-height: auto; }
  .brand-features, .brand-stats { display: none; }
  .auth-form-panel { padding: 32px 24px; }
}
</style>

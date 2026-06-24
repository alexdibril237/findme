<template>
  <div class="auth-page">
    <div class="auth-brand">
      <div class="auth-brand-inner">
        <NuxtLink to="/" class="logo">
          <div class="logo-icon">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="7.5" r="2.8" fill="white"/>
              <path d="M9 1.5C5.96 1.5 3.5 3.96 3.5 7c0 4.1 5.5 9.5 5.5 9.5S14.5 11.1 14.5 7c0-3.04-2.46-5.5-5.5-5.5z" stroke="white" stroke-width="1.4" fill="none"/>
            </svg>
          </div>
          <span class="logo-text">find<span>Me</span></span>
        </NuxtLink>
        <div class="brand-hero">
          <h1>{{ $t('auth.forgot.title') }}</h1>
          <p>{{ $t('auth.forgot.subtitle') }}</p>
        </div>
      </div>
    </div>

    <div class="auth-form-panel">
      <div class="auth-form-inner">

        <!-- Étape 1 : saisir l'email -->
        <template v-if="step === 'email'">
          <div class="form-header">
            <h2>{{ $t('auth.forgot.title') }}</h2>
            <p>{{ $t('auth.forgot.subtitle') }}</p>
          </div>

          <form @submit.prevent="handleSendLink" novalidate>
            <div class="form-group">
              <label for="email" class="form-label">{{ $t('auth.forgot.email') }} <span class="required">*</span></label>
              <input id="email" v-model="email" type="email" class="form-input" :class="{ error: emailError }"
                autocomplete="email" required @blur="validateEmail" aria-describedby="email-err"/>
              <p v-if="emailError" id="email-err" class="form-error" role="alert">{{ emailError }}</p>
            </div>

            <button type="submit" class="btn btn-primary btn-full" :disabled="authStore.loading">
              <svg v-if="authStore.loading" class="animate-spin" width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              {{ authStore.loading ? $t('common.loading') : $t('auth.forgot.submit') }}
            </button>
          </form>

          <p class="auth-switch">
            <NuxtLink to="/auth/login">← {{ $t('auth.forgot.back') }}</NuxtLink>
          </p>
        </template>

        <!-- Étape 2 : lien envoyé -->
        <template v-else-if="step === 'sent'">
          <div class="sent-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="m2 7 8.586 5.414a2 2 0 0 0 2.828 0L22 7"/>
            </svg>
          </div>
          <div class="form-header">
            <h2>{{ $t('auth.forgot.success') }}</h2>
            <p class="sent-to">{{ $t('auth.forgot.link_sent') }} <strong>{{ email }}</strong></p>
          </div>

          <!-- Badge démo : lien cliquable affiché à l'écran -->
          <div v-if="devLink" class="dev-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>{{ $t('auth.forgot.dev_link') }}</span>
            <NuxtLink :to="devLink" class="dev-link">{{ $t('auth.reset.title') }} →</NuxtLink>
          </div>

          <p class="auth-switch">
            <button type="button" class="link-btn" @click="step = 'email'">
              ← {{ $t('auth.forgot.back') }}
            </button>
          </p>
        </template>

      </div>
    </div>
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSeoMeta } from '#imports'
import { useAuthStore } from '../../stores/auth'
import Toast from '../../components/ui/Toast.vue'

definePageMeta({ layout: false })

const { t } = useI18n()
const authStore = useAuthStore()

useSeoMeta({ title: 'Mot de passe oublié — findMe' })

const step = ref<'email' | 'sent'>('email')
const email = ref('')
const emailError = ref('')
const devLink = ref('')

const validateEmail = () => {
  if (!email.value) emailError.value = t('validation.required')
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) emailError.value = t('validation.email_invalid')
  else emailError.value = ''
}

const handleSendLink = async () => {
  validateEmail()
  if (emailError.value) return
  const result = await authStore.forgotPassword(email.value)
  if (result.ok) {
    if (result.devToken) {
      devLink.value = `/auth/reset-password?token=${result.devToken}`
    }
    step.value = 'sent'
  }
}
</script>

<style scoped>
.auth-page { min-height: 100vh; display: flex; background: var(--color-bg); }
.auth-brand { width: 42%; background: var(--color-night); display: flex; align-items: center; justify-content: center; padding: 48px; position: relative; overflow: hidden; }
.auth-brand::before { content: ''; position: absolute; inset: 0; background-image: linear-gradient(rgba(24,95,165,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(24,95,165,0.07) 1px, transparent 1px); background-size: 40px 40px; }
.auth-brand-inner { max-width: 380px; position: relative; z-index: 2; }
.logo { display: flex; align-items: center; gap: 10px; text-decoration: none; margin-bottom: 48px; }
.logo-icon { width: 38px; height: 38px; border-radius: 10px; background: var(--color-primary); display: flex; align-items: center; justify-content: center; }
.logo-text { font-family: var(--font-display); font-weight: 800; font-size: 22px; color: white; }
.logo-text span { color: #5DCAA5; }
.brand-hero h1 { font-size: 36px; color: white; margin-bottom: 14px; letter-spacing: -1.5px; }
.brand-hero p { color: rgba(230,241,251,0.55); font-size: 16px; }
.auth-form-panel { flex: 1; display: flex; align-items: center; justify-content: center; padding: 48px 32px; }
.auth-form-inner { width: 100%; max-width: 420px; }
.form-header { margin-bottom: 28px; }
.form-header h2 { font-size: 28px; margin-bottom: 8px; }
.sent-to { color: var(--color-text-secondary); font-size: 14px; line-height: 1.6; }
.required { color: var(--color-error); }
.sent-icon { width: 72px; height: 72px; border-radius: 50%; background: rgba(24,95,165,0.1); display: flex; align-items: center; justify-content: center; margin-bottom: 24px; color: var(--color-primary); }
.auth-switch { text-align: center; margin-top: 20px; font-size: 14px; color: var(--color-text-secondary); display: flex; align-items: center; justify-content: center; gap: 8px; }
.auth-switch a, .link-btn { color: var(--color-primary); text-decoration: none; font-weight: 500; background: none; border: none; cursor: pointer; font-size: inherit; padding: 0; }
.dev-badge {
  display: flex; align-items: center; gap: 8px; padding: 12px 14px;
  background: #fffbeb; border: 1px solid #fcd34d; border-radius: var(--radius-md);
  font-size: 13px; color: #92400e; margin-bottom: 20px; flex-wrap: wrap;
}
.dev-link { color: var(--color-primary); font-weight: 600; text-decoration: underline; word-break: break-all; }
@media (max-width: 768px) {
  .auth-page { flex-direction: column; }
  .auth-brand { width: 100%; padding: 24px; min-height: auto; }
  .auth-form-panel { padding: 32px 20px; }
}
</style>

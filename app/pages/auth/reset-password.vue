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
          <h1>{{ $t('auth.reset.title') }}</h1>
          <p>{{ $t('auth.reset.subtitle') }}</p>
        </div>
      </div>
    </div>
    <div class="auth-form-panel">
      <div class="auth-form-inner">

        <!-- Token invalide ou manquant -->
        <template v-if="!tokenParam || tokenError">
          <div class="error-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div class="form-header">
            <h2>{{ $t('auth.reset.invalid_token_title') }}</h2>
            <p>{{ $t('auth.reset.invalid_token') }}</p>
          </div>
          <NuxtLink to="/auth/forgot-password" class="btn btn-primary btn-full">
            {{ $t('auth.forgot.submit') }}
          </NuxtLink>
        </template>

        <!-- Formulaire nouveau mot de passe -->
        <template v-else>
          <div class="form-header">
            <h2>{{ $t('auth.reset.title') }}</h2>
            <p>{{ $t('auth.reset.subtitle') }}</p>
          </div>
          <form @submit.prevent="handleReset" novalidate>
            <div class="form-group">
              <label for="password" class="form-label">{{ $t('auth.reset.password') }} <span class="required">*</span></label>
              <div class="password-wrap">
                <input id="password" v-model="form.password" :type="showPwd ? 'text' : 'password'"
                  class="form-input" :class="{ error: errors.password }"
                  required @blur="validate" autocomplete="new-password"/>
                <button type="button" class="pwd-toggle" @click="showPwd = !showPwd" tabindex="-1">
                  <svg v-if="!showPwd" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                  <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </button>
              </div>
              <p v-if="errors.password" class="form-error" role="alert">{{ errors.password }}</p>
            </div>
            <div class="form-group">
              <label for="confirm" class="form-label">{{ $t('auth.reset.confirm') }} <span class="required">*</span></label>
              <input id="confirm" v-model="form.confirm" type="password" class="form-input"
                :class="{ error: errors.confirm }" required @blur="validateConfirm" autocomplete="new-password"/>
              <p v-if="errors.confirm" class="form-error" role="alert">{{ errors.confirm }}</p>
            </div>
            <button type="submit" class="btn btn-primary btn-full" :disabled="authStore.loading">
              <svg v-if="authStore.loading" class="animate-spin" width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              {{ authStore.loading ? $t('common.loading') : $t('auth.reset.submit') }}
            </button>
          </form>
        </template>

      </div>
    </div>
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSeoMeta, useRoute, navigateTo } from '#imports'
import { useAuthStore } from '../../stores/auth'
import Toast from '../../components/ui/Toast.vue'

definePageMeta({ layout: false })

const { t } = useI18n()
const route = useRoute()
const authStore = useAuthStore()

useSeoMeta({ title: 'Réinitialisation — findMe' })

const tokenParam = (route.query.token as string) || ''
const tokenError = ref(false)
const showPwd = ref(false)
const form = reactive({ password: '', confirm: '' })
const errors = reactive({ password: '', confirm: '' })

const validate = () => {
  errors.password = form.password.length < 8 ? t('validation.password_min') : ''
}
const validateConfirm = () => {
  errors.confirm = form.password !== form.confirm ? t('validation.password_mismatch') : ''
}

const handleReset = async () => {
  validate(); validateConfirm()
  if (errors.password || errors.confirm) return
  const ok = await authStore.resetPassword(tokenParam, form.password)
  if (ok) {
    await navigateTo('/auth/login')
  } else {
    tokenError.value = true
  }
}
</script>

<style scoped>
.auth-page { min-height: 100vh; display: flex; background: var(--color-bg); }
.auth-brand { width: 42%; background: var(--color-night); display: flex; align-items: center; justify-content: center; padding: 48px; }
.auth-brand-inner { max-width: 380px; }
.logo { display: flex; align-items: center; gap: 10px; text-decoration: none; margin-bottom: 48px; }
.logo-icon { width: 38px; height: 38px; border-radius: 10px; background: var(--color-primary); display: flex; align-items: center; justify-content: center; }
.logo-text { font-family: var(--font-display); font-weight: 800; font-size: 22px; color: white; }
.logo-text span { color: #5DCAA5; }
.brand-hero h1 { font-size: 36px; color: white; margin-bottom: 14px; }
.brand-hero p { color: rgba(230,241,251,0.55); }
.auth-form-panel { flex: 1; display: flex; align-items: center; justify-content: center; padding: 48px 32px; }
.auth-form-inner { width: 100%; max-width: 420px; }
.form-header { margin-bottom: 32px; }
.form-header h2 { font-size: 28px; margin-bottom: 8px; }
.form-header p { color: var(--color-text-secondary); font-size: 14px; line-height: 1.6; }
.required { color: var(--color-error); }
.error-icon { width: 72px; height: 72px; border-radius: 50%; background: rgba(220,38,38,0.1); display: flex; align-items: center; justify-content: center; margin-bottom: 24px; color: var(--color-error, #dc2626); }
.password-wrap { position: relative; }
.pwd-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--color-text-tertiary); padding: 4px; display: flex; align-items: center; }
@media (max-width: 768px) {
  .auth-page { flex-direction: column; }
  .auth-brand { width: 100%; padding: 24px; min-height: auto; }
  .auth-form-panel { padding: 32px 20px; }
}
</style>

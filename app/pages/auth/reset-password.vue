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
        <div class="form-header">
          <h2>{{ $t('auth.reset.title') }}</h2>
          <p>{{ $t('auth.reset.subtitle') }}</p>
        </div>
        <form @submit.prevent="handleReset" novalidate>
          <div class="form-group">
            <label for="password" class="form-label">{{ $t('auth.reset.password') }} <span class="required">*</span></label>
            <input id="password" v-model="form.password" type="password" class="form-input" :class="{ error: errors.password }" required @blur="validate"/>
            <p v-if="errors.password" class="form-error" role="alert">{{ errors.password }}</p>
          </div>
          <div class="form-group">
            <label for="confirm" class="form-label">{{ $t('auth.reset.confirm') }} <span class="required">*</span></label>
            <input id="confirm" v-model="form.confirm" type="password" class="form-input" :class="{ error: errors.confirm }" required @blur="validateConfirm"/>
            <p v-if="errors.confirm" class="form-error" role="alert">{{ errors.confirm }}</p>
          </div>
          <button type="submit" class="btn btn-primary btn-full">
            {{ $t('auth.reset.submit') }}
          </button>
        </form>
      </div>
    </div>
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSeoMeta, navigateTo } from '#imports'
import { useToast } from '../../composables/useToast'
import Toast from '../../components/ui/Toast.vue'

definePageMeta({ layout: false })

const { t } = useI18n()
const { showToast } = useToast()

useSeoMeta({ title: 'Réinitialisation — findMe' })

const form = reactive({ password: '', confirm: '' })
const errors = reactive({ password: '', confirm: '' })

const validate = () => { errors.password = form.password.length < 8 ? t('validation.password_min') : '' }
const validateConfirm = () => { errors.confirm = form.password !== form.confirm ? t('validation.password_mismatch') : '' }

const handleReset = async () => {
  validate(); validateConfirm()
  if (errors.password || errors.confirm) return
  showToast(t('auth.reset.success'), 'success')
  setTimeout(() => navigateTo('/auth/login'), 1500)
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
.form-header p { color: var(--color-text-secondary); }
.required { color: var(--color-error); }
@media (max-width: 768px) {
  .auth-page { flex-direction: column; }
  .auth-brand { width: 100%; padding: 24px; min-height: auto; }
  .auth-form-panel { padding: 32px 20px; }
}
</style>

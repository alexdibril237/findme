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
          <h1>{{ $t('auth.signup.title') }}</h1>
          <p>{{ $t('auth.signup.subtitle') }}</p>
        </div>
        <ul class="brand-features">
          <li v-for="f in features" :key="f">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1AC47D" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            {{ f }}
          </li>
        </ul>
      </div>
    </div>

    <div class="auth-form-panel">
      <div class="auth-form-inner">
        <div class="form-header">
          <h2>{{ $t('auth.signup.title') }}</h2>
          <p>{{ $t('auth.signup.subtitle') }}</p>
        </div>

        <form @submit.prevent="handleSignup" novalidate>
          <div class="form-group">
            <label for="name" class="form-label">{{ $t('auth.signup.name') }} <span class="required">*</span></label>
            <input id="name" v-model="form.name" type="text" class="form-input" :class="{ error: errors.name }"
              autocomplete="name" required @blur="validateName" aria-describedby="name-error"/>
            <p v-if="errors.name" id="name-error" class="form-error" role="alert">{{ errors.name }}</p>
          </div>

          <div class="form-group">
            <label for="email" class="form-label">{{ $t('auth.signup.email') }} <span class="required">*</span></label>
            <input id="email" v-model="form.email" type="email" class="form-input" :class="{ error: errors.email }"
              autocomplete="email" required @blur="validateEmail" aria-describedby="email-error"/>
            <p v-if="errors.email" id="email-error" class="form-error" role="alert">{{ errors.email }}</p>
          </div>

          <div class="form-group">
            <label for="password" class="form-label">{{ $t('auth.signup.password') }} <span class="required">*</span></label>
            <div class="input-password">
              <input id="password" v-model="form.password" :type="showPassword ? 'text' : 'password'"
                class="form-input" :class="{ error: errors.password }"
                autocomplete="new-password" required @input="updateStrength" @blur="validatePassword"/>
              <button type="button" class="password-toggle" @click="showPassword = !showPassword"
                :aria-label="showPassword ? 'Masquer' : 'Afficher'">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </div>
            <!-- Indicateur de force -->
            <div class="strength-bar" aria-label="Force du mot de passe">
              <div v-for="i in 4" :key="i" class="strength-segment"
                :class="{ active: strength >= i, [`s${strength}`]: strength >= i }"></div>
            </div>
            <p class="form-hint">{{ strengthLabel }}</p>
            <p v-if="errors.password" class="form-error" role="alert">{{ errors.password }}</p>
          </div>

          <div class="form-group">
            <label for="confirm" class="form-label">{{ $t('auth.signup.confirm_password') }} <span class="required">*</span></label>
            <input id="confirm" v-model="form.confirm" type="password" class="form-input"
              :class="{ error: errors.confirm }" autocomplete="new-password"
              required @blur="validateConfirm" aria-describedby="confirm-error"/>
            <p v-if="errors.confirm" id="confirm-error" class="form-error" role="alert">{{ errors.confirm }}</p>
          </div>

          <button type="submit" class="btn btn-primary btn-full" :disabled="authStore.loading">
            <svg v-if="authStore.loading" class="animate-spin" width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            {{ authStore.loading ? $t('common.loading') : $t('auth.signup.submit') }}
          </button>
        </form>

        <p class="auth-switch">
          {{ $t('auth.signup.has_account') }}
          <NuxtLink to="/auth/login">{{ $t('auth.signup.login_link') }}</NuxtLink>
        </p>
      </div>
    </div>
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSeoMeta, navigateTo } from '#imports'
import { useAuthStore } from '../../stores/auth'
import Toast from '../../components/ui/Toast.vue'

definePageMeta({ layout: false, middleware: 'guest' })

const { t } = useI18n()
const authStore = useAuthStore()

useSeoMeta({ title: 'Créer un compte — findMe' })

const form = reactive({ name: '', email: '', password: '', confirm: '' })
const errors = reactive({ name: '', email: '', password: '', confirm: '' })
const showPassword = ref(false)
const strength = ref(0)

const features = ['Gratuit à vie', 'Adresse officielle vérifiable', 'PDF avec QR code', '4 adresses maximum']

const strengthLabel = computed(() => {
  if (strength.value === 0) return ''
  return ['', 'Faible', 'Moyen', 'Fort', 'Très fort'][strength.value]
})

const updateStrength = () => {
  const p = form.password
  let s = 0
  if (p.length >= 6) s++
  if (p.length >= 8) s++
  if (/[A-Z]/.test(p)) s++
  if (/[0-9]/.test(p)) s++
  strength.value = Math.min(4, s)
}

const validateName = () => {
  errors.name = form.name.length < 2 ? t('validation.name_min') : ''
}
const validateEmail = () => {
  if (!form.email) errors.email = t('validation.required')
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = t('validation.email_invalid')
  else errors.email = ''
}
const validatePassword = () => {
  errors.password = form.password.length < 8 ? t('validation.password_min') : ''
}
const validateConfirm = () => {
  errors.confirm = form.password !== form.confirm ? t('validation.password_mismatch') : ''
}

const handleSignup = async () => {
  validateName(); validateEmail(); validatePassword(); validateConfirm()
  if (Object.values(errors).some(e => e)) return
  const ok = await authStore.signup(form.name, form.email, form.password)
  if (ok) await navigateTo('/dashboard')
}
</script>

<style scoped>
.auth-page { min-height: 100vh; display: flex; background: var(--color-bg); }
.auth-brand {
  width: 42%; background: var(--color-night);
  display: flex; align-items: center; justify-content: center; padding: 48px;
  position: relative; overflow: hidden;
}
.auth-brand::before {
  content: ''; position: absolute; inset: 0;
  background-image: linear-gradient(rgba(24,95,165,0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(24,95,165,0.07) 1px, transparent 1px);
  background-size: 40px 40px;
}
.auth-brand-inner { max-width: 380px; position: relative; z-index: 2; }
.logo { display: flex; align-items: center; gap: 10px; text-decoration: none; margin-bottom: 48px; }
.logo-icon { width: 38px; height: 38px; border-radius: 10px; background: var(--color-primary); display: flex; align-items: center; justify-content: center; }
.logo-text { font-family: var(--font-display); font-weight: 800; font-size: 22px; color: white; }
.logo-text span { color: #5DCAA5; }
.brand-hero h1 { font-size: 36px; color: white; margin-bottom: 14px; letter-spacing: -1.5px; }
.brand-hero p { color: rgba(230,241,251,0.55); font-size: 16px; margin-bottom: 36px; }
.brand-features { list-style: none; display: flex; flex-direction: column; gap: 12px; }
.brand-features li { display: flex; align-items: center; gap: 10px; color: rgba(230,241,251,0.75); font-size: 14px; }
.auth-form-panel { flex: 1; display: flex; align-items: center; justify-content: center; padding: 48px 32px; }
.auth-form-inner { width: 100%; max-width: 420px; }
.form-header { margin-bottom: 30px; }
.form-header h2 { font-size: 26px; margin-bottom: 6px; }
.form-header p { color: var(--color-text-secondary); font-size: 14px; }
.input-password { position: relative; }
.input-password .form-input { padding-right: 44px; }
.password-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--color-text-tertiary); padding: 4px; }
.strength-bar { display: flex; gap: 4px; margin-top: 8px; }
.strength-segment { height: 4px; flex: 1; border-radius: 2px; background: var(--color-border); transition: background 200ms; }
.strength-segment.active.s1 { background: #BA1A1A; }
.strength-segment.active.s2 { background: #F5A623; }
.strength-segment.active.s3 { background: #185FA5; }
.strength-segment.active.s4 { background: #0C6B3A; }
.required { color: var(--color-error); }
.auth-switch { text-align: center; margin-top: 20px; color: var(--color-text-secondary); font-size: 14px; }
.auth-switch a { color: var(--color-primary); text-decoration: none; font-weight: 600; }
@media (max-width: 768px) {
  .auth-page { flex-direction: column; }
  .auth-brand { width: 100%; padding: 24px; min-height: auto; }
  .brand-features { display: none; }
  .auth-form-panel { padding: 32px 20px; }
}
</style>

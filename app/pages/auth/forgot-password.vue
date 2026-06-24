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
          <h1>{{ step === 'otp' ? $t('auth.reset.title') : $t('auth.forgot.title') }}</h1>
          <p>{{ step === 'otp' ? $t('auth.reset.subtitle') : $t('auth.forgot.subtitle') }}</p>
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

          <form @submit.prevent="handleSendOtp" novalidate>
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

        <!-- Étape 2 : saisir le code + nouveau mot de passe -->
        <template v-else-if="step === 'otp'">
          <div class="form-header">
            <h2>{{ $t('auth.reset.title') }}</h2>
            <p class="sent-to">
              {{ $t('auth.forgot.code_sent') }} <strong>{{ email }}</strong>
            </p>
          </div>

          <!-- Badge dev mode (affiché quand pas de clé Resend) -->
          <div v-if="devOtp" class="dev-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Mode dev — Code OTP : <strong>{{ devOtp }}</strong>
          </div>

          <form @submit.prevent="handleVerify" novalidate>
            <div class="form-group">
              <label for="otp" class="form-label">{{ $t('auth.forgot.otp_label') }} <span class="required">*</span></label>
              <input id="otp" v-model="otpValue" type="text" class="form-input otp-input"
                :class="{ error: otpError }" inputmode="numeric" maxlength="6"
                autocomplete="one-time-code" required @blur="validateOtp"
                placeholder="000000" aria-describedby="otp-err"/>
              <p v-if="otpError" id="otp-err" class="form-error" role="alert">{{ otpError }}</p>
            </div>

            <div class="form-group">
              <label for="password" class="form-label">{{ $t('auth.reset.password') }} <span class="required">*</span></label>
              <div class="password-wrap">
                <input id="password" v-model="newPassword" :type="showPwd ? 'text' : 'password'"
                  class="form-input" :class="{ error: pwdError }"
                  required @blur="validatePwd" autocomplete="new-password"/>
                <button type="button" class="pwd-toggle" @click="showPwd = !showPwd" tabindex="-1">
                  <svg v-if="!showPwd" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                  <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </button>
              </div>
              <p v-if="pwdError" class="form-error" role="alert">{{ pwdError }}</p>
            </div>

            <div class="form-group">
              <label for="confirm" class="form-label">{{ $t('auth.reset.confirm') }} <span class="required">*</span></label>
              <input id="confirm" v-model="confirmPassword" type="password" class="form-input"
                :class="{ error: confirmError }" required @blur="validateConfirm" autocomplete="new-password"/>
              <p v-if="confirmError" class="form-error" role="alert">{{ confirmError }}</p>
            </div>

            <button type="submit" class="btn btn-primary btn-full" :disabled="authStore.loading">
              <svg v-if="authStore.loading" class="animate-spin" width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              {{ authStore.loading ? $t('common.loading') : $t('auth.reset.submit') }}
            </button>
          </form>

          <p class="auth-switch">
            <button type="button" class="link-btn" :disabled="authStore.loading" @click="handleSendOtp">
              {{ $t('auth.forgot.resend') }}
            </button>
            ·
            <NuxtLink to="/auth/login">{{ $t('auth.forgot.back') }}</NuxtLink>
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
import { useSeoMeta, navigateTo } from '#imports'
import { useAuthStore } from '../../stores/auth'
import Toast from '../../components/ui/Toast.vue'

definePageMeta({ layout: false })

const { t } = useI18n()
const authStore = useAuthStore()

useSeoMeta({ title: 'Mot de passe oublié — findMe' })

// ── État ──────────────────────────────────────────────────
const step = ref<'email' | 'otp'>('email')
const email = ref('')
const emailError = ref('')
const otpValue = ref('')
const otpError = ref('')
const newPassword = ref('')
const pwdError = ref('')
const confirmPassword = ref('')
const confirmError = ref('')
const showPwd = ref(false)
const devOtp = ref('')

// ── Validations ───────────────────────────────────────────
const validateEmail = () => {
  if (!email.value) emailError.value = t('validation.required')
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) emailError.value = t('validation.email_invalid')
  else emailError.value = ''
}

const validateOtp = () => {
  if (!otpValue.value) otpError.value = t('validation.required')
  else if (!/^\d{6}$/.test(otpValue.value)) otpError.value = t('auth.forgot.otp_format')
  else otpError.value = ''
}

const validatePwd = () => {
  if (!newPassword.value) pwdError.value = t('validation.required')
  else if (newPassword.value.length < 8) pwdError.value = t('validation.password_min')
  else pwdError.value = ''
}

const validateConfirm = () => {
  if (!confirmPassword.value) confirmError.value = t('validation.required')
  else if (newPassword.value !== confirmPassword.value) confirmError.value = t('validation.password_mismatch')
  else confirmError.value = ''
}

// ── Envoyer le code OTP ────────────────────────────────────
const handleSendOtp = async () => {
  validateEmail()
  if (emailError.value) return
  const result = await authStore.forgotPassword(email.value)
  if (result.ok) {
    devOtp.value = result.devOtp || ''
    step.value = 'otp'
  }
}

// ── Vérifier OTP + changer le mot de passe ─────────────────
const handleVerify = async () => {
  validateOtp(); validatePwd(); validateConfirm()
  if (otpError.value || pwdError.value || confirmError.value) return
  const ok = await authStore.resetPassword(email.value, otpValue.value, newPassword.value)
  if (ok) {
    await navigateTo('/auth/login')
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
.auth-switch { text-align: center; margin-top: 20px; font-size: 14px; color: var(--color-text-secondary); display: flex; align-items: center; justify-content: center; gap: 8px; }
.auth-switch a, .link-btn { color: var(--color-primary); text-decoration: none; font-weight: 500; background: none; border: none; cursor: pointer; font-size: inherit; padding: 0; }
.link-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.otp-input { letter-spacing: 10px; font-size: 24px; font-weight: 700; text-align: center; font-family: var(--font-display); }
.password-wrap { position: relative; }
.pwd-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--color-text-tertiary); padding: 4px; display: flex; align-items: center; }
.dev-badge {
  display: flex; align-items: center; gap: 8px; padding: 10px 14px;
  background: #fffbeb; border: 1px solid #fcd34d; border-radius: var(--radius-md);
  font-size: 13px; color: #92400e; margin-bottom: 20px;
}
@media (max-width: 768px) {
  .auth-page { flex-direction: column; }
  .auth-brand { width: 100%; padding: 24px; min-height: auto; }
  .auth-form-panel { padding: 32px 20px; }
}
</style>

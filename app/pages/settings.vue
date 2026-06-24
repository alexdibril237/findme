<template>
  <div class="settings-page">
    <div class="page-header">
      <h1>{{ $t('settings.title') }}</h1>
    </div>

    <!-- Apparence -->
    <div class="settings-section card">
      <div class="section-header">
        <div class="section-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        </div>
        <div>
          <h2>{{ $t('settings.theme') }}</h2>
          <p>{{ $t('settings.theme_desc') }}</p>
        </div>
      </div>
      <div class="theme-options">
        <button
          v-for="opt in themeOptions" :key="opt.value"
          class="theme-btn"
          :class="{ active: colorMode.preference === opt.value }"
          @click="setTheme(opt.value)"
          :aria-pressed="colorMode.preference === opt.value"
          :aria-label="opt.label"
        >
          <div class="theme-preview" :class="`preview-${opt.value}`">
            <div class="preview-bar"></div>
            <div class="preview-content">
              <div class="preview-line"></div>
              <div class="preview-line short"></div>
            </div>
          </div>
          <span>{{ opt.label }}</span>
          <svg v-if="colorMode.preference === opt.value" width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="#0C6B3A" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Langue -->
    <div class="settings-section card">
      <div class="section-header">
        <div class="section-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
        </div>
        <div>
          <h2>{{ $t('settings.language') }}</h2>
          <p>{{ $t('settings.language_desc') }}</p>
        </div>
      </div>
      <div class="lang-options">
        <button
          v-for="lang in langOptions" :key="lang.code"
          class="lang-btn"
          :class="{ active: locale === lang.code }"
          @click="setLang(lang.code)"
          :aria-pressed="locale === lang.code"
        >
          <span class="lang-flag">{{ lang.flag }}</span>
          <span>{{ lang.name }}</span>
          <svg v-if="locale === lang.code" width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="#0C6B3A" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Compte -->
    <div class="settings-section card">
      <div class="section-header">
        <div class="section-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <div>
          <h2>{{ $t('settings.account') }}</h2>
          <p>{{ authStore.currentUser?.name }} · {{ authStore.currentUser?.email }}</p>
        </div>
      </div>
      <div class="account-role">
        <span>{{ $t('settings.role') }} :</span>
        <span class="badge" :class="authStore.isAdmin ? 'badge-warning' : 'badge-primary'">
          {{ authStore.isAdmin ? $t('settings.role_admin') : $t('settings.role_user') }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSeoMeta, useColorMode, useCookie } from '#imports'
import { useAuthStore } from '../stores/auth'
import { useToast } from '../composables/useToast'

definePageMeta({ middleware: 'auth', layout: 'dashboard' })
useSeoMeta({ title: 'Paramètres — findMe' })

const { locale, t } = useI18n()
const localeCookie = useCookie('findme_locale', { maxAge: 60 * 60 * 24 * 365 })
const colorMode = useColorMode()
const authStore = useAuthStore()
const { showToast } = useToast()
const themeOptions = computed(() => [
  { value: 'light', label: t('settings.light') },
  { value: 'dark', label: t('settings.dark') },
  { value: 'system', label: t('settings.system') },
])

const langOptions = [
  { code: 'fr', name: 'Français', flag: 'FR' },
  { code: 'en', name: 'English', flag: 'EN' },
]

const setTheme = (value: string) => {
  colorMode.preference = value
  showToast(t('settings.saved'), 'success')
}

const setLang = (code: string) => {
  locale.value = code
  localeCookie.value = code
  showToast(t('settings.saved'), 'success')
}
</script>

<style scoped>
.settings-page { padding: 32px; max-width: 700px; }
.page-header { margin-bottom: 28px; }
.page-header h1 { font-size: 26px; }
.settings-section { padding: 24px; margin-bottom: 20px; }
.section-header { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 20px; }
.section-icon { width: 42px; height: 42px; border-radius: var(--radius-md); background: var(--color-primary-light); color: var(--color-primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.section-header h2 { font-size: 17px; margin-bottom: 3px; }
.section-header p { font-size: 13px; color: var(--color-text-secondary); }
.theme-options { display: flex; gap: 12px; }
.theme-btn { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 12px; border-radius: var(--radius-lg); border: 2px solid var(--color-border); background: none; cursor: pointer; transition: all 200ms; font-size: 13px; font-weight: 500; color: var(--color-text-secondary); }
.theme-btn.active { border-color: var(--color-accent); color: var(--color-accent); }
.theme-btn:hover { border-color: var(--color-primary); }
.theme-preview { width: 60px; height: 44px; border-radius: 6px; overflow: hidden; }
.preview-light { background: #F8FAFC; }
.preview-dark { background: #0F2744; }
.preview-system { background: linear-gradient(135deg, #F8FAFC 50%, #0F2744 50%); }
.preview-bar { height: 10px; background: #185FA5; }
.preview-content { padding: 4px 6px; display: flex; flex-direction: column; gap: 3px; }
.preview-line { height: 4px; background: rgba(0,0,0,0.1); border-radius: 2px; }
.preview-dark .preview-line { background: rgba(255,255,255,0.2); }
.preview-line.short { width: 60%; }
.lang-options { display: flex; gap: 12px; }
.lang-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 14px 16px; border-radius: var(--radius-lg); border: 2px solid var(--color-border); background: none; cursor: pointer; transition: all 200ms; font-size: 14px; font-weight: 600; color: var(--color-text-secondary); }
.lang-btn.active { border-color: var(--color-accent); color: var(--color-accent); }
.lang-flag { font-size: 13px; font-weight: 700; color: var(--color-primary); font-family: var(--font-display); }
.account-role { display: flex; align-items: center; gap: 12px; font-size: 14px; color: var(--color-text-secondary); }
@media (max-width: 640px) {
  .settings-page { padding: 16px; }
  .theme-options { flex-direction: column; }
}
</style>
<template>
  <div class="landing">

    <!-- ═══ HERO ═══ -->
    <section class="hero">
      <div class="hero-grid" aria-hidden="true"></div>
      <div class="hero-glow-blue" aria-hidden="true"></div>
      <div class="hero-glow-green" aria-hidden="true"></div>

      <div class="container hero-inner">
        <!-- Contenu gauche -->
        <div class="hero-content animate-slideUp">
          <div class="hero-badge">
            <span class="badge-pulse" aria-hidden="true"></span>
            GeoLink Africa · Douala, Cameroun
          </div>

          <h1>
            {{ $t('landing.hero_title') }}<br>
            <span class="hero-accent">{{ $t('landing.hero_accent') }}</span>
          </h1>

          <p class="hero-sub">{{ $t('landing.hero_sub') }}</p>

          <div class="hero-cta">
            <button v-if="!authStore.isAuthenticated" class="btn btn-primary btn-lg" @click="openModal('signup')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <circle cx="12" cy="10" r="3"/>
                <path d="M12 2C7.59 2 4 5.59 4 10c0 5.5 8 12 8 12s8-6.5 8-12c0-4.41-3.59-8-8-8z"/>
              </svg>
              {{ $t('landing.cta_primary') }}
            </button>
            <NuxtLink v-else to="/address/create" class="btn btn-primary btn-lg">
              {{ $t('address.create') }}
            </NuxtLink>
            <a href="#how" class="btn btn-outline-white btn-lg">
              {{ $t('landing.cta_secondary') }}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </a>
          </div>

          <!-- Statistiques -->
          <div class="hero-stats" role="list">
            <div class="hero-stat" role="listitem">
              <span class="stat-num">25 000+</span>
              <span class="stat-label">{{ $t('landing.stats_users') }}</span>
            </div>
            <div class="stat-sep" aria-hidden="true"></div>
            <div class="hero-stat" role="listitem">
              <span class="stat-num">70 000+</span>
              <span class="stat-label">{{ $t('landing.stats_addresses') }}</span>
            </div>
            <div class="stat-sep" aria-hidden="true"></div>
            <div class="hero-stat" role="listitem">
              <span class="stat-num">4</span>
              <span class="stat-label">{{ $t('landing.stats_cities') }}</span>
            </div>
          </div>
        </div>

        <!-- Carte flottante droite -->
        <div class="hero-visual" aria-hidden="true">
          <div class="addr-card-float">
            <div class="addr-card-header">
              <div class="addr-logo">
                <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="7.5" r="2.8" fill="white"/>
                  <path d="M9 1.5C5.96 1.5 3.5 3.96 3.5 7c0 4.1 5.5 9.5 5.5 9.5S14.5 11.1 14.5 7c0-3.04-2.46-5.5-5.5-5.5z" stroke="white" stroke-width="1.4" fill="none"/>
                </svg>
              </div>
              <span class="addr-logo-text">findMe</span>
              <span class="addr-verified">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                {{ $t('landing.card_verified') }}
              </span>
            </div>
            <div class="addr-name">Résidence Akwa</div>
            <div class="addr-detail">Rue Alfred Saker · Douala · Cameroun</div>
            <div class="addr-map">
              <OSMMap :latitude="4.0511" :longitude="9.7679" :interactive="false" height="130px"/>
            </div>
            <div class="addr-meta">
              <div class="addr-gps">
                <span class="meta-label">GPS</span>
                <span class="meta-val">4.0511° N, 9.7679° E</span>
              </div>
              <span class="addr-code">FM 9021 AKWA</span>
            </div>
            <div class="addr-actions">
              <button class="btn btn-primary btn-sm">{{ $t('landing.card_share') }}</button>
              <button class="btn btn-outline btn-sm">PDF</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ COMMENT ÇA MARCHE ═══ -->
    <section class="section" id="how">
      <div class="container">
        <div class="section-head">
          <div class="section-pill">{{ $t('landing.how_pill') }}</div>
          <h2>{{ $t('landing.how_title') }}</h2>
          <p>{{ $t('landing.how_desc') }}</p>
        </div>
        <div class="steps-grid">
          <div v-for="(step, i) in steps" :key="i" class="step-card">
            <div class="step-num">0{{ i + 1 }}</div>
            <div class="step-icon">
              <svg v-if="i === 0" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="10" r="3"/><path d="M12 2C7.59 2 4 5.59 4 10c0 5.5 8 12 8 12s8-6.5 8-12c0-4.41-3.59-8-8-8z"/>
              </svg>
              <svg v-else-if="i === 1" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <h3>{{ step.title }}</h3>
            <p>{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ TÉMOIGNAGES ═══ -->
    <section class="section testi-section" id="testimonials">
      <div class="container">
        <div class="section-head">
          <div class="section-pill">{{ $t('landing.testi_pill') }}</div>
          <h2>{{ $t('landing.testi_title') }}</h2>
        </div>
        <div class="testi-grid">
          <div v-for="(te, i) in testimonials" :key="i" class="testi-card">
            <div class="testi-stars" aria-label="5 étoiles sur 5">★★★★★</div>
            <blockquote class="testi-text">"{{ te.text }}"</blockquote>
            <div class="testi-author">
              <div class="testi-avatar" :style="{ background: te.color }">{{ te.initials }}</div>
              <div>
                <div class="testi-name">{{ te.name }}</div>
                <div class="testi-role">{{ te.role }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ CTA FINAL ═══ -->
    <section class="cta-section">
      <div class="cta-glow" aria-hidden="true"></div>
      <div class="container cta-inner">
        <div class="hero-badge" style="margin-bottom:28px">
          <span class="badge-pulse" aria-hidden="true"></span>
          {{ $t('landing.cta_badge') }}
        </div>
        <h2>{{ $t('landing.final_cta') }}</h2>
        <p>{{ $t('landing.cta_desc') }}</p>
        <div class="cta-actions">
          <button v-if="!authStore.isAuthenticated" class="btn btn-primary btn-lg" @click="openModal('signup')">
            {{ $t('landing.cta_primary') }}
          </button>
          <NuxtLink v-else to="/address/create" class="btn btn-primary btn-lg">
            {{ $t('address.create') }}
          </NuxtLink>
          <button v-if="!authStore.isAuthenticated" class="btn btn-outline-white btn-lg" @click="openModal('login')">
            {{ $t('nav.login') }}
          </button>
          <NuxtLink v-else to="/dashboard" class="btn btn-outline-white btn-lg">
            {{ $t('nav.dashboard') }}
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ═══ MODAL AUTH ═══ -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="modal-overlay" @click.self="closeModal" role="dialog" :aria-label="modalView === 'login' ? $t('auth.login.title') : $t('auth.signup.title')">
          <div class="modal-box">
            <!-- Fermer -->
            <button class="modal-close" @click="closeModal" :aria-label="$t('common.close')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            <!-- Logo -->
            <div class="modal-logo">
              <div class="logo-icon-sm">
                <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="7.5" r="2.8" fill="white"/>
                  <path d="M9 1.5C5.96 1.5 3.5 3.96 3.5 7c0 4.1 5.5 9.5 5.5 9.5S14.5 11.1 14.5 7c0-3.04-2.46-5.5-5.5-5.5z" stroke="white" stroke-width="1.4" fill="none"/>
                </svg>
              </div>
              <span class="logo-text-sm">find<span>Me</span></span>
            </div>

            <!-- Onglets -->
            <div class="modal-tabs" role="tablist">
              <button role="tab" :aria-selected="modalView === 'login'" class="modal-tab" :class="{ active: modalView === 'login' }" @click="switchView('login')">
                {{ $t('nav.login') }}
              </button>
              <button role="tab" :aria-selected="modalView === 'signup'" class="modal-tab" :class="{ active: modalView === 'signup' }" @click="switchView('signup')">
                {{ $t('auth.signup.submit') }}
              </button>
            </div>

            <!-- ── FORMULAIRE CONNEXION ── -->
            <form v-if="modalView === 'login'" @submit.prevent="handleLogin" novalidate class="modal-form">
              <div class="form-group">
                <label class="form-label">{{ $t('auth.login.email') }} <span class="req">*</span></label>
                <input v-model="lEmail" type="email" class="form-input" :class="{ error: lErrors.email }"
                  autocomplete="email" @blur="validateLoginEmail" required/>
                <p v-if="lErrors.email" class="form-error">{{ lErrors.email }}</p>
              </div>
              <div class="form-group">
                <label class="form-label">{{ $t('auth.login.password') }} <span class="req">*</span></label>
                <div class="pw-wrap">
                  <input v-model="lPassword" :type="showLPwd ? 'text' : 'password'" class="form-input"
                    :class="{ error: lErrors.password }" autocomplete="current-password"
                    @blur="validateLoginPwd" required/>
                  <button type="button" class="pw-eye" @click="showLPwd = !showLPwd" tabindex="-1">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path v-if="!showLPwd" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle v-if="!showLPwd" cx="12" cy="12" r="3"/>
                      <path v-if="showLPwd" d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path v-if="showLPwd" d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line v-if="showLPwd" x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  </button>
                </div>
                <p v-if="lErrors.password" class="form-error">{{ lErrors.password }}</p>
              </div>
              <div class="forgot-link">
                <NuxtLink to="/auth/forgot-password" @click="closeModal">{{ $t('auth.login.forgot') }}</NuxtLink>
              </div>
              <button type="submit" class="btn btn-primary btn-full" :disabled="authStore.loading">
                <svg v-if="authStore.loading" class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                {{ authStore.loading ? $t('common.loading') : $t('auth.login.submit') }}
              </button>
              <p class="switch-hint">{{ $t('auth.login.no_account') }} <button type="button" class="link-btn" @click="switchView('signup')">{{ $t('auth.login.signup_link') }}</button></p>
            </form>

            <!-- ── FORMULAIRE INSCRIPTION ── -->
            <form v-else @submit.prevent="handleSignup" novalidate class="modal-form">
              <div class="form-group">
                <label class="form-label">{{ $t('auth.signup.name') }} <span class="req">*</span></label>
                <input v-model="sName" type="text" class="form-input" :class="{ error: sErrors.name }"
                  autocomplete="name" @blur="validateSignupName" required/>
                <p v-if="sErrors.name" class="form-error">{{ sErrors.name }}</p>
              </div>
              <div class="form-group">
                <label class="form-label">{{ $t('auth.signup.email') }} <span class="req">*</span></label>
                <input v-model="sEmail" type="email" class="form-input" :class="{ error: sErrors.email }"
                  autocomplete="email" @blur="validateSignupEmail" required/>
                <p v-if="sErrors.email" class="form-error">{{ sErrors.email }}</p>
              </div>
              <div class="form-group">
                <label class="form-label">{{ $t('auth.signup.password') }} <span class="req">*</span></label>
                <div class="pw-wrap">
                  <input v-model="sPassword" :type="showSPwd ? 'text' : 'password'" class="form-input"
                    :class="{ error: sErrors.password }" autocomplete="new-password"
                    @blur="validateSignupPwd" required/>
                  <button type="button" class="pw-eye" @click="showSPwd = !showSPwd" tabindex="-1">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path v-if="!showSPwd" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle v-if="!showSPwd" cx="12" cy="12" r="3"/>
                      <path v-if="showSPwd" d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path v-if="showSPwd" d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line v-if="showSPwd" x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  </button>
                </div>
                <p v-if="sErrors.password" class="form-error">{{ sErrors.password }}</p>
              </div>
              <div class="form-group">
                <label class="form-label">{{ $t('auth.signup.confirm_password') }} <span class="req">*</span></label>
                <input v-model="sConfirm" type="password" class="form-input" :class="{ error: sErrors.confirm }"
                  autocomplete="new-password" @blur="validateSignupConfirm" required/>
                <p v-if="sErrors.confirm" class="form-error">{{ sErrors.confirm }}</p>
              </div>
              <button type="submit" class="btn btn-primary btn-full" :disabled="authStore.loading">
                <svg v-if="authStore.loading" class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                {{ authStore.loading ? $t('common.loading') : $t('auth.signup.submit') }}
              </button>
              <p class="switch-hint">{{ $t('auth.signup.has_account') }} <button type="button" class="link-btn" @click="switchView('login')">{{ $t('auth.signup.login_link') }}</button></p>
            </form>

          </div>
        </div>
      </Transition>
    </Teleport>

    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSeoMeta, navigateTo } from '#imports'
import { useAuthStore } from '../stores/auth'
import OSMMap from '../components/map/OSMMap.vue'
import Toast from '../components/ui/Toast.vue'

const { t } = useI18n()
const authStore = useAuthStore()

// ── Modal ──────────────────────────────────────────────────
const showModal = ref(false)
const modalView = ref<'login' | 'signup'>('login')

const openModal = (view: 'login' | 'signup') => {
  modalView.value = view
  resetForms()
  showModal.value = true
  document.body.style.overflow = 'hidden'
}
const closeModal = () => {
  showModal.value = false
  document.body.style.overflow = ''
}
const switchView = (view: 'login' | 'signup') => {
  modalView.value = view
  resetForms()
}

// ── Connexion ──────────────────────────────────────────────
const lEmail = ref('')
const lPassword = ref('')
const showLPwd = ref(false)
const lErrors = reactive({ email: '', password: '' })

const validateLoginEmail = () => {
  lErrors.email = !lEmail.value ? t('validation.required')
    : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lEmail.value) ? t('validation.email_invalid') : ''
}
const validateLoginPwd = () => {
  lErrors.password = !lPassword.value ? t('validation.required') : ''
}

const handleLogin = async () => {
  validateLoginEmail(); validateLoginPwd()
  if (lErrors.email || lErrors.password) return
  const ok = await authStore.login(lEmail.value, lPassword.value)
  if (ok) {
    closeModal()
    await navigateTo(authStore.isAdmin ? '/admin' : '/dashboard')
  }
}

// ── Inscription ────────────────────────────────────────────
const sName = ref('')
const sEmail = ref('')
const sPassword = ref('')
const sConfirm = ref('')
const showSPwd = ref(false)
const sErrors = reactive({ name: '', email: '', password: '', confirm: '' })

const validateSignupName = () => {
  sErrors.name = !sName.value ? t('validation.required')
    : sName.value.trim().length < 2 ? t('validation.name_min') : ''
}
const validateSignupEmail = () => {
  sErrors.email = !sEmail.value ? t('validation.required')
    : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sEmail.value) ? t('validation.email_invalid') : ''
}
const validateSignupPwd = () => {
  sErrors.password = !sPassword.value ? t('validation.required')
    : sPassword.value.length < 8 ? t('validation.password_min') : ''
}
const validateSignupConfirm = () => {
  sErrors.confirm = !sConfirm.value ? t('validation.required')
    : sPassword.value !== sConfirm.value ? t('validation.password_mismatch') : ''
}

const handleSignup = async () => {
  validateSignupName(); validateSignupEmail(); validateSignupPwd(); validateSignupConfirm()
  if (sErrors.name || sErrors.email || sErrors.password || sErrors.confirm) return
  const ok = await authStore.signup(sName.value.trim(), sEmail.value, sPassword.value)
  if (ok) {
    closeModal()
    await navigateTo('/dashboard')
  }
}

const resetForms = () => {
  lEmail.value = ''; lPassword.value = ''; showLPwd.value = false
  Object.assign(lErrors, { email: '', password: '' })
  sName.value = ''; sEmail.value = ''; sPassword.value = ''; sConfirm.value = ''; showSPwd.value = false
  Object.assign(sErrors, { name: '', email: '', password: '', confirm: '' })
}

// ── Contenu ────────────────────────────────────────────────
const steps = computed(() => [
  { title: t('landing.step1_title'), desc: t('landing.step1_desc') },
  { title: t('landing.step2_title'), desc: t('landing.step2_desc') },
  { title: t('landing.step3_title'), desc: t('landing.step3_desc') },
])

const testimonials = computed(() => [
  { text: t('landing.testi_1_text'), name: t('landing.testi_1_name'), role: t('landing.testi_1_role'), initials: 'JN', color: '#185FA5' },
  { text: t('landing.testi_2_text'), name: t('landing.testi_2_name'), role: t('landing.testi_2_role'), initials: 'AT', color: '#0C6B3A' },
  { text: t('landing.testi_3_text'), name: t('landing.testi_3_name'), role: t('landing.testi_3_role'), initials: 'ML', color: '#0C447C' },
])

useSeoMeta({
  title: 'findMe — Ton adresse. Ton identité.',
  description: 'Crée ton adresse numérique officielle en quelques minutes. Partageable, vérifiable, utilisable partout en Afrique.',
})

// Fermer avec Escape
if (process.client) {
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal() })
}
</script>

<style scoped>
.landing { overflow-x: hidden; }

/* ── HERO ── */
.hero {
  min-height: 100vh; background: var(--color-night);
  position: relative; overflow: hidden;
  display: flex; align-items: center; padding: 100px 0 80px;
}
.hero-grid {
  position: absolute; inset: 0;
  background-image: linear-gradient(rgba(24,95,165,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(24,95,165,0.07) 1px, transparent 1px);
  background-size: 52px 52px; animation: gridScroll 24s linear infinite;
}
@keyframes gridScroll { from { transform: translateY(0); } to { transform: translateY(52px); } }
.hero-glow-blue { position: absolute; width: 680px; height: 680px; border-radius: 50%; background: radial-gradient(circle, rgba(24,95,165,0.22) 0%, transparent 70%); top: -180px; right: -120px; pointer-events: none; }
.hero-glow-green { position: absolute; width: 440px; height: 440px; border-radius: 50%; background: radial-gradient(circle, rgba(12,107,58,0.14) 0%, transparent 70%); bottom: -80px; left: 60px; pointer-events: none; }
.hero-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 72px; align-items: center; position: relative; z-index: 2; }

.hero-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(24,95,165,0.18); border: 1px solid rgba(24,95,165,0.35); border-radius: var(--radius-full); padding: 6px 16px; margin-bottom: 28px; font-size: 12px; font-weight: 600; color: #93C5E8; letter-spacing: 0.4px; }
.badge-pulse { width: 7px; height: 7px; border-radius: 50%; background: #1AC47D; animation: blink 2s ease-in-out infinite; }
@keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.25; } }
.hero-content h1 { font-size: clamp(38px, 5.2vw, 68px); font-weight: 800; color: white; line-height: 1.08; letter-spacing: -2.5px; margin-bottom: 24px; }
.hero-accent { background: linear-gradient(135deg, #60AEED 0%, #1AC47D 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.hero-sub { font-size: 17px; line-height: 1.75; color: rgba(230,241,251,0.7); margin-bottom: 40px; max-width: 480px; }
.hero-cta { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 52px; }
.btn-outline-white { display: inline-flex; align-items: center; justify-content: center; gap: 6px; background: transparent; border: 1.5px solid rgba(255,255,255,0.25); color: rgba(255,255,255,0.85); padding: 14px 28px; border-radius: var(--radius-full); font-family: var(--font-display); font-size: 15px; font-weight: 600; transition: all var(--transition-fast); white-space: nowrap; text-decoration: none; cursor: pointer; }
.btn-outline-white:hover { border-color: rgba(255,255,255,0.55); color: white; background: rgba(255,255,255,0.06); }
.hero-stats { display: flex; align-items: center; gap: 28px; padding-top: 32px; border-top: 1px solid rgba(255,255,255,0.08); }
.hero-stat { display: flex; flex-direction: column; gap: 4px; }
.stat-num { font-family: var(--font-display); font-size: 26px; font-weight: 800; color: white; line-height: 1; }
.stat-label { font-size: 12px; color: rgba(230,241,251,0.45); }
.stat-sep { width: 1px; height: 38px; background: rgba(255,255,255,0.1); }

.hero-visual { display: flex; align-items: center; justify-content: center; }
.addr-card-float { background: rgba(255,255,255,0.06); backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.1); border-radius: var(--radius-2xl); padding: 24px; width: 100%; max-width: 340px; box-shadow: 0 40px 80px rgba(0,0,0,0.45); animation: float 7s ease-in-out infinite; }
@keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-14px); } }
.addr-card-header { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
.addr-logo { width: 28px; height: 28px; border-radius: 7px; background: var(--color-primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.addr-logo-text { font-family: var(--font-display); font-weight: 700; font-size: 14px; color: white; }
.addr-verified { margin-left: auto; display: inline-flex; align-items: center; gap: 4px; background: rgba(26,196,125,0.15); border: 1px solid rgba(26,196,125,0.3); border-radius: var(--radius-full); padding: 3px 9px; font-size: 11px; font-weight: 600; color: #1AC47D; }
.addr-name { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: white; margin-bottom: 4px; }
.addr-detail { font-size: 13px; color: rgba(230,241,251,0.45); margin-bottom: 16px; }
.addr-map { border-radius: var(--radius-md); overflow: hidden; margin-bottom: 14px; }
.addr-meta { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.addr-gps { display: flex; align-items: center; gap: 7px; }
.meta-label { font-size: 10px; font-weight: 700; color: rgba(230,241,251,0.3); text-transform: uppercase; letter-spacing: 0.5px; }
.meta-val { font-family: var(--font-display); font-size: 11px; font-weight: 600; color: rgba(230,241,251,0.75); }
.addr-code { font-size: 11px; font-weight: 700; color: #5BA8EF; letter-spacing: 0.3px; }
.addr-actions { display: flex; gap: 8px; }
.addr-actions .btn { flex: 1; }

/* ── SECTIONS ── */
.section { padding: 96px 0; }
.section-head { text-align: center; margin-bottom: 64px; }
.section-head h2 { font-size: clamp(26px, 3.5vw, 42px); margin-bottom: 16px; }
.section-head p { font-size: 17px; color: var(--color-text-secondary); max-width: 520px; margin: 0 auto; }
.section-pill { display: inline-flex; align-items: center; background: var(--color-primary-light); border: 1px solid rgba(24,95,165,0.15); border-radius: var(--radius-full); padding: 5px 16px; margin-bottom: 18px; font-size: 12px; font-weight: 600; color: var(--color-primary); letter-spacing: 0.5px; text-transform: uppercase; }

.steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
.step-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-xl); padding: 32px; transition: all var(--transition-base); position: relative; overflow: hidden; }
.step-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, var(--color-primary), var(--color-accent)); opacity: 0; transition: opacity var(--transition-fast); }
.step-card:hover { transform: translateY(-6px); box-shadow: var(--shadow-lg); }
.step-card:hover::before { opacity: 1; }
.step-num { font-family: var(--font-display); font-size: 56px; font-weight: 800; color: var(--color-primary-light); line-height: 1; margin-bottom: 16px; letter-spacing: -2px; }
.step-icon { width: 48px; height: 48px; border-radius: var(--radius-md); background: var(--color-primary-light); color: var(--color-primary); display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
.step-card h3 { font-size: 19px; margin-bottom: 10px; }
.step-card p { font-size: 14px; color: var(--color-text-secondary); line-height: 1.65; }

.testi-section { background: var(--color-bg-secondary); }
.testi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.testi-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-xl); padding: 28px; transition: all var(--transition-base); }
.testi-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
.testi-stars { color: #F5A623; letter-spacing: 3px; font-size: 14px; margin-bottom: 16px; }
.testi-text { font-size: 15px; line-height: 1.75; color: var(--color-text-secondary); margin-bottom: 24px; font-style: italic; }
.testi-author { display: flex; align-items: center; gap: 12px; }
.testi-avatar { width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-weight: 700; font-size: 14px; color: white; flex-shrink: 0; }
.testi-name { font-family: var(--font-display); font-weight: 700; font-size: 14px; color: var(--color-text-primary); }
.testi-role { font-size: 12px; color: var(--color-text-tertiary); }

.cta-section { background: var(--color-night); padding: 100px 0; text-align: center; position: relative; overflow: hidden; }
.cta-glow { position: absolute; width: 900px; height: 500px; background: radial-gradient(ellipse, rgba(24,95,165,0.28) 0%, transparent 70%); top: 50%; left: 50%; transform: translate(-50%, -50%); pointer-events: none; }
.cta-inner { position: relative; z-index: 2; }
.cta-inner h2 { color: white; font-size: clamp(28px, 4vw, 50px); margin-bottom: 16px; letter-spacing: -1px; }
.cta-inner p { font-size: 18px; color: rgba(230,241,251,0.55); margin-bottom: 44px; }
.cta-actions { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }

/* ── MODAL ── */
.modal-overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; padding: 16px;
}
.modal-box {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-2xl);
  padding: 36px 32px 32px;
  width: 100%; max-width: 440px;
  position: relative;
  max-height: 90vh; overflow-y: auto;
  box-shadow: 0 32px 80px rgba(0,0,0,0.35);
}
.modal-close {
  position: absolute; top: 16px; right: 16px;
  width: 32px; height: 32px; border-radius: 50%;
  background: var(--color-bg-secondary); border: 1px solid var(--color-border);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--color-text-secondary);
  transition: all var(--transition-fast);
}
.modal-close:hover { background: var(--color-bg); color: var(--color-text-primary); }
.modal-logo { display: flex; align-items: center; gap: 8px; margin-bottom: 24px; }
.logo-icon-sm { width: 30px; height: 30px; border-radius: 8px; background: var(--color-primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.logo-text-sm { font-family: var(--font-display); font-weight: 800; font-size: 18px; color: var(--color-text-primary); }
.logo-text-sm span { color: var(--color-accent); }
.modal-tabs { display: flex; gap: 4px; background: var(--color-bg-secondary); padding: 4px; border-radius: var(--radius-lg); margin-bottom: 28px; }
.modal-tab { flex: 1; padding: 8px 12px; border-radius: var(--radius-md); font-size: 14px; font-weight: 600; border: none; background: none; cursor: pointer; color: var(--color-text-secondary); transition: all var(--transition-fast); }
.modal-tab.active { background: var(--color-surface); color: var(--color-primary); box-shadow: var(--shadow-sm); }
.modal-form { display: flex; flex-direction: column; gap: 0; }
.req { color: var(--color-error); }
.pw-wrap { position: relative; }
.pw-eye { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--color-text-tertiary); padding: 4px; display: flex; align-items: center; }
.forgot-link { text-align: right; margin-top: -8px; margin-bottom: 12px; font-size: 13px; }
.forgot-link a { color: var(--color-primary); text-decoration: none; font-weight: 500; }
.switch-hint { text-align: center; margin-top: 16px; font-size: 13px; color: var(--color-text-secondary); }
.link-btn { background: none; border: none; color: var(--color-primary); font-weight: 600; cursor: pointer; font-size: inherit; padding: 0; text-decoration: underline; }

/* Animations */
.modal-enter-active, .modal-leave-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal-box, .modal-leave-to .modal-box { transform: scale(0.95) translateY(8px); }

/* ── RESPONSIVE ── */
@media (max-width: 1024px) {
  .hero-inner { grid-template-columns: 1fr; gap: 48px; }
  .hero-visual { display: none; }
  .steps-grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 768px) {
  .hero { padding: 80px 0 60px; }
  .steps-grid { grid-template-columns: 1fr; }
  .testi-grid { grid-template-columns: 1fr; }
  .hero-stats { gap: 20px; }
  .hero-cta { flex-direction: column; }
  .hero-cta .btn { width: 100%; justify-content: center; }
  .modal-box { padding: 28px 20px 24px; }
}
</style>

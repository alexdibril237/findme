<template>
  <div class="layout-public">

    <!-- ─── NAVBAR FIXE ─── -->
    <header class="nav" :class="{ 'nav-scrolled': isScrolled }" role="banner">
      <div class="container nav-inner">

        <!-- Logo -->
        <NuxtLink to="/" class="logo" aria-label="findMe — Accueil">
          <div class="logo-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="7.5" r="2.8" fill="white"/>
              <path d="M9 1.5C5.96 1.5 3.5 3.96 3.5 7c0 4.1 5.5 9.5 5.5 9.5S14.5 11.1 14.5 7c0-3.04-2.46-5.5-5.5-5.5z"
                stroke="white" stroke-width="1.4" fill="none"/>
            </svg>
          </div>
          <span class="logo-text">find<span>Me</span></span>
        </NuxtLink>

        <!-- Liens centre (desktop) -->
        <nav class="nav-links hide-mobile" role="navigation" aria-label="Navigation principale">
          <NuxtLink to="/">{{ $t('nav.home') }}</NuxtLink>
          <a href="/#how">{{ $t('nav.how') }}</a>
          <a href="/#testimonials">{{ $t('nav.testimonials') }}</a>
        </nav>

        <!-- Actions droite -->
        <div class="nav-actions">
          <!-- Toggle langue -->
          <button class="nav-pill-btn" @click="toggleLanguage" :aria-label="$t('settings.language')">
            {{ locale === 'fr' ? '🇬🇧 EN' : '🇫🇷 FR' }}
          </button>

          <!-- Toggle thème -->
          <button class="nav-pill-btn" @click="toggleTheme"
            :aria-label="colorMode.preference === 'dark' ? 'Mode clair' : 'Mode sombre'">
            <svg v-if="colorMode.preference === 'dark'" width="15" height="15" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
            </svg>
            <svg v-else width="15" height="15" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
            <span class="hide-mobile">{{ colorMode.preference === 'dark' ? $t('settings.light') : $t('settings.dark') }}</span>
          </button>

          <!-- Authentifié : Mon espace -->
          <template v-if="authStore.isAuthenticated">
            <NuxtLink to="/dashboard" class="btn btn-primary btn-sm hide-mobile">
              {{ $t('nav.dashboard') }}
            </NuxtLink>
            <div class="nav-avatar" aria-label="Mon compte">
              {{ authStore.userInitials }}
            </div>
          </template>

          <!-- Non authentifié : Login + Signup -->
          <template v-else>
            <NuxtLink to="/auth/login" class="btn btn-ghost btn-sm hide-mobile">
              {{ $t('nav.login') }}
            </NuxtLink>
            <NuxtLink to="/auth/signup" class="btn btn-primary btn-sm">
              {{ $t('nav.signup') }}
            </NuxtLink>
          </template>

          <!-- Hamburger mobile -->
          <button
            class="btn btn-ghost btn-icon show-mobile"
            @click="mobileOpen = !mobileOpen"
            :aria-label="mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'"
            :aria-expanded="mobileOpen"
          >
            <svg v-if="!mobileOpen" width="22" height="22" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
            <svg v-else width="22" height="22" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Drawer mobile -->
      <Transition name="drawer">
        <div v-if="mobileOpen" class="mobile-drawer" role="dialog" aria-label="Menu mobile">
          <nav class="mobile-nav" role="navigation">
            <NuxtLink to="/" @click="mobileOpen = false">{{ $t('nav.home') }}</NuxtLink>
            <a href="/#how" @click="mobileOpen = false">{{ $t('nav.how') }}</a>
            <a href="/#testimonials" @click="mobileOpen = false">{{ $t('nav.testimonials') }}</a>
            <div class="mobile-divider"></div>
            <template v-if="authStore.isAuthenticated">
              <NuxtLink to="/dashboard" @click="mobileOpen = false" class="btn btn-primary btn-full">
                {{ $t('nav.dashboard') }}
              </NuxtLink>
            </template>
            <template v-else>
              <NuxtLink to="/auth/login" @click="mobileOpen = false" class="btn btn-outline btn-full">
                {{ $t('nav.login') }}
              </NuxtLink>
              <NuxtLink to="/auth/signup" @click="mobileOpen = false" class="btn btn-primary btn-full">
                {{ $t('nav.signup') }}
              </NuxtLink>
            </template>
            <div class="mobile-divider"></div>
            <div class="mobile-toggles">
              <button class="btn btn-ghost btn-sm" @click="toggleLanguage">
                {{ locale === 'fr' ? '🇬🇧 EN' : '🇫🇷 FR' }}
              </button>
              <button class="btn btn-ghost btn-sm" @click="toggleTheme">
                {{ colorMode.preference === 'dark' ? '☀️ Clair' : '🌙 Sombre' }}
              </button>
            </div>
          </nav>
        </div>
      </Transition>
    </header>

    <!-- Overlay mobile -->
    <div v-if="mobileOpen" class="nav-overlay" @click="mobileOpen = false" aria-hidden="true"></div>

    <main>
      <slot />
    </main>

    <!-- ─── FOOTER ─── -->
    <footer class="footer" role="contentinfo">
      <div class="container">
        <div class="footer-top">
          <div class="footer-brand">
            <NuxtLink to="/" class="logo" aria-label="findMe">
              <div class="logo-icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="7.5" r="2.8" fill="white"/>
                  <path d="M9 1.5C5.96 1.5 3.5 3.96 3.5 7c0 4.1 5.5 9.5 5.5 9.5S14.5 11.1 14.5 7c0-3.04-2.46-5.5-5.5-5.5z"
                    stroke="white" stroke-width="1.4" fill="none"/>
                </svg>
              </div>
              <span class="logo-text footer-logo-text">find<span>Me</span></span>
            </NuxtLink>
            <p>{{ $t('app.description') }}</p>
            <p class="footer-geo">by GeoLink Africa · Douala, Cameroun</p>
          </div>

          <div class="footer-col">
            <h4>Produit</h4>
            <a href="/#how">{{ $t('nav.how') }}</a>
            <a href="/#testimonials">{{ $t('nav.testimonials') }}</a>
            <NuxtLink to="/auth/signup">{{ $t('nav.signup') }}</NuxtLink>
          </div>

          <div class="footer-col">
            <h4>Support</h4>
            <NuxtLink to="/auth/login">{{ $t('nav.login') }}</NuxtLink>
            <NuxtLink to="/auth/signup">Créer un compte</NuxtLink>
          </div>
        </div>

        <div class="footer-bottom">
          <span>{{ $t('footer.copyright') }}</span>
          <div class="footer-links">
            <a href="#">{{ $t('footer.privacy') }}</a>
            <a href="#">{{ $t('footer.terms') }}</a>
          </div>
        </div>
      </div>
    </footer>

    <!-- Toast global -->
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'
import { useColorMode, useCookie } from '#imports'
import Toast from '../components/ui/Toast.vue'

const authStore = useAuthStore()
const colorMode = useColorMode()
const { locale } = useI18n()
const localeCookie = useCookie('findme_locale', { maxAge: 60 * 60 * 24 * 365 })
const isScrolled = ref(false)
const mobileOpen = ref(false)

onMounted(() => {
  // Restore session so navbar shows correct auth state
  authStore.restoreSession()
  window.addEventListener('scroll', () => {
    isScrolled.value = window.scrollY > 20
  }, { passive: true })
})

const toggleTheme = () => {
  colorMode.preference = colorMode.preference === 'dark' ? 'light' : 'dark'
}

const toggleLanguage = () => {
  const next = locale.value === 'fr' ? 'en' : 'fr'
  locale.value = next
  localeCookie.value = next
}
</script>

<style scoped>
.layout-public { min-height: 100vh; display: flex; flex-direction: column; }

/* ── NAVBAR ── */
.nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  transition: box-shadow var(--transition-base);
}
.nav-inner {
  display: flex; align-items: center; gap: 16px;
  height: 64px;
}
.nav-scrolled { box-shadow: var(--shadow-md); }

.logo {
  display: flex; align-items: center; gap: 10px;
  text-decoration: none; flex-shrink: 0;
}
.logo-icon {
  width: 34px; height: 34px; border-radius: 9px;
  background: var(--color-primary);
  display: flex; align-items: center; justify-content: center;
}
.logo-text {
  font-family: var(--font-display); font-weight: 800;
  font-size: 20px; color: var(--color-primary-dark);
}
.logo-text span { color: var(--color-accent); }

.nav-links {
  display: flex; gap: 28px; margin: 0 auto;
  align-items: center;
}
.nav-links a {
  font-size: 14px; font-weight: 500;
  color: var(--color-text-secondary); text-decoration: none;
  transition: color var(--transition-fast);
}
.nav-links a:hover, .nav-links .router-link-active { color: var(--color-primary); }

.nav-actions {
  display: flex; align-items: center; gap: 8px;
  margin-left: auto;
}

.nav-pill-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 14px; border-radius: var(--radius-full);
  border: 1.5px solid var(--color-border);
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  font-size: 13px; font-weight: 600; cursor: pointer;
  transition: all var(--transition-fast); white-space: nowrap;
}
.nav-pill-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-light);
}

.nav-avatar {
  width: 34px; height: 34px; border-radius: 50%;
  background: var(--color-primary-light); color: var(--color-primary);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display); font-weight: 700; font-size: 12px;
  cursor: pointer;
}

.show-mobile { display: none !important; }

/* Drawer mobile */
.mobile-drawer {
  background: var(--color-bg);
  border-top: 1px solid var(--color-border);
  padding: 16px;
}
.mobile-nav {
  display: flex; flex-direction: column; gap: 8px;
}
.mobile-nav a, .mobile-nav .router-link-active {
  display: block; padding: 10px 12px; border-radius: var(--radius-md);
  font-size: 15px; font-weight: 500; color: var(--color-text-primary);
  text-decoration: none;
  transition: background var(--transition-fast);
}
.mobile-nav a:hover { background: var(--color-bg-secondary); }
.mobile-divider { height: 1px; background: var(--color-border); margin: 4px 0; }
.mobile-toggles { display: flex; gap: 8px; flex-wrap: wrap; }

.nav-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.3);
  z-index: 99; cursor: pointer;
}

/* Animations drawer */
.drawer-enter-active, .drawer-leave-active { transition: all 200ms ease; }
.drawer-enter-from, .drawer-leave-to { opacity: 0; transform: translateY(-8px); }

/* ── MAIN ── */
main { flex: 1; padding-top: 64px; }

/* ── FOOTER ── */
.footer { background: #080E17; padding: 56px 0 28px; margin-top: auto; }
.footer-top {
  display: grid; grid-template-columns: 2fr 1fr 1fr;
  gap: 48px; padding-bottom: 40px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  margin-bottom: 28px;
}
.footer-logo-text { color: white !important; }
.footer-logo-text span { color: #5DCAA5 !important; }
.footer-brand p {
  font-size: 14px; color: rgba(255,255,255,0.4);
  margin-top: 12px; max-width: 240px; line-height: 1.6;
}
.footer-geo { font-size: 12px; color: rgba(255,255,255,0.25); margin-top: 6px !important; }
.footer-col h4 {
  font-family: var(--font-display); font-size: 11px; font-weight: 600;
  color: rgba(255,255,255,0.5); text-transform: uppercase;
  letter-spacing: 0.5px; margin-bottom: 14px;
}
.footer-col a {
  display: block; font-size: 14px; color: rgba(255,255,255,0.4);
  text-decoration: none; margin-bottom: 10px;
  transition: color var(--transition-fast);
}
.footer-col a:hover { color: rgba(255,255,255,0.8); }
.footer-bottom {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 13px; color: rgba(255,255,255,0.25);
}
.footer-links { display: flex; gap: 20px; }
.footer-links a {
  color: rgba(255,255,255,0.25); text-decoration: none;
  transition: color var(--transition-fast);
}
.footer-links a:hover { color: rgba(255,255,255,0.6); }

@media (max-width: 768px) {
  .hide-mobile { display: none !important; }
  .show-mobile { display: flex !important; }
  .footer-top { grid-template-columns: 1fr; gap: 24px; }
  .footer-bottom { flex-direction: column; gap: 12px; text-align: center; }
}
</style>

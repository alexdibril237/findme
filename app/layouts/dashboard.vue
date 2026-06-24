<template>
  <div class="layout-dashboard">

    <!-- ─── SIDEBAR ─── -->
    <aside class="sidebar" :class="{ 'sidebar-open': sidebarOpen }" role="complementary" aria-label="Navigation latérale">
      <div class="sidebar-header">
        <NuxtLink to="/dashboard" class="logo" aria-label="findMe — Tableau de bord">
          <div class="logo-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="7.5" r="2.8" fill="white"/>
              <path d="M9 1.5C5.96 1.5 3.5 3.96 3.5 7c0 4.1 5.5 9.5 5.5 9.5S14.5 11.1 14.5 7c0-3.04-2.46-5.5-5.5-5.5z"
                stroke="white" stroke-width="1.4" fill="none"/>
            </svg>
          </div>
          <span class="logo-text">find<span>Me</span></span>
        </NuxtLink>
        <button class="sidebar-close" @click="sidebarOpen = false" aria-label="Fermer menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <!-- Info utilisateur -->
      <div class="sidebar-user">
        <div class="user-avatar" aria-label="Avatar utilisateur">{{ userInitials }}</div>
        <div class="user-info">
          <div class="user-name">{{ authStore.currentUser?.name || 'Utilisateur' }}</div>
          <div class="user-role">
            <span class="role-badge" :class="authStore.isAdmin ? 'role-admin' : 'role-user'">
              {{ authStore.isAdmin ? 'Administrateur' : 'Utilisateur' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Navigation principale -->
      <nav class="sidebar-nav" role="navigation" aria-label="Navigation tableau de bord">
        <div class="nav-section-label">ESPACE PERSONNEL</div>

        <NuxtLink to="/dashboard" class="nav-item" :class="{ active: route.path === '/dashboard' }">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
          Mes adresses
          <span v-if="addressCount > 0" class="nav-badge">{{ addressCount }}/4</span>
        </NuxtLink>

        <NuxtLink to="/address/create" class="nav-item" :class="{ active: route.path.startsWith('/address') }">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="12" cy="10" r="3"/>
            <path d="M12 2C7.59 2 4 5.59 4 10c0 5.5 8 12 8 12s8-6.5 8-12c0-4.41-3.59-8-8-8z"/>
            <line x1="12" y1="18" x2="12" y2="22" stroke-width="2.5"/>
          </svg>
          {{ $t('address.create') }}
        </NuxtLink>

        <NuxtLink to="/dashboard/messages" class="nav-item" :class="{ active: route.path === '/dashboard/messages' }" aria-label="Mes messages">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          Messages
          <span v-if="msgStore.unreadCount > 0" class="nav-badge nav-badge-alert">
            {{ msgStore.unreadCount }}
          </span>
        </NuxtLink>

        <div class="nav-divider"></div>
        <div class="nav-section-label">COMPTE</div>

        <NuxtLink to="/support" class="nav-item" :class="{ active: route.path === '/support' }">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          {{ $t('support.title') }}
        </NuxtLink>

        <NuxtLink to="/settings" class="nav-item" :class="{ active: route.path === '/settings' }">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          {{ $t('settings.title') }}
        </NuxtLink>

        <!-- Section Admin -->
        <template v-if="authStore.isAdmin">
          <div class="nav-divider"></div>
          <div class="nav-section-label">ADMINISTRATION</div>
          <NuxtLink to="/admin" class="nav-item nav-admin" :class="{ active: route.path.startsWith('/admin') }">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            {{ $t('admin.title') }}
          </NuxtLink>
          <NuxtLink to="/admin/users" class="nav-item nav-admin" :class="{ active: route.path === '/admin/users' }">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Utilisateurs
          </NuxtLink>
          <NuxtLink to="/admin/addresses" class="nav-item nav-admin" :class="{ active: route.path === '/admin/addresses' }">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            Adresses
          </NuxtLink>
          <NuxtLink to="/admin/support" class="nav-item nav-admin" :class="{ active: route.path === '/admin/support' }">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            Tickets support
          </NuxtLink>
        </template>

        <div class="nav-divider"></div>

        <!-- Déconnexion -->
        <button class="nav-item nav-logout" @click="handleLogout" aria-label="Se déconnecter">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          {{ $t('nav.logout') }}
        </button>
      </nav>

      <!-- Bas de sidebar : thème + langue -->
      <div class="sidebar-footer">
        <button class="btn btn-ghost btn-sm" @click="toggleTheme" :aria-label="$t('settings.theme')">
          <svg v-if="colorMode.preference === 'dark'" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
          </svg>
          <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
          {{ colorMode.preference === 'dark' ? $t('settings.light') : $t('settings.dark') }}
        </button>
        <button class="btn btn-ghost btn-sm" @click="toggleLanguage" :aria-label="$t('settings.language')">
          {{ locale === 'fr' ? '🇬🇧 EN' : '🇫🇷 FR' }}
        </button>
      </div>
    </aside>

    <!-- Overlay mobile -->
    <div v-if="sidebarOpen" class="sidebar-overlay" @click="sidebarOpen = false" aria-hidden="true"></div>

    <!-- ─── CONTENU PRINCIPAL ─── -->
    <div class="main-content">
      <!-- Topbar (visible sur tous les écrans) -->
      <header class="topbar" role="banner">
        <!-- Hamburger mobile uniquement -->
        <button class="btn btn-ghost btn-icon hamburger" @click="sidebarOpen = true" aria-label="Ouvrir le menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <NuxtLink to="/dashboard" class="logo topbar-logo">
          <span class="logo-text" style="font-size:18px">find<span>Me</span></span>
        </NuxtLink>
        <div class="topbar-right">
          <NuxtLink to="/dashboard/messages" class="bell-btn" :aria-label="`Messages${msgStore.unreadCount > 0 ? ` (${msgStore.unreadCount} non lus)` : ''}`">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            <span v-if="msgStore.unreadCount > 0" class="bell-badge">{{ msgStore.unreadCount }}</span>
          </NuxtLink>
          <!-- Toggle langue -->
          <button class="btn btn-ghost btn-sm" @click="toggleLanguage" :aria-label="$t('settings.language')">
            {{ locale === 'fr' ? '🇬🇧 EN' : '🇫🇷 FR' }}
          </button>
          <!-- Toggle thème -->
          <button class="theme-btn" @click="toggleTheme" :title="colorMode.preference === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'">
            <svg v-if="colorMode.preference === 'dark'" width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
            </svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
            <span class="theme-label">{{ colorMode.preference === 'dark' ? 'Clair' : 'Sombre' }}</span>
          </button>
          <div class="user-avatar-sm">{{ userInitials }}</div>
        </div>
      </header>

      <slot />
    </div>

    <!-- Toast global -->
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'
import { useAddressStore } from '../stores/address'
import { useMessageStore } from '../stores/messages'
import { useColorMode } from '#imports'
import Toast from '../components/ui/Toast.vue'

defineOptions({ middleware: 'auth' })

const authStore = useAuthStore()
const addressStore = useAddressStore()
const msgStore = useMessageStore()
const colorMode = useColorMode()
const { locale } = useI18n()
const route = useRoute()
const sidebarOpen = ref(false)

const userInitials = computed(() => authStore.userInitials || '?')
const addressCount = computed(() => addressStore.addresses.length)

onMounted(() => {
  msgStore.fetchMessages()
})

const handleLogout = () => {
  authStore.logout()
}

const toggleTheme = () => {
  colorMode.preference = colorMode.preference === 'dark' ? 'light' : 'dark'
}

const toggleLanguage = () => {
  locale.value = locale.value === 'fr' ? 'en' : 'fr'
}

// Fermer la sidebar lors d'un changement de route
watch(() => route.path, () => {
  sidebarOpen.value = false
})
</script>

<style scoped>
.layout-dashboard { display: flex; min-height: 100vh; }

/* ── SIDEBAR ── */
.sidebar {
  width: 260px; flex-shrink: 0;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  display: flex; flex-direction: column;
  position: fixed; top: 0; left: 0; bottom: 0;
  z-index: 50; overflow-y: auto;
  transition: transform var(--transition-base);
}

.sidebar-header {
  padding: 20px 16px;
  border-bottom: 1px solid var(--color-border);
  display: flex; align-items: center; justify-content: space-between;
  flex-shrink: 0;
}
.logo { display: flex; align-items: center; gap: 8px; text-decoration: none; }
.logo-icon {
  width: 32px; height: 32px; border-radius: 8px;
  background: var(--color-primary);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.logo-text {
  font-family: var(--font-display); font-weight: 800;
  font-size: 18px; color: var(--color-primary-dark);
}
.logo-text span { color: var(--color-accent); }
.sidebar-close {
  background: none; border: none; cursor: pointer;
  color: var(--color-text-secondary); padding: 4px; display: none;
  border-radius: var(--radius-md); transition: background var(--transition-fast);
}
.sidebar-close:hover { background: var(--color-bg-secondary); }

.sidebar-user {
  padding: 16px; border-bottom: 1px solid var(--color-border);
  display: flex; align-items: center; gap: 12px; flex-shrink: 0;
}
.user-avatar {
  width: 42px; height: 42px; border-radius: 50%;
  background: linear-gradient(135deg, #185FA5, #0C6B3A);
  color: white;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display); font-weight: 700; font-size: 14px; flex-shrink: 0;
}
.user-avatar-sm {
  width: 32px; height: 32px; border-radius: 50%;
  background: linear-gradient(135deg, #185FA5, #0C6B3A);
  color: white; font-family: var(--font-display); font-weight: 700; font-size: 12px;
  display: flex; align-items: center; justify-content: center;
}
.user-name { font-size: 14px; font-weight: 600; color: var(--color-text-primary); }
.role-badge {
  display: inline-block; font-size: 11px; font-weight: 600;
  padding: 2px 8px; border-radius: var(--radius-full);
}
.role-admin { background: rgba(133,79,11,0.12); color: #854F0B; }
.role-user  { background: var(--color-primary-light); color: var(--color-primary); }

.sidebar-nav { padding: 10px 8px; flex: 1; overflow-y: auto; }
.nav-section-label {
  font-size: 10px; font-weight: 700; color: var(--color-text-tertiary);
  letter-spacing: 0.8px; padding: 6px 12px 4px;
}
.nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; border-radius: var(--radius-md);
  font-size: 14px; font-weight: 500; color: var(--color-text-secondary);
  text-decoration: none; transition: all var(--transition-fast);
  width: 100%; cursor: pointer; border: none; background: none;
  margin-bottom: 2px; position: relative;
}
.nav-item:hover { background: var(--color-bg-secondary); color: var(--color-text-primary); }
.nav-item.active {
  background: var(--color-primary-light); color: var(--color-primary); font-weight: 600;
}
.nav-item.active svg { stroke: var(--color-primary); }
.nav-badge {
  margin-left: auto; font-size: 10px; font-weight: 700;
  background: var(--color-primary-light); color: var(--color-primary);
  padding: 1px 6px; border-radius: var(--radius-full);
}
.nav-badge-alert {
  background: var(--color-error, #D93025); color: white;
}
.bell-btn {
  position: relative; display: flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; border-radius: var(--radius-md);
  color: var(--color-text-secondary); text-decoration: none;
  transition: background var(--transition-fast);
}
.bell-btn:hover { background: var(--color-bg-secondary); color: var(--color-text-primary); }
.bell-badge {
  position: absolute; top: 2px; right: 2px;
  width: 16px; height: 16px; border-radius: 50%;
  background: var(--color-error, #D93025); color: white;
  font-size: 9px; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  border: 1.5px solid var(--color-surface);
}
.nav-admin { color: #854F0B; }
.nav-admin:hover { background: rgba(133,79,11,0.08); }
.nav-admin.active { background: rgba(133,79,11,0.12); color: #854F0B; }
.nav-logout { color: var(--color-error); }
.nav-logout:hover { background: var(--color-error-light); }
.nav-divider { height: 1px; background: var(--color-border); margin: 6px 12px; }

.sidebar-footer {
  padding: 12px; border-top: 1px solid var(--color-border);
  display: flex; gap: 6px; flex-wrap: wrap; flex-shrink: 0;
}

/* ── MAIN ── */
.main-content { margin-left: 260px; flex: 1; min-height: 100vh; background: var(--color-bg-secondary); }

/* ── TOPBAR (tous écrans) ── */
.topbar {
  height: 56px; background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  display: flex; align-items: center;
  gap: 12px; padding: 0 20px;
  position: sticky; top: 0; z-index: 40;
}
.topbar-right { margin-left: auto; display: flex; gap: 8px; align-items: center; }
.hamburger { display: none; }
.topbar-logo { display: none; }

.theme-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 12px; border-radius: var(--radius-md);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  font-size: 13px; font-weight: 500;
  cursor: pointer; transition: all var(--transition-fast);
}
.theme-btn:hover {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
  color: var(--color-primary);
}
.theme-label { font-size: 13px; }

.sidebar-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5); z-index: 49;
}

@media (max-width: 768px) {
  .sidebar { transform: translateX(-100%); }
  .sidebar-open { transform: translateX(0) !important; }
  .sidebar-close { display: flex !important; }
  .main-content { margin-left: 0; }
  .hamburger { display: flex !important; }
  .topbar-logo { display: flex !important; }
  .theme-label { display: none; }
}
</style>

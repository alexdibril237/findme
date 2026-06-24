<template>
  <div class="error-page">
    <div class="error-bg" aria-hidden="true">
      <div class="bg-glow-blue"></div>
      <div class="bg-glow-green"></div>
      <div class="bg-grid"></div>
    </div>

    <div class="error-content">
      <!-- Logo -->
      <NuxtLink to="/" class="logo" aria-label="findMe — Retour accueil">
        <div class="logo-icon">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="7.5" r="2.8" fill="white"/>
            <path d="M9 1.5C5.96 1.5 3.5 3.96 3.5 7c0 4.1 5.5 9.5 5.5 9.5S14.5 11.1 14.5 7c0-3.04-2.46-5.5-5.5-5.5z"
              stroke="white" stroke-width="1.4" fill="none"/>
          </svg>
        </div>
        <span class="logo-text">find<span>Me</span></span>
      </NuxtLink>

      <!-- Code erreur -->
      <div class="error-code" aria-hidden="true">{{ error?.statusCode || 404 }}</div>

      <!-- Message -->
      <h1>{{ title }}</h1>
      <p class="error-desc">{{ description }}</p>

      <!-- Actions -->
      <div class="error-actions">
        <NuxtLink to="/" class="btn btn-primary btn-lg">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          Retour à l'accueil
        </NuxtLink>
        <button class="btn btn-outline-white btn-lg" @click="handleError">
          Réessayer
        </button>
      </div>

      <!-- Liens rapides -->
      <div class="quick-links">
        <span>Liens utiles :</span>
        <NuxtLink to="/auth/login">Se connecter</NuxtLink>
        <NuxtLink to="/auth/signup">Créer un compte</NuxtLink>
        <NuxtLink to="/support">Support</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { clearError } from 'nuxt/app'

const props = defineProps<{ error: { statusCode?: number; message?: string } | null }>()

const title = computed(() => {
  switch (props.error?.statusCode) {
    case 404: return 'Page introuvable'
    case 403: return 'Accès refusé'
    case 500: return 'Erreur serveur'
    default:  return 'Une erreur est survenue'
  }
})

const description = computed(() => {
  switch (props.error?.statusCode) {
    case 404: return 'La page que vous cherchez n\'existe pas ou a été déplacée.'
    case 403: return 'Vous n\'avez pas les droits pour accéder à cette ressource.'
    case 500: return 'Notre serveur a rencontré une erreur. Réessayez dans quelques instants.'
    default:  return props.error?.message || 'Quelque chose s\'est mal passé. Réessayez plus tard.'
  }
})

const handleError = () => clearError({ redirect: '/' })
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  background: var(--color-night, #0F2744);
  display: flex; align-items: center; justify-content: center;
  position: relative; overflow: hidden; padding: 32px;
}

.error-bg { position: absolute; inset: 0; pointer-events: none; }
.bg-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(24,95,165,0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(24,95,165,0.07) 1px, transparent 1px);
  background-size: 52px 52px;
}
.bg-glow-blue {
  position: absolute; width: 600px; height: 600px; border-radius: 50%;
  background: radial-gradient(circle, rgba(24,95,165,0.20) 0%, transparent 70%);
  top: -100px; right: -100px;
}
.bg-glow-green {
  position: absolute; width: 400px; height: 400px; border-radius: 50%;
  background: radial-gradient(circle, rgba(12,107,58,0.12) 0%, transparent 70%);
  bottom: -80px; left: 40px;
}

.error-content {
  position: relative; z-index: 2;
  display: flex; flex-direction: column; align-items: center;
  text-align: center; max-width: 560px;
}

.logo {
  display: flex; align-items: center; gap: 10px;
  text-decoration: none; margin-bottom: 48px;
}
.logo-icon {
  width: 38px; height: 38px; border-radius: 10px;
  background: #185FA5;
  display: flex; align-items: center; justify-content: center;
}
.logo-text {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 800; font-size: 22px; color: white;
}
.logo-text span { color: #5DCAA5; }

.error-code {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: clamp(80px, 15vw, 140px);
  font-weight: 800; line-height: 1;
  background: linear-gradient(135deg, rgba(24,95,165,0.4) 0%, rgba(12,107,58,0.4) 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 24px; letter-spacing: -4px;
}

h1 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: clamp(24px, 4vw, 36px);
  font-weight: 700; color: white;
  margin-bottom: 12px; letter-spacing: -1px;
}

.error-desc {
  font-size: 16px; line-height: 1.65;
  color: rgba(230,241,251,0.55);
  margin-bottom: 40px; max-width: 420px;
}

.error-actions {
  display: flex; gap: 12px; flex-wrap: wrap;
  justify-content: center; margin-bottom: 40px;
}

.btn {
  display: inline-flex; align-items: center; gap: 8px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 15px; font-weight: 600;
  padding: 14px 28px; border-radius: 9999px;
  border: 1.5px solid transparent;
  transition: all 150ms ease; white-space: nowrap;
  text-decoration: none; cursor: pointer;
}
.btn-primary {
  background: #185FA5; color: white; border-color: #185FA5;
}
.btn-primary:hover { background: #0C447C; transform: translateY(-1px); }
.btn-outline-white {
  background: transparent; color: rgba(255,255,255,0.85);
  border-color: rgba(255,255,255,0.25);
}
.btn-outline-white:hover { border-color: rgba(255,255,255,0.55); color: white; }
.btn-lg { padding: 16px 32px; font-size: 16px; }

.quick-links {
  display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
  justify-content: center; font-size: 13px;
  color: rgba(230,241,251,0.35);
}
.quick-links a {
  color: rgba(230,241,251,0.55); text-decoration: none;
  transition: color 150ms;
}
.quick-links a:hover { color: white; }

@media (max-width: 480px) {
  .error-actions { flex-direction: column; width: 100%; }
  .btn { width: 100%; justify-content: center; }
}
</style>

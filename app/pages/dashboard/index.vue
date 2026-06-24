<template>
  <div class="dashboard-page">

    <!-- En-tête -->
    <div class="page-header">
      <div>
        <h1>{{ $t('dashboard.welcome') }}, {{ authStore.firstName }} 👋</h1>
        <p class="page-sub">{{ formattedDate }}</p>
      </div>
      <NuxtLink
        v-if="addressStore.canCreateMore"
        to="/address/create"
        class="btn btn-primary"
        aria-label="Créer une nouvelle adresse"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        {{ $t('dashboard.create_address') }}
      </NuxtLink>
    </div>

    <!-- Cartes statistiques -->
    <div class="stats-row">
      <div class="stat-card card">
        <div class="stat-icon stat-icon-blue">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#185FA5" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        <div class="stat-body">
          <div class="stat-value">{{ addressStore.addresses.length }}<span class="stat-max">/4</span></div>
          <div class="stat-label">{{ $t('dashboard.addresses') }}</div>
        </div>
        <div class="stat-bar">
          <div class="stat-bar-fill" :style="{ width: `${(addressStore.addresses.length / 4) * 100}%` }"></div>
        </div>
      </div>

      <div class="stat-card card">
        <div class="stat-icon stat-icon-green">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0C6B3A" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <div class="stat-body">
          <div class="stat-value">{{ addressStore.verifiedAddresses.length }}</div>
          <div class="stat-label">{{ $t('dashboard.verified') }}</div>
        </div>
      </div>

      <div class="stat-card card">
        <div class="stat-icon stat-icon-amber">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#854F0B" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
        </div>
        <div class="stat-body">
          <div class="stat-value">{{ addressStore.remaining }}</div>
          <div class="stat-label">{{ $t('dashboard.remaining') }}</div>
        </div>
      </div>

      <div class="stat-card card stat-card-cta" v-if="!addressStore.canCreateMore">
        <div class="stat-icon stat-icon-red">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#BA1A1A" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <div class="stat-body">
          <div class="stat-value">{{ $t('dashboard.limit_title') }}</div>
          <div class="stat-label">{{ $t('dashboard.limit_reached') }}</div>
        </div>
      </div>
      <NuxtLink to="/address/create" class="stat-card card stat-cta-new" v-else>
        <div class="stat-icon stat-icon-primary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#185FA5" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
        </div>
        <div class="stat-body">
          <div class="stat-value" style="font-size:14px;font-weight:600;color:var(--color-primary)">{{ $t('dashboard.new_address_cta') }}</div>
          <div class="stat-label">{{ $t('dashboard.click_to_create') }}</div>
        </div>
      </NuxtLink>
    </div>

    <!-- Chargement : squelettes -->
    <div v-if="addressStore.loading" class="addresses-grid">
      <div v-for="i in 3" :key="i" class="skeleton" style="height:240px;border-radius:16px"></div>
    </div>

    <!-- État vide -->
    <div v-else-if="addressStore.addresses.length === 0" class="empty-state">
      <div class="empty-state-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#185FA5" stroke-width="2">
          <circle cx="12" cy="10" r="3"/>
          <path d="M12 2C7.59 2 4 5.59 4 10c0 5.5 8 12 8 12s8-6.5 8-12c0-4.41-3.59-8-8-8z"/>
        </svg>
      </div>
      <h3>{{ $t('address.empty_title') }}</h3>
      <p>{{ $t('address.empty_desc') }}</p>
      <NuxtLink to="/address/create" class="btn btn-primary">
        {{ $t('address.create') }}
      </NuxtLink>
    </div>

    <!-- Grille d'adresses -->
    <template v-else>
      <div class="section-title">
        <h2>{{ $t('address.title') }}</h2>
        <span class="badge badge-primary">{{ addressStore.addresses.length }}</span>
      </div>
      <div class="addresses-grid">
        <AddressCard
          v-for="addr in addressStore.addresses"
          :key="addr.id"
          :address="addr"
          @pdf="exportPDF"
          @delete="confirmDelete"
        />
      </div>
    </template>

    <!-- Section actions rapides -->
    <div class="quick-actions card" v-if="addressStore.addresses.length > 0">
      <h3 class="quick-title">{{ $t('dashboard.quick_actions') }}</h3>
      <div class="quick-grid">
        <NuxtLink to="/address/create" class="quick-item" v-if="addressStore.canCreateMore">
          <div class="quick-icon qi-blue">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#185FA5" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
          </div>
          <span>{{ $t('dashboard.add_address') }}</span>
        </NuxtLink>
        <button class="quick-item" @click="exportAllPDF" :disabled="exportingAll">
          <div class="quick-icon qi-green">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0C6B3A" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="12" y2="18"/><line x1="15" y1="15" x2="12" y2="18"/>
            </svg>
          </div>
          <span>{{ exportingAll ? $t('dashboard.generating') : $t('dashboard.export_pdf') }}</span>
        </button>
        <NuxtLink to="/support" class="quick-item">
          <div class="quick-icon qi-amber">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#854F0B" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <span>{{ $t('dashboard.contact_support') }}</span>
        </NuxtLink>
        <NuxtLink to="/settings" class="quick-item">
          <div class="quick-icon qi-gray">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4A5568" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </div>
          <span>{{ $t('settings.title') }}</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Modal confirmation suppression -->
    <Teleport to="body">
      <div v-if="deleteTarget" class="modal-overlay" role="dialog" aria-modal="true"
        aria-labelledby="modal-title" @click.self="deleteTarget = null">
        <div class="modal">
          <div class="modal-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#BA1A1A" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </div>
          <h3 id="modal-title">{{ $t('address.delete_confirm') }}</h3>
          <p>
            {{ $t('address.delete_message') }}<br>
            <strong>"{{ deleteTarget.label }}"</strong>
          </p>
          <div class="modal-actions">
            <button class="btn btn-ghost" @click="deleteTarget = null">{{ $t('common.cancel') }}</button>
            <button class="btn btn-danger" @click="handleDelete" :disabled="addressStore.loading">
              <svg v-if="addressStore.loading" class="animate-spin" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              {{ addressStore.loading ? $t('common.loading') : $t('common.confirm') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSeoMeta } from '#imports'
import { useAuthStore } from '../../stores/auth'
import { useAddressStore } from '../../stores/address'
import { useToast } from '../../composables/useToast'
import { generateAddressPDF } from '../../composables/usePDF'
import AddressCard from '../../components/ui/AddressCard.vue'

definePageMeta({ middleware: 'auth', layout: 'dashboard' })
useSeoMeta({ title: 'Mon espace — findMe' })

const { locale } = useI18n()
const authStore = useAuthStore()
const addressStore = useAddressStore()
const { showToast } = useToast()

const formattedDate = computed(() =>
  new Date().toLocaleDateString(locale.value === 'en' ? 'en-US' : 'fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
)

const deleteTarget = ref<any>(null)
const exportingAll = ref(false)

onMounted(async () => {
  if (!authStore.currentUser?.id) return
  // Nouvel inscrit : démarrer avec un dashboard vide, ne pas charger les adresses du mock
  const isNew = sessionStorage.getItem('findme_new_user')
  if (isNew) {
    sessionStorage.removeItem('findme_new_user')
    addressStore.addresses = []
    return
  }
  await addressStore.fetchMyAddresses(authStore.currentUser.id)
})

const confirmDelete = (addr: any) => { deleteTarget.value = addr }

const handleDelete = async () => {
  if (!deleteTarget.value) return
  await addressStore.deleteAddress(deleteTarget.value.id)
  deleteTarget.value = null
}

const exportPDF = async (addr: any) => {
  try {
    await generateAddressPDF(addr)
  } catch {
    showToast('Erreur lors de la génération du PDF', 'error')
  }
}

const exportAllPDF = async () => {
  const addrs = addressStore.addresses
  if (addrs.length === 0) return
  exportingAll.value = true
  try {
    for (const addr of addrs) {
      await generateAddressPDF(addr)
      if (addrs.length > 1) await new Promise(r => setTimeout(r, 700))
    }
  } catch {
    showToast('Erreur lors de la génération du PDF', 'error')
  } finally {
    exportingAll.value = false
  }
}
</script>

<style scoped>
.dashboard-page { padding: 32px; max-width: 1100px; }

.page-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  margin-bottom: 28px; gap: 16px;
}
.page-header h1 { font-size: clamp(20px, 3vw, 28px); margin-bottom: 4px; }
.page-sub { color: var(--color-text-secondary); font-size: 13px; text-transform: capitalize; }

/* ── STATS ── */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}
.stat-card {
  padding: 18px 20px; display: flex;
  flex-direction: column; gap: 12px;
  position: relative; overflow: hidden;
}
.stat-cta-new {
  cursor: pointer; border: 1.5px dashed var(--color-border);
  background: var(--color-bg-secondary);
  transition: all 250ms;
}
.stat-cta-new:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}
.stat-icon {
  width: 44px; height: 44px; border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.stat-icon-blue  { background: var(--color-primary-light); }
.stat-icon-green { background: var(--color-success-light); }
.stat-icon-amber { background: var(--color-warning-light); }
.stat-icon-red   { background: var(--color-error-light); }
.stat-icon-primary { background: var(--color-primary-light); }

.stat-body { flex: 1; }
.stat-value {
  font-family: var(--font-display); font-size: 32px; font-weight: 800;
  color: var(--color-text-primary); line-height: 1; margin-bottom: 4px;
}
.stat-max { font-size: 16px; color: var(--color-text-tertiary); font-weight: 500; }
.stat-label { font-size: 12px; color: var(--color-text-secondary); }

.stat-bar {
  height: 4px; background: var(--color-bg-tertiary);
  border-radius: var(--radius-full); overflow: hidden;
}
.stat-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #185FA5, #0C6B3A);
  border-radius: var(--radius-full);
  transition: width 600ms ease;
}

/* ── SECTION ── */
.section-title {
  display: flex; align-items: center; gap: 12px;
  margin-bottom: 20px;
}
.section-title h2 { font-size: 18px; font-weight: 700; }

/* ── GRID ADRESSES ── */
.addresses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

/* ── QUICK ACTIONS ── */
.quick-actions { padding: 24px; }
.quick-title { font-size: 15px; font-weight: 700; margin-bottom: 16px; }
.quick-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.quick-item {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  padding: 16px 12px; border-radius: var(--radius-lg);
  border: 1.5px solid var(--color-border);
  background: var(--color-bg-secondary);
  text-decoration: none; cursor: pointer;
  transition: all 200ms; font-size: 12px; font-weight: 600;
  color: var(--color-text-secondary); text-align: center;
}
.quick-item:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
  color: var(--color-primary);
  transform: translateY(-2px);
}
.quick-item:disabled { opacity: 0.5; cursor: not-allowed; }
.quick-icon {
  width: 44px; height: 44px; border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
}
.qi-blue  { background: var(--color-primary-light); }
.qi-green { background: var(--color-success-light); }
.qi-amber { background: var(--color-warning-light); }
.qi-gray  { background: var(--color-bg-tertiary); }

/* ── MODAL ── */
.modal-icon {
  width: 56px; height: 56px; border-radius: var(--radius-xl);
  background: var(--color-error-light);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 16px;
}
.modal h3 { text-align: center; margin-bottom: 8px; }
.modal p  { text-align: center; color: var(--color-text-secondary); font-size: 14px; line-height: 1.6; }
.modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; }

/* ── RESPONSIVE ── */
@media (max-width: 1024px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .quick-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .dashboard-page { padding: 16px; }
  .page-header { flex-direction: column; }
  .stats-row { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .stat-value { font-size: 24px; }
  .addresses-grid { grid-template-columns: 1fr; }
  .quick-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>

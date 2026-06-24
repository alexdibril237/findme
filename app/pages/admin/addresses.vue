<template>
  <div class="admin-page">
    <div class="page-header">
      <h1>Gestion des adresses</h1>
      <span class="badge badge-gray">{{ filtered.length }} adresses</span>
    </div>

    <!-- Filtres -->
    <div class="filters-bar card">
      <div class="filter-group">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input v-model="search" type="search" class="search-input" placeholder="Rechercher..."/>
      </div>
      <select v-model="filterStatus" class="form-select" style="width:140px">
        <option value="">Tous statuts</option>
        <option value="verified">Vérifiée</option>
        <option value="pending">En attente</option>
        <option value="draft">Brouillon</option>
      </select>
      <select v-model="filterCity" class="form-select" style="width:140px">
        <option value="">Toutes villes</option>
        <option v-for="c in cities" :key="c" :value="c">{{ c }}</option>
      </select>
    </div>

    <div class="card table-card">
      <div v-if="loading" class="table-loading">
        <div v-for="i in 5" :key="i" class="skeleton" style="height:48px;border-radius:8px;margin-bottom:8px"></div>
      </div>
      <div v-else-if="filtered.length === 0" class="empty-state">
        <div class="empty-state-icon">📍</div>
        <p>Aucune adresse trouvée</p>
      </div>
      <div v-else class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Code</th><th>Label</th><th>Rue</th><th>Ville</th><th>Statut</th><th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="addr in paginated" :key="addr.id">
              <td><span class="addr-code">{{ addr.addressCode }}</span></td>
              <td><strong>{{ addr.label }}</strong></td>
              <td>{{ addr.street }}, {{ addr.neighborhood }}</td>
              <td>{{ addr.city }}</td>
              <td>
                <StatusBadge :status="addr.status" />
              </td>
              <td>{{ formatDate(addr.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="totalPages > 1" class="pagination">
        <button class="btn btn-ghost btn-sm" :disabled="page === 1" @click="page--">Prev</button>
        <span class="page-info">{{ page }} / {{ totalPages }}</span>
        <button class="btn btn-ghost btn-sm" :disabled="page === totalPages" @click="page++">Next</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSeoMeta, useRuntimeConfig } from '#imports'
import StatusBadge from '../../components/ui/StatusBadge.vue'

definePageMeta({ middleware: 'auth', layout: 'dashboard' })
useSeoMeta({ title: 'Adresses — Admin findMe' })

const config = useRuntimeConfig()
const loading = ref(true)
const addresses = ref<any[]>([])
const search = ref('')
const filterStatus = ref('')
const filterCity = ref('')
const page = ref(1)
const perPage = 10

onMounted(async () => {
  const tok = process.client ? localStorage.getItem('findme_token') : null
  try {
    // GET /admin/addresses → { success, data: { addresses: [...] } }
    const res = await $fetch<any>(`${config.public.apiBase}/admin/addresses?page=1&limit=50`, {
      headers: tok ? { Authorization: `Bearer ${tok}` } : {},
    })
    addresses.value = res?.data?.addresses || []
  } catch { addresses.value = [] }
  finally { loading.value = false }
})

const cities = computed(() => [...new Set(addresses.value.map(a => a.city).filter(Boolean))])

const filtered = computed(() => addresses.value.filter(a => {
  const q = search.value.toLowerCase()
  const matchSearch = !q || (a.label || '').toLowerCase().includes(q) || (a.addressCode || '').toLowerCase().includes(q)
  const matchStatus = !filterStatus.value || a.status === filterStatus.value
  const matchCity = !filterCity.value || a.city === filterCity.value
  return matchSearch && matchStatus && matchCity
}))

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / perPage)))
const paginated = computed(() => filtered.value.slice((page.value - 1) * perPage, page.value * perPage))
const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('fr-FR') : '—'
</script>

<style scoped>
.admin-page { padding: 32px; max-width: 1100px; }
.page-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
.page-header h1 { font-size: 26px; }
.filters-bar { padding: 12px 16px; display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 20px; }
.filter-group { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 200px; }
.search-input { flex: 1; border: none; background: none; font-size: 14px; color: var(--color-text-primary); outline: none; }
.table-card { padding: 0; overflow: hidden; }
.table-loading { padding: 20px; }
.table-wrapper { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--color-text-tertiary); border-bottom: 1px solid var(--color-border); }
.data-table td { padding: 12px 16px; font-size: 14px; border-bottom: 1px solid var(--color-border); }
.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: var(--color-bg-secondary); }
.addr-code { font-family: var(--font-display); font-weight: 700; color: var(--color-primary); font-size: 12px; }
.pagination { display: flex; align-items: center; justify-content: center; gap: 16px; padding: 16px; border-top: 1px solid var(--color-border); }
.page-info { font-size: 14px; color: var(--color-text-secondary); }
@media (max-width: 640px) { .admin-page { padding: 16px; } }
</style>
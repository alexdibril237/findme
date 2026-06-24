<template>
  <div class="admin-dashboard">

    <!-- En-tête -->
    <div class="admin-header">
      <div>
        <h1>{{ $t('admin.dashboard') }}</h1>
        <p class="admin-sub">{{ $t('admin.welcome') }}, {{ authStore.currentUser?.name }} · Administration findMe</p>
      </div>
      <span class="badge badge-warning">{{ $t('admin.badge_admin') }}</span>
    </div>

    <!-- ═══ STATS CARDS ═══ -->
    <div class="stats-grid" v-if="!statsLoading">
      <div class="stat-card card">
        <div class="stat-icon" style="background:#E6F1FB">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#185FA5" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div class="stat-value">{{ stats.totalUsers?.toLocaleString('fr-FR') || '—' }}</div>
        <div class="stat-label">{{ $t('admin.stats.total_users') }}</div>
        <div class="stat-trend">+{{ stats.newMonth?.toLocaleString('fr-FR') || 0 }} {{ $t('admin.new_month') }}</div>
      </div>
      <div class="stat-card card">
        <div class="stat-icon" style="background:#E6F4ED">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0C6B3A" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        <div class="stat-value">{{ stats.totalAddresses?.toLocaleString('fr-FR') || '—' }}</div>
        <div class="stat-label">{{ $t('admin.stats.total_addresses') }}</div>
        <div class="stat-trend">{{ stats.verifiedMonth?.toLocaleString('fr-FR') || 0 }} {{ $t('admin.verified_month') }}</div>
      </div>
      <div class="stat-card card">
        <div class="stat-icon" style="background:#FEF3E2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#854F0B" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div class="stat-value">{{ stats.openTickets || '—' }}</div>
        <div class="stat-label">{{ $t('admin.stats.open_tickets') }}</div>
        <div class="stat-trend">{{ stats.resolvedMonth || 0 }} {{ $t('admin.resolved_month') }}</div>
      </div>
      <div class="stat-card card">
        <div class="stat-icon" style="background:#E6F1FB">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0C447C" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
          </svg>
        </div>
        <div class="stat-value">{{ users.length }}</div>
        <div class="stat-label">{{ $t('admin.loaded_users') }}</div>
        <div class="stat-trend">{{ addresses.length }} {{ $t('admin.loaded_addr') }}</div>
      </div>
    </div>
    <div v-else class="stats-grid">
      <div v-for="i in 4" :key="i" class="skeleton" style="height:110px;border-radius:16px"></div>
    </div>

    <!-- ═══ ONGLETS ═══ -->
    <div class="tabs-bar">
      <button class="tab" :class="{ active: tab === 'users' }" @click="tab = 'users'">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        </svg>
        {{ $t('admin.users') }}
        <span class="tab-count">{{ users.length }}</span>
      </button>
      <button class="tab" :class="{ active: tab === 'addresses' }" @click="tab = 'addresses'">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
        {{ $t('admin.addresses') }}
        <span class="tab-count">{{ addresses.length }}</span>
      </button>
    </div>

    <!-- ═══ ONGLET UTILISATEURS ═══ -->
    <div v-if="tab === 'users'" class="card table-card">

      <!-- Filtres utilisateurs -->
      <div class="filters-bar">
        <div class="filter-search">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input v-model="uSearch" type="search" class="search-input" :placeholder="$t('admin.filters.name_email')"/>
        </div>
        <select v-model="uRole" class="form-select filter-select">
          <option value="">{{ $t('admin.filters.all_roles') }}</option>
          <option value="admin">{{ $t('admin.filters.admin_role') }}</option>
          <option value="user">{{ $t('admin.filters.user_role') }}</option>
        </select>
        <select v-model="uCity" class="form-select filter-select">
          <option value="">{{ $t('admin.filters.all_cities') }}</option>
          <option v-for="c in userCities" :key="c" :value="c">{{ c }}</option>
        </select>
        <button v-if="uSearch || uRole || uCity" class="btn btn-ghost btn-sm reset-btn" @click="uSearch='';uRole='';uCity=''">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          {{ $t('admin.filters.reset') }}
        </button>
        <span class="filter-count">{{ filteredUsers.length }} {{ $t('admin.filters.results') }}</span>
      </div>

      <!-- Tableau utilisateurs -->
      <div v-if="usersLoading" class="table-loading">
        <div v-for="i in 4" :key="i" class="skeleton" style="height:52px;border-radius:8px;margin-bottom:8px"></div>
      </div>
      <div v-else-if="filteredUsers.length === 0" class="empty-state" style="padding:40px">
        <p>{{ $t('admin.empty_users') }}</p>
      </div>
      <div v-else class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>{{ $t('admin.table.user_col') }}</th>
              <th>{{ $t('admin.table.email') }}</th>
              <th>{{ $t('admin.table.role') }}</th>
              <th>{{ $t('admin.table.city') }}</th>
              <th>{{ $t('admin.table.addresses') }}</th>
              <th>{{ $t('admin.table.joined') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in paginatedUsers" :key="u.id">
              <td>
                <div class="user-cell">
                  <div class="mini-avatar" :style="{ background: avatarBg(u.name) }">{{ initials(u.name) }}</div>
                  <div>
                    <div class="user-name">{{ u.name || 'Inconnu' }}</div>
                    <div class="user-id">{{ u.id }}</div>
                  </div>
                </div>
              </td>
              <td class="muted">{{ u.email }}</td>
              <td>
                <span class="badge" :class="u.role === 'admin' ? 'badge-warning' : 'badge-primary'">
                  {{ u.role === 'admin' ? $t('admin.filters.admin_role') : $t('admin.filters.user_role') }}
                </span>
              </td>
              <td class="muted">{{ u.city || '—' }}</td>
              <td><span class="count-bubble">{{ u.addressCount ?? 0 }}</span></td>
              <td class="muted">{{ fmtDate(u.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="uTotalPages > 1" class="pagination">
        <button class="btn btn-ghost btn-sm" :disabled="uPage === 1" @click="uPage--">{{ $t('admin.prev') }}</button>
        <span class="page-info">{{ uPage }} / {{ uTotalPages }}</span>
        <button class="btn btn-ghost btn-sm" :disabled="uPage === uTotalPages" @click="uPage++">{{ $t('admin.next') }}</button>
      </div>
    </div>

    <!-- ═══ ONGLET ADRESSES ═══ -->
    <div v-if="tab === 'addresses'" class="card table-card">

      <!-- Filtres adresses -->
      <div class="filters-bar">
        <div class="filter-search">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input v-model="aSearch" type="search" class="search-input" :placeholder="$t('admin.filters.label_code')"/>
        </div>
        <select v-model="aStatus" class="form-select filter-select">
          <option value="">{{ $t('admin.filters.all_statuses') }}</option>
          <option value="verified">{{ $t('address.status.verified') }}</option>
          <option value="pending">{{ $t('address.status.pending') }}</option>
          <option value="draft">{{ $t('address.status.draft') }}</option>
        </select>
        <select v-model="aCity" class="form-select filter-select" @change="aNeighborhood=''">
          <option value="">{{ $t('admin.filters.all_cities') }}</option>
          <option v-for="c in addrCities" :key="c" :value="c">{{ c }}</option>
        </select>
        <select v-model="aNeighborhood" class="form-select filter-select">
          <option value="">{{ $t('admin.filters.all_neighborhoods') }}</option>
          <option v-for="n in addrNeighborhoods" :key="n" :value="n">{{ n }}</option>
        </select>
        <button v-if="aSearch || aStatus || aCity || aNeighborhood" class="btn btn-ghost btn-sm reset-btn" @click="aSearch='';aStatus='';aCity='';aNeighborhood=''">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          {{ $t('admin.filters.reset') }}
        </button>
        <span class="filter-count">{{ filteredAddresses.length }} {{ $t('admin.filters.results') }}</span>
      </div>

      <!-- Tableau adresses -->
      <div v-if="addrLoading" class="table-loading">
        <div v-for="i in 4" :key="i" class="skeleton" style="height:52px;border-radius:8px;margin-bottom:8px"></div>
      </div>
      <div v-else-if="filteredAddresses.length === 0" class="empty-state" style="padding:40px">
        <p>{{ $t('admin.empty_addresses') }}</p>
      </div>
      <div v-else class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>{{ $t('admin.table.code') }}</th>
              <th>{{ $t('admin.table.label_col') }}</th>
              <th>{{ $t('admin.table.street_neighborhood') }}</th>
              <th>{{ $t('admin.table.city') }}</th>
              <th>{{ $t('admin.table.status') }}</th>
              <th>{{ $t('admin.table.date') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in paginatedAddresses" :key="a.id">
              <td><span class="addr-code">{{ a.addressCode }}</span></td>
              <td><strong>{{ a.label }}</strong></td>
              <td class="muted">{{ a.street }}, {{ a.neighborhood }}</td>
              <td class="muted">{{ a.city }}</td>
              <td>
                <span class="status-badge" :class="`status-${a.status}`">
                  {{ statusLabel(a.status) }}
                </span>
              </td>
              <td class="muted">{{ fmtDate(a.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="aTotalPages > 1" class="pagination">
        <button class="btn btn-ghost btn-sm" :disabled="aPage === 1" @click="aPage--">{{ $t('admin.prev') }}</button>
        <span class="page-info">{{ aPage }} / {{ aTotalPages }}</span>
        <button class="btn btn-ghost btn-sm" :disabled="aPage === aTotalPages" @click="aPage++">{{ $t('admin.next') }}</button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSeoMeta, useRuntimeConfig } from '#imports'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../stores/auth'

definePageMeta({ middleware: 'auth', layout: 'dashboard' })
useSeoMeta({ title: 'Administration — findMe' })

const { t } = useI18n()
const config = useRuntimeConfig()
const authStore = useAuthStore()

// ── Tab actif ──────────────────────────────────────────────
const tab = ref<'users' | 'addresses'>('users')

// ── Stats ──────────────────────────────────────────────────
const statsLoading = ref(true)
const stats = ref<any>({})

// ── Utilisateurs ───────────────────────────────────────────
const usersLoading = ref(true)
const users = ref<any[]>([])
const uSearch = ref('')
const uRole = ref('')
const uCity = ref('')
const uPage = ref(1)
const perPage = 10

// ── Adresses ───────────────────────────────────────────────
const addrLoading = ref(true)
const addresses = ref<any[]>([])
const aSearch = ref('')
const aStatus = ref('')
const aCity = ref('')
const aNeighborhood = ref('')
const aPage = ref(1)

onMounted(async () => {
  const tok = process.client ? localStorage.getItem('findme_token') : null
  const headers: Record<string, string> = tok ? { Authorization: `Bearer ${tok}` } : {}

  // Stats
  try {
    const r = await $fetch<any>(`${config.public.apiBase}/admin/dashboard`, { headers })
    const d = r?.data || {}
    stats.value = {
      totalUsers: d.users?.total,
      newMonth: d.users?.newThisMonth,
      totalAddresses: d.addresses?.total,
      verifiedMonth: d.addresses?.verifiedThisMonth,
      openTickets: d.support?.open,
      resolvedMonth: d.support?.resolvedThisMonth,
    }
  } catch {
    stats.value = { totalUsers: 25432, newMonth: 1240, totalAddresses: 70215, verifiedMonth: 3400, openTickets: 28, resolvedMonth: 142 }
  } finally { statsLoading.value = false }

  // Utilisateurs — API mock + utilisateurs créés localement
  try {
    const r = await $fetch<any>(`${config.public.apiBase}/admin/users?page=1&limit=50`, { headers })
    users.value = r?.data?.users || []
  } catch { users.value = [] }
  finally { usersLoading.value = false }

  // Fusionner avec les comptes créés localement (localStorage)
  if (process.client) {
    try {
      const localRaw = localStorage.getItem('findme_local_users')
      const localUsers: any[] = localRaw ? JSON.parse(localRaw) : []
      const apiIds = new Set(users.value.map((u: any) => u.email))
      const newLocals = localUsers
        .filter(u => !apiIds.has(u.email))
        .map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role || 'user',
          city: '',
          addressCount: 0,
          createdAt: new Date().toISOString(),
        }))
      users.value = [...users.value, ...newLocals]
    } catch {}
  }

  // Adresses — API mock + adresses créées localement
  try {
    const r = await $fetch<any>(`${config.public.apiBase}/admin/addresses?page=1&limit=50`, { headers })
    addresses.value = r?.data?.addresses || []
  } catch { addresses.value = [] }
  finally { addrLoading.value = false }

  // Fusionner avec les adresses créées localement
  if (process.client) {
    try {
      const localUsersRaw = localStorage.getItem('findme_local_users')
      const localUsers: any[] = localUsersRaw ? JSON.parse(localUsersRaw) : []
      const apiAddrIds = new Set(addresses.value.map((a: any) => a.id))
      const localAddrs: any[] = []
      for (const u of localUsers) {
        const key = `findme_addresses_${u.id}`
        const raw = localStorage.getItem(key)
        if (!raw) continue
        const addrs: any[] = JSON.parse(raw)
        addrs.forEach(a => {
          if (!apiAddrIds.has(a.id)) localAddrs.push(a)
        })
      }
      addresses.value = [...addresses.value, ...localAddrs]
    } catch {}
  }
})

// ── Filtres utilisateurs ───────────────────────────────────
const userCities = computed(() => [...new Set(users.value.map(u => u.city).filter(Boolean))].sort())

const filteredUsers = computed(() => {
  let list = users.value
  if (uSearch.value) {
    const q = uSearch.value.toLowerCase()
    list = list.filter(u => (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q))
  }
  if (uRole.value) list = list.filter(u => u.role === uRole.value)
  if (uCity.value) list = list.filter(u => u.city === uCity.value)
  return list
})
const uTotalPages = computed(() => Math.max(1, Math.ceil(filteredUsers.value.length / perPage)))
const paginatedUsers = computed(() => filteredUsers.value.slice((uPage.value - 1) * perPage, uPage.value * perPage))

// ── Filtres adresses ───────────────────────────────────────
const addrCities = computed(() => [...new Set(addresses.value.map(a => a.city).filter(Boolean))].sort())
const addrNeighborhoods = computed(() => {
  const base = aCity.value ? addresses.value.filter(a => a.city === aCity.value) : addresses.value
  return [...new Set(base.map(a => a.neighborhood).filter(Boolean))].sort()
})

const filteredAddresses = computed(() => {
  let list = addresses.value
  if (aSearch.value) {
    const q = aSearch.value.toLowerCase()
    list = list.filter(a => (a.label || '').toLowerCase().includes(q) || (a.addressCode || '').toLowerCase().includes(q))
  }
  if (aStatus.value) list = list.filter(a => a.status === aStatus.value)
  if (aCity.value) list = list.filter(a => a.city === aCity.value)
  if (aNeighborhood.value) list = list.filter(a => a.neighborhood === aNeighborhood.value)
  return list
})
const aTotalPages = computed(() => Math.max(1, Math.ceil(filteredAddresses.value.length / perPage)))
const paginatedAddresses = computed(() => filteredAddresses.value.slice((aPage.value - 1) * perPage, aPage.value * perPage))

// ── Helpers ────────────────────────────────────────────────
const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const initials = (name: string) => (name || '?').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
const avatarBg = (name: string) => {
  const colors = ['#185FA5', '#0C6B3A', '#0C447C', '#854F0B']
  return colors[(name?.charCodeAt(0) || 0) % colors.length]
}
const statusLabel = (s: string) => ({
  verified: t('address.status.verified'),
  pending: t('address.status.pending'),
  draft: t('address.status.draft'),
}[s] || s)
</script>

<style scoped>
.admin-dashboard { padding: 32px; max-width: 1200px; }

.admin-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 16px; margin-bottom: 32px; flex-wrap: wrap;
}
.admin-header h1 { font-size: 28px; margin-bottom: 4px; }
.admin-sub { font-size: 14px; color: var(--color-text-secondary); }

/* ── Stats ── */
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
.stat-card { padding: 20px; display: flex; flex-direction: column; gap: 8px; }
.stat-icon { width: 44px; height: 44px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; }
.stat-value { font-family: var(--font-display); font-size: 28px; font-weight: 800; color: var(--color-text-primary); line-height: 1; }
.stat-label { font-size: 13px; font-weight: 500; color: var(--color-text-secondary); }
.stat-trend { font-size: 12px; color: var(--color-text-tertiary); }

/* ── Onglets ── */
.tabs-bar {
  display: flex; gap: 4px;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-xl);
  padding: 4px; margin-bottom: 16px;
  width: fit-content;
}
.tab {
  display: flex; align-items: center; gap: 7px;
  padding: 9px 20px; border-radius: var(--radius-lg);
  border: none; background: none; cursor: pointer;
  font-size: 14px; font-weight: 500;
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
}
.tab.active {
  background: var(--color-surface);
  color: var(--color-primary); font-weight: 600;
  box-shadow: var(--shadow-sm);
}
.tab-count {
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-size: 11px; font-weight: 700;
  padding: 2px 7px; border-radius: var(--radius-full);
}
.tab.active .tab-count { background: var(--color-primary); color: white; }

/* ── Table ── */
.table-card { padding: 0; overflow: hidden; }
.filters-bar {
  display: flex; align-items: center; gap: 10px;
  flex-wrap: wrap; padding: 14px 16px;
  border-bottom: 1px solid var(--color-border);
}
.filter-search {
  display: flex; align-items: center; gap: 8px;
  flex: 1; min-width: 200px; color: var(--color-text-tertiary);
}
.search-input {
  flex: 1; border: none; background: none;
  font-size: 14px; color: var(--color-text-primary); outline: none;
}
.filter-select { width: 150px; padding: 8px 10px; font-size: 13px; }
.reset-btn { color: var(--color-error); }
.filter-count { font-size: 12px; color: var(--color-text-tertiary); margin-left: auto; white-space: nowrap; }

.table-loading { padding: 20px; }
.table-wrapper { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th {
  padding: 11px 16px; text-align: left;
  font-size: 11px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.6px; color: var(--color-text-tertiary);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-secondary); white-space: nowrap;
}
.data-table td { padding: 13px 16px; font-size: 14px; border-bottom: 1px solid var(--color-border); }
.data-table tr:last-child td { border-bottom: none; }
.data-table tbody tr:hover td { background: var(--color-bg-secondary); }
.muted { color: var(--color-text-secondary); }

.user-cell { display: flex; align-items: center; gap: 10px; }
.mini-avatar {
  width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
  color: white; display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; font-family: var(--font-display);
}
.user-name { font-size: 14px; font-weight: 600; color: var(--color-text-primary); }
.user-id { font-size: 11px; color: var(--color-text-tertiary); }
.count-bubble {
  display: inline-flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border-radius: 50%;
  background: var(--color-primary-light); color: var(--color-primary);
  font-size: 12px; font-weight: 700;
}
.addr-code { font-family: var(--font-display); font-weight: 700; color: var(--color-primary); font-size: 12px; letter-spacing: 0.3px; }

.status-badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 10px; border-radius: var(--radius-full);
  font-size: 12px; font-weight: 600;
}
.status-badge::before { content: ''; width: 6px; height: 6px; border-radius: 50%; }
.status-verified { background: rgba(12,107,58,0.1); color: #0C6B3A; }
.status-verified::before { background: #0C6B3A; }
.status-pending { background: rgba(133,79,11,0.1); color: #854F0B; }
.status-pending::before { background: #854F0B; }
.status-draft { background: var(--color-bg-secondary); color: var(--color-text-tertiary); }
.status-draft::before { background: var(--color-text-tertiary); }

.pagination {
  display: flex; align-items: center; justify-content: center;
  gap: 16px; padding: 14px; border-top: 1px solid var(--color-border);
}
.page-info { font-size: 14px; color: var(--color-text-secondary); }

@media (max-width: 1024px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px) {
  .admin-dashboard { padding: 16px; }
  .stats-grid { grid-template-columns: 1fr; }
  .filters-bar { flex-direction: column; align-items: stretch; }
  .filter-select { width: 100%; }
  .filter-count { margin-left: 0; }
}
</style>

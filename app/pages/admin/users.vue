<template>
  <div class="admin-page">
    <div class="page-header">
      <div>
        <h1>Gestion des utilisateurs</h1>
        <p class="page-sub">{{ filtered.length }} utilisateur(s) trouvé(s)</p>
      </div>
      <span class="badge badge-primary">{{ users.length }} total</span>
    </div>

    <!-- Filtres -->
    <div class="filters-bar card">
      <div class="filter-search">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          v-model="search" type="search" class="search-input"
          placeholder="Rechercher par nom ou email..."
          aria-label="Rechercher un utilisateur"
        />
      </div>
      <select v-model="filterCountry" class="form-select filter-select" aria-label="Filtrer par pays">
        <option value="">Tous les pays</option>
        <option v-for="c in countries" :key="c" :value="c">{{ c }}</option>
      </select>
      <select v-model="filterCity" class="form-select filter-select" aria-label="Filtrer par ville">
        <option value="">Toutes les villes</option>
        <option v-for="c in cities" :key="c" :value="c">{{ c }}</option>
      </select>
      <select v-model="filterRole" class="form-select filter-select" aria-label="Filtrer par rôle">
        <option value="">Tous les rôles</option>
        <option value="admin">Administrateur</option>
        <option value="user">Utilisateur</option>
      </select>
      <button v-if="hasActiveFilter" class="btn btn-ghost btn-sm" @click="resetFilters">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
        Réinitialiser
      </button>
    </div>

    <!-- Tableau -->
    <div class="card table-card">
      <div v-if="loading" class="table-loading">
        <div v-for="i in 5" :key="i" class="skeleton" style="height:52px;border-radius:8px;margin-bottom:8px"></div>
      </div>

      <div v-else-if="filtered.length === 0" class="empty-state" style="padding:48px">
        <div class="empty-state-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#185FA5" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <h3>Aucun utilisateur trouvé</h3>
        <p style="color:var(--color-text-secondary);font-size:14px">Modifiez vos filtres pour afficher des résultats.</p>
      </div>

      <div v-else class="table-wrapper">
        <table class="data-table" role="table">
          <thead>
            <tr>
              <th scope="col">Utilisateur</th>
              <th scope="col">Email</th>
              <th scope="col">Rôle</th>
              <th scope="col">Pays</th>
              <th scope="col">Adresses</th>
              <th scope="col">Inscription</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in paginated" :key="user.id">
              <td>
                <div class="user-cell">
                  <div class="mini-avatar" :style="{ background: avatarBg(user.name) }">
                    {{ initials(user.name) }}
                  </div>
                  <div>
                    <div class="user-name">{{ user.name || 'Inconnu' }}</div>
                    <div class="user-id">{{ user.id }}</div>
                  </div>
                </div>
              </td>
              <td class="email-cell">{{ user.email }}</td>
              <td>
                <span class="badge" :class="user.role === 'admin' ? 'badge-warning' : 'badge-primary'">
                  {{ user.role === 'admin' ? 'Admin' : 'Utilisateur' }}
                </span>
              </td>
              <td>{{ user.country || '—' }}</td>
              <td>
                <span class="addr-count">{{ user.addressCount ?? 0 }}</span>
              </td>
              <td class="date-cell">{{ formatDate(user.createdAt) }}</td>
              <td>
                <button class="btn btn-primary btn-xs" @click="openCompose(user)" :aria-label="`Envoyer un message à ${user.name}`">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                  Message
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button class="btn btn-ghost btn-sm" :disabled="page === 1" @click="page--">
          ← Précédent
        </button>
        <div class="page-pills">
          <button
            v-for="p in totalPages" :key="p"
            class="page-pill"
            :class="{ active: page === p }"
            @click="page = p"
          >{{ p }}</button>
        </div>
        <button class="btn btn-ghost btn-sm" :disabled="page === totalPages" @click="page++">
          Suivant →
        </button>
      </div>
    </div>
  </div>

  <!-- Modal : Composer un message -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="compose.open" class="modal-overlay" @click.self="compose.open = false" role="dialog" aria-modal="true" :aria-labelledby="'compose-title'">
        <div class="modal-box">
          <div class="modal-header">
            <h3 id="compose-title">Envoyer un message</h3>
            <button class="btn btn-ghost btn-icon" @click="compose.open = false" aria-label="Fermer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <div class="recipient-info">
              <div class="mini-avatar" :style="{ background: avatarBg(compose.user?.name || '') }">
                {{ initials(compose.user?.name || '?') }}
              </div>
              <div>
                <div style="font-size:14px;font-weight:600">{{ compose.user?.name }}</div>
                <div style="font-size:12px;color:var(--color-text-secondary)">{{ compose.user?.email }}</div>
              </div>
            </div>

            <div class="form-group" style="margin-top:16px">
              <label class="form-label" for="msg-subject">Sujet <span style="color:var(--color-error)">*</span></label>
              <input id="msg-subject" v-model="compose.subject" type="text" class="form-input"
                placeholder="Ex: Votre adresse a été vérifiée" maxlength="100" />
            </div>

            <div class="form-group">
              <label class="form-label" for="msg-body">Message <span style="color:var(--color-error)">*</span></label>
              <textarea id="msg-body" v-model="compose.body" class="form-input form-textarea"
                placeholder="Rédigez votre message ici..." rows="6" maxlength="1000"></textarea>
              <span class="form-hint">{{ compose.body.length }}/1000</span>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary btn-sm" @click="compose.open = false">Annuler</button>
            <button
              class="btn btn-primary btn-sm"
              @click="sendMessage"
              :disabled="compose.sending || !compose.subject.trim() || !compose.body.trim()"
            >
              <svg v-if="compose.sending" class="animate-spin" width="14" height="14" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
              {{ compose.sending ? 'Envoi...' : 'Envoyer' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useSeoMeta, useRuntimeConfig } from '#imports'

definePageMeta({ middleware: 'auth', layout: 'dashboard' })
useSeoMeta({ title: 'Utilisateurs — Admin findMe' })

const config = useRuntimeConfig()
const loading = ref(true)
const users = ref<any[]>([])
const search = ref('')
const filterCountry = ref('')
const filterCity = ref('')
const filterRole = ref('')
const page = ref(1)
const perPage = 10

onMounted(async () => {
  const tok = process.client ? localStorage.getItem('findme_token') : null
  try {
    const res = await $fetch<any>(`${config.public.apiBase}/admin/users?page=1&limit=50`, {
      headers: tok ? { Authorization: `Bearer ${tok}` } : {},
    })
    users.value = res?.data?.users || []
  } catch {
    users.value = []
  } finally {
    loading.value = false
  }
})

const countries = computed(() => [...new Set(users.value.map((u: any) => u.country).filter(Boolean))].sort())
const cities = computed(() => {
  const base = filterCountry.value
    ? users.value.filter((u: any) => u.country === filterCountry.value)
    : users.value
  return [...new Set(base.map((u: any) => u.city).filter(Boolean))].sort()
})

const hasActiveFilter = computed(() =>
  !!search.value || !!filterCountry.value || !!filterCity.value || !!filterRole.value
)

const resetFilters = () => {
  search.value = ''
  filterCountry.value = ''
  filterCity.value = ''
  filterRole.value = ''
  page.value = 1
}

const filtered = computed(() => {
  let list = users.value
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter((u: any) =>
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q)
    )
  }
  if (filterCountry.value) list = list.filter((u: any) => u.country === filterCountry.value)
  if (filterCity.value)    list = list.filter((u: any) => u.city    === filterCity.value)
  if (filterRole.value)    list = list.filter((u: any) => u.role    === filterRole.value)
  return list
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / perPage)))
const paginated  = computed(() => filtered.value.slice((page.value - 1) * perPage, page.value * perPage))

const initials = (name: string) =>
  (name || '?').split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()

const avatarBg = (name: string) => {
  const colors = ['#185FA5', '#0C6B3A', '#0C447C', '#854F0B']
  return colors[(name?.charCodeAt(0) || 0) % colors.length]
}

const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const compose = reactive({
  open: false,
  user: null as any,
  subject: '',
  body: '',
  sending: false,
})

const openCompose = (user: any) => {
  compose.user = user
  compose.subject = ''
  compose.body = ''
  compose.open = true
}

const sendMessage = async () => {
  if (!compose.subject.trim() || !compose.body.trim()) return
  compose.sending = true
  const tok = process.client ? localStorage.getItem('findme_token') : null
  try {
    await $fetch(`${config.public.apiBase}/admin/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(tok ? { Authorization: `Bearer ${tok}` } : {}),
      },
      body: {
        userId: compose.user?.id,
        subject: compose.subject,
        message: compose.body,
      },
    })
    compose.open = false
  } catch {
    // silently fail on mock — message is "sent"
    compose.open = false
  } finally {
    compose.sending = false
  }
}
</script>

<style scoped>
.admin-page { padding: 32px; max-width: 1200px; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 24px; }
.page-header h1 { font-size: 26px; margin-bottom: 4px; }
.page-sub { font-size: 13px; color: var(--color-text-secondary); }

.filters-bar {
  padding: 12px 16px;
  display: flex; align-items: center; gap: 10px;
  flex-wrap: wrap; margin-bottom: 20px;
}
.filter-search {
  display: flex; align-items: center; gap: 8px;
  flex: 1; min-width: 200px;
  color: var(--color-text-tertiary);
}
.search-input {
  flex: 1; border: none; background: none;
  font-size: 14px; color: var(--color-text-primary); outline: none;
}
.filter-select { width: 150px; padding: 8px 12px; font-size: 13px; }

.table-card { padding: 0; overflow: hidden; }
.table-loading { padding: 20px; }
.table-wrapper { overflow-x: auto; }

.data-table { width: 100%; border-collapse: collapse; }
.data-table th {
  padding: 12px 16px; text-align: left;
  font-size: 11px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.6px; color: var(--color-text-tertiary);
  border-bottom: 1px solid var(--color-border); white-space: nowrap;
  background: var(--color-bg-secondary);
}
.data-table td { padding: 14px 16px; font-size: 14px; border-bottom: 1px solid var(--color-border); }
.data-table tr:last-child td { border-bottom: none; }
.data-table tbody tr:hover td { background: var(--color-bg-secondary); }

.user-cell { display: flex; align-items: center; gap: 10px; }
.mini-avatar {
  width: 34px; height: 34px; border-radius: 50%;
  color: white; display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; font-family: var(--font-display); flex-shrink: 0;
}
.user-name { font-size: 14px; font-weight: 600; color: var(--color-text-primary); }
.user-id { font-size: 11px; color: var(--color-text-tertiary); }
.email-cell { color: var(--color-text-secondary); max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.date-cell { color: var(--color-text-secondary); white-space: nowrap; }
.addr-count {
  display: inline-flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border-radius: 50%;
  background: var(--color-primary-light); color: var(--color-primary);
  font-size: 12px; font-weight: 700;
}

.pagination {
  display: flex; align-items: center; justify-content: center;
  gap: 12px; padding: 16px; border-top: 1px solid var(--color-border);
  flex-wrap: wrap;
}
.page-pills { display: flex; gap: 4px; }
.page-pill {
  width: 32px; height: 32px; border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 600; cursor: pointer;
  border: 1.5px solid var(--color-border); background: none;
  color: var(--color-text-secondary); transition: all 150ms;
}
.page-pill.active {
  background: var(--color-primary); border-color: var(--color-primary);
  color: white;
}
.page-pill:hover:not(.active) { border-color: var(--color-primary); color: var(--color-primary); }

.btn-xs { padding: 5px 10px; font-size: 11px; font-weight: 600; gap: 4px; }

/* ── Modal ── */
.modal-overlay {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(0,0,0,0.45); backdrop-filter: blur(3px);
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.modal-box {
  background: var(--color-surface); border-radius: var(--radius-xl);
  width: 100%; max-width: 500px;
  box-shadow: var(--shadow-xl); overflow: hidden;
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px; border-bottom: 1px solid var(--color-border);
}
.modal-header h3 { font-size: 18px; font-weight: 700; }
.modal-body { padding: 20px 24px; }
.modal-footer {
  display: flex; justify-content: flex-end; gap: 10px;
  padding: 16px 24px; border-top: 1px solid var(--color-border);
  background: var(--color-bg-secondary);
}

.recipient-info {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px; background: var(--color-bg-secondary);
  border-radius: var(--radius-md); margin-bottom: 4px;
}

.form-textarea { resize: vertical; min-height: 120px; font-family: inherit; }

.fade-enter-active, .fade-leave-active { transition: opacity 200ms; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 768px) {
  .admin-page { padding: 16px; }
  .filters-bar { flex-direction: column; align-items: stretch; }
  .filter-select { width: 100%; }
}
</style>

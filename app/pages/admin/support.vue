<template>
  <div class="admin-page">
    <div class="page-header">
      <h1>{{ $t('admin.tickets_title') }}</h1>
      <div class="filter-tabs">
        <button class="tab-btn" :class="{ active: filterStatus === '' }" @click="filterStatus = ''">{{ $t('admin.ticket_all') }}</button>
        <button class="tab-btn" :class="{ active: filterStatus === 'open' }" @click="filterStatus = 'open'">{{ $t('admin.ticket_open_tab') }}</button>
        <button class="tab-btn" :class="{ active: filterStatus === 'resolved' }" @click="filterStatus = 'resolved'">{{ $t('admin.ticket_resolved_tab') }}</button>
      </div>
    </div>

    <div v-if="loading" class="tickets-list">
      <div v-for="i in 4" :key="i" class="skeleton" style="height:100px;border-radius:12px;margin-bottom:12px"></div>
    </div>

    <div v-else-if="filtered.length === 0" class="empty-state">
      <div class="empty-state-icon">📩</div>
      <p>{{ $t('admin.empty_tickets') }}</p>
    </div>

    <div v-else class="tickets-list">
      <div v-for="ticket in filtered" :key="ticket.id" class="ticket-card card">
        <div class="ticket-header">
          <div>
            <div class="ticket-name">{{ ticket.name || $t('admin.ticket_anonymous') }}</div>
            <div class="ticket-email">{{ ticket.email }}</div>
          </div>
          <div class="ticket-meta">
            <span class="badge"
              :class="ticket.status === 'resolved' ? 'badge-success' : 'badge-warning'">
              {{ ticket.status === 'resolved' ? $t('admin.ticket.resolved') : $t('admin.ticket.open') }}
            </span>
            <span class="ticket-date">{{ formatDate(ticket.createdAt) }}</span>
          </div>
        </div>
        <p class="ticket-message">{{ ticket.message }}</p>
        <div class="ticket-actions">
          <button
            v-if="ticket.status !== 'resolved'"
            class="btn btn-secondary btn-sm"
            @click="resolve(ticket.id)"
            :disabled="resolving === ticket.id"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            {{ resolving === ticket.id ? $t('admin.ticket_processing') : $t('admin.ticket.mark_resolved') }}
          </button>
          <span v-else class="resolved-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0C6B3A" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            {{ $t('admin.ticket.resolved') }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSeoMeta, useRuntimeConfig } from '#imports'
import { useI18n } from 'vue-i18n'
import { useToast } from '../../../composables/useToast'

definePageMeta({ middleware: 'auth', layout: 'dashboard' })
useSeoMeta({ title: 'Support — Admin findMe' })

const { t } = useI18n()
const config = useRuntimeConfig()
const { showToast } = useToast()
const loading = ref(true)
const tickets = ref<any[]>([])
const filterStatus = ref('')
const resolving = ref<string | null>(null)

onMounted(async () => {
  const tok = process.client ? localStorage.getItem('findme_token') : null
  try {
    // GET /admin/support → { success, data: { tickets: [...] } }
    const res = await $fetch<any>(`${config.public.apiBase}/admin/support?page=1&limit=50`, {
      headers: tok ? { Authorization: `Bearer ${tok}` } : {},
    })
    tickets.value = res?.data?.tickets || []
  } catch { tickets.value = [] }
  finally { loading.value = false }
})

const filtered = computed(() => filterStatus.value
  ? tickets.value.filter(t => t.status === filterStatus.value)
  : tickets.value
)

const resolve = async (id: string) => {
  const tok = process.client ? localStorage.getItem('findme_token') : null
  resolving.value = id
  try {
    // PATCH /admin/support/:id/status → { success, message, data: { id, status } }
    await $fetch(`${config.public.apiBase}/admin/support/${id}/status`, {
      method: 'PATCH',
      headers: tok ? { Authorization: `Bearer ${tok}` } : {},
      body: { status: 'resolved' },
    })
    const t = tickets.value.find(t => t.id === id)
    if (t) t.status = 'resolved'
    showToast(t('admin.ticket_mark_resolved_success'), 'success')
  } catch {
    showToast(t('errors.network'), 'error')
  } finally {
    resolving.value = null
  }
}

const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('fr-FR') : '—'
</script>

<style scoped>
.admin-page { padding: 32px; max-width: 900px; }
.page-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 24px; }
.page-header h1 { font-size: 26px; }
.filter-tabs { display: flex; gap: 6px; background: var(--color-bg-secondary); border-radius: var(--radius-full); padding: 4px; }
.tab-btn { padding: 7px 16px; border-radius: var(--radius-full); border: none; background: none; cursor: pointer; font-size: 13px; font-weight: 500; color: var(--color-text-secondary); transition: all 150ms; }
.tab-btn.active { background: white; color: var(--color-primary); box-shadow: 0 1px 4px rgba(0,0,0,0.1); }
.dark .tab-btn.active { background: var(--color-surface); }
.tickets-list { display: flex; flex-direction: column; gap: 12px; }
.ticket-card { padding: 18px 20px; }
.ticket-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
.ticket-name { font-size: 15px; font-weight: 600; color: var(--color-text-primary); }
.ticket-email { font-size: 13px; color: var(--color-text-secondary); }
.ticket-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; flex-shrink: 0; }
.ticket-date { font-size: 12px; color: var(--color-text-tertiary); }
.ticket-message { font-size: 14px; color: var(--color-text-secondary); line-height: 1.6; margin-bottom: 14px; background: var(--color-bg-secondary); padding: 12px; border-radius: var(--radius-md); }
.ticket-actions { display: flex; align-items: center; gap: 10px; }
.resolved-label { display: flex; align-items: center; gap: 5px; font-size: 13px; font-weight: 600; color: var(--color-accent); }
@media (max-width: 640px) { .admin-page { padding: 16px; } }
</style>
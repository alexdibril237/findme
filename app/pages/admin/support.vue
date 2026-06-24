<template>
  <div class="admin-page">
    <div class="page-header">
      <h1>Tickets support</h1>
      <div class="filter-tabs">
        <button class="tab-btn" :class="{ active: filterStatus === '' }" @click="filterStatus = ''">Tous</button>
        <button class="tab-btn" :class="{ active: filterStatus === 'open' }" @click="filterStatus = 'open'">Non traités</button>
        <button class="tab-btn" :class="{ active: filterStatus === 'resolved' }" @click="filterStatus = 'resolved'">Traités</button>
      </div>
    </div>

    <div v-if="filtered.length === 0" class="empty-state">
      <div class="empty-state-icon">📩</div>
      <p>Aucun ticket de support</p>
    </div>

    <div v-else class="tickets-list">
      <div v-for="ticket in filtered" :key="ticket.id" class="ticket-card card">
        <div class="ticket-header">
          <div>
            <div class="ticket-name">{{ ticket.fromName || 'Anonyme' }}</div>
            <div class="ticket-subject">{{ ticket.subject }}</div>
          </div>
          <div class="ticket-meta">
            <span class="badge" :class="ticket.read ? 'badge-success' : 'badge-warning'">
              {{ ticket.read ? 'Traité' : 'Non traité' }}
            </span>
            <span class="ticket-date">{{ formatDate(ticket.createdAt) }}</span>
          </div>
        </div>
        <p class="ticket-message">{{ ticket.body }}</p>
        <div class="ticket-actions">
          <button v-if="!ticket.read" class="btn btn-secondary btn-sm" @click="resolve(ticket.id)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Marquer traité
          </button>
          <button v-else class="btn btn-ghost btn-sm" @click="reopen(ticket.id)">
            Rouvrir
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSeoMeta } from '#imports'
import { useMessageStore } from '../../stores/messages'
import { useToast } from '../../composables/useToast'

definePageMeta({ middleware: 'auth', layout: 'dashboard' })
useSeoMeta({ title: 'Tickets support — Admin findMe' })

const msgStore = useMessageStore()
const { showToast } = useToast()
const filterStatus = ref('')

onMounted(() => {
  msgStore.fetchAdminInbox()
})

const tickets = computed(() => msgStore.adminInbox)

const filtered = computed(() => filterStatus.value === 'resolved'
  ? tickets.value.filter(t => t.read)
  : filterStatus.value === 'open'
    ? tickets.value.filter(t => !t.read)
    : tickets.value
)

const resolve = (id: string) => {
  msgStore.markAdminRead(id)
  const msg = msgStore.adminInbox.find(m => m.id === id)
  if (msg?.fromUserId) {
    msgStore.sendToUser(msg.fromUserId, `Votre demande a été traitée : ${msg.subject}`,
      `Bonjour,\n\nVotre demande "${msg.subject}" a été traitée par notre équipe.\n\nCordialement,\nL'équipe findMe`)
  }
  showToast('Ticket marqué comme traité', 'success')
}

const reopen = (id: string) => {
  msgStore.markAdminUnread(id)
  showToast('Ticket rouvert', 'error')
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
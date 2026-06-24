<template>
  <div class="messages-page">
    <div class="page-header">
      <div>
        <h1>{{ $t('messages_page.title') }}</h1>
        <p class="page-sub">
          <span v-if="msgStore.unreadCount > 0" class="unread-info">
            {{ msgStore.unreadCount }} {{ $t('messages_page.unread') }}(s)
          </span>
          <span v-else class="read-info">{{ $t('messages_page.inbox') }}</span>
        </p>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary btn-sm" @click="openCompose">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {{ $t('messages_page.compose_btn') }}
        </button>
        <span class="badge badge-primary">{{ msgStore.messages.length }} total</span>
      </div>
    </div>

    <!-- Skeleton -->
    <div v-if="msgStore.loading" class="messages-list">
      <div v-for="i in 3" :key="i" class="message-card card skeleton-card">
        <div class="skeleton" style="height:16px;width:60%;border-radius:6px;margin-bottom:8px"></div>
        <div class="skeleton" style="height:13px;width:90%;border-radius:6px;margin-bottom:6px"></div>
        <div class="skeleton" style="height:13px;width:40%;border-radius:6px"></div>
      </div>
    </div>

    <!-- Vide -->
    <div v-else-if="msgStore.messages.length === 0" class="empty-state card">
      <div class="empty-icon">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#185FA5" stroke-width="1.5">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
      </div>
      <h3>Aucun message</h3>
      <p>Vous n'avez pas encore reçu de messages de l'équipe findMe.</p>
    </div>

    <!-- Liste des messages -->
    <div v-else class="messages-list">
      <div
        v-for="msg in msgStore.messages"
        :key="msg.id"
        class="message-card card"
        :class="{ unread: !msg.read, selected: selected?.id === msg.id }"
        @click="openMessage(msg)"
        role="button"
        :aria-label="`Message : ${msg.subject}`"
        tabindex="0"
        @keydown.enter="openMessage(msg)"
      >
        <div class="msg-header">
          <div class="msg-from">
            <div class="from-avatar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <span class="from-name">{{ msg.fromName }}</span>
            <span class="from-role-badge">Admin</span>
          </div>
          <div class="msg-meta">
            <time class="msg-date">{{ formatDate(msg.createdAt) }}</time>
            <span v-if="!msg.read" class="unread-dot" aria-label="Non lu"></span>
          </div>
        </div>
        <div class="msg-subject" :class="{ bold: !msg.read }">{{ msg.subject }}</div>
        <p class="msg-preview">{{ preview(msg.body) }}</p>
      </div>
    </div>

    <!-- Panneau de lecture (modal slide-in) -->
    <Teleport to="body">
      <Transition name="slide-panel">
        <div v-if="selected" class="read-panel" role="dialog" :aria-label="selected.subject">
          <div class="read-panel-inner">
            <div class="read-panel-header">
              <button class="btn btn-ghost btn-icon" @click="selected = null" aria-label="Fermer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
              <span class="panel-title">Message</span>
            </div>

            <div class="read-panel-content">
              <h2 class="read-subject">{{ selected.subject }}</h2>
              <div class="read-meta">
                <div class="read-from">
                  <div class="from-avatar lg">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </div>
                  <div>
                    <div class="read-from-name">{{ selected.fromName }}</div>
                    <div class="read-from-role">Équipe findMe</div>
                  </div>
                </div>
                <time class="read-date">{{ formatDateLong(selected.createdAt) }}</time>
              </div>

              <div class="read-body">
                <p v-for="(line, i) in bodyLines(selected.body)" :key="i">
                  {{ line || ' ' }}
                </p>
              </div>
            </div>

            <div class="read-panel-footer">
              <NuxtLink to="/support" class="btn btn-secondary btn-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                Répondre via le support
              </NuxtLink>
            </div>
          </div>
        </div>
      </Transition>
      <Transition name="fade">
        <div v-if="selected" class="read-overlay" @click="selected = null" aria-hidden="true"></div>
      </Transition>

      <!-- ── Modal de composition ── -->
      <Transition name="fade">
        <div v-if="composing" class="compose-overlay" @click="composing = false" aria-hidden="true"></div>
      </Transition>
      <Transition name="compose-up">
        <div v-if="composing" class="compose-modal card" role="dialog" :aria-label="$t('messages_page.compose_title')">
          <div class="compose-header">
            <span class="compose-title">{{ $t('messages_page.compose_title') }}</span>
            <button class="btn btn-ghost btn-icon" @click="composing = false" :aria-label="$t('common.close')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="compose-body">
            <div class="form-group">
              <label class="form-label">{{ $t('messages_page.compose_subject') }}</label>
              <input
                v-model="composeForm.subject"
                type="text"
                class="form-input"
                :placeholder="$t('messages_page.compose_placeholder_subject')"
                maxlength="100"
              />
            </div>
            <div class="form-group">
              <label class="form-label">{{ $t('messages_page.compose_body') }}</label>
              <textarea
                v-model="composeForm.body"
                class="form-input compose-textarea"
                :placeholder="$t('messages_page.compose_placeholder_body')"
                rows="5"
                maxlength="2000"
              ></textarea>
            </div>
          </div>
          <div class="compose-footer">
            <button class="btn btn-ghost btn-sm" @click="composing = false">{{ $t('common.cancel') }}</button>
            <button
              class="btn btn-primary btn-sm"
              :disabled="!composeForm.subject.trim() || !composeForm.body.trim() || composeForm.sending"
              @click="submitCompose"
            >
              <svg v-if="composeForm.sending" class="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              {{ $t('messages_page.compose_send') }}
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useSeoMeta } from '#imports'
import { useI18n } from 'vue-i18n'
import { useMessageStore } from '../../stores/messages'
import { useToast } from '../../composables/useToast'
import type { Message } from '../../stores/messages'

definePageMeta({ middleware: 'auth', layout: 'dashboard' })
useSeoMeta({ title: 'Messages — findMe' })

const { t } = useI18n()
const msgStore = useMessageStore()
const { showToast } = useToast()
const selected  = ref<Message | null>(null)
const composing = ref(false)
const composeForm = reactive({ subject: '', body: '', sending: false })

onMounted(() => {
  msgStore.fetchMessages()
})

const openMessage = (msg: Message) => {
  selected.value = msg
  msgStore.markRead(msg.id)
}

const openCompose = () => {
  composeForm.subject = ''
  composeForm.body    = ''
  composing.value = true
}

const submitCompose = () => {
  if (!composeForm.subject.trim() || !composeForm.body.trim()) return
  composeForm.sending = true
  const ok = msgStore.sendToAdmin(composeForm.subject.trim(), composeForm.body.trim())
  composeForm.sending = false
  composing.value = false
  if (ok) showToast(t('messages_page.compose_success'), 'success')
}

const preview = (body: string) => {
  const first = body.split('\n').find(l => l.trim()) || ''
  return first.length > 90 ? first.slice(0, 90) + '…' : first
}

const bodyLines = (body: string) => body.split('\n')

const formatDate = (d: string) => {
  const date = new Date(d)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  if (diff < 60 * 60 * 1000)  return `Il y a ${Math.floor(diff / 60000)} min`
  if (diff < 24 * 60 * 60 * 1000) return `Il y a ${Math.floor(diff / 3600000)} h`
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

const formatDateLong = (d: string) =>
  new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
</script>

<style scoped>
.messages-page { padding: 32px; max-width: 800px; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 24px; }
.page-header h1 { font-size: 26px; margin-bottom: 4px; }
.page-sub { font-size: 13px; }
.unread-info { color: var(--color-primary); font-weight: 600; }
.read-info { color: var(--color-text-secondary); }

.messages-list { display: flex; flex-direction: column; gap: 10px; }

.message-card {
  padding: 16px 20px; cursor: pointer;
  transition: all 150ms; border: 1.5px solid var(--color-border);
  border-radius: var(--radius-lg);
}
.message-card:hover { border-color: var(--color-primary); transform: translateY(-1px); box-shadow: var(--shadow-md); }
.message-card.unread { border-left: 3px solid var(--color-primary); background: var(--color-primary-light); }
.message-card.selected { border-color: var(--color-primary); }
.skeleton-card { cursor: default; }
.skeleton-card:hover { transform: none; box-shadow: none; }

.msg-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; gap: 8px; }
.msg-from { display: flex; align-items: center; gap: 8px; }
.from-avatar {
  width: 28px; height: 28px; border-radius: 50%;
  background: var(--color-primary); color: white;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.from-avatar.lg { width: 40px; height: 40px; }
.from-name { font-size: 13px; font-weight: 600; color: var(--color-text-primary); }
.from-role-badge {
  font-size: 10px; font-weight: 700; padding: 2px 7px;
  background: rgba(133,79,11,0.12); color: #854F0B;
  border-radius: var(--radius-full);
}
.msg-meta { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.msg-date { font-size: 11px; color: var(--color-text-tertiary); }
.unread-dot {
  width: 8px; height: 8px; border-radius: 50%; background: var(--color-primary); flex-shrink: 0;
}

.msg-subject { font-size: 14px; color: var(--color-text-primary); margin-bottom: 5px; }
.msg-subject.bold { font-weight: 700; }
.msg-preview { font-size: 13px; color: var(--color-text-secondary); line-height: 1.5; }

.empty-state {
  padding: 60px 32px; text-align: center;
  display: flex; flex-direction: column; align-items: center; gap: 12px;
}
.empty-icon {
  width: 64px; height: 64px; border-radius: 50%;
  background: var(--color-primary-light);
  display: flex; align-items: center; justify-content: center;
}
.empty-state h3 { font-size: 18px; color: var(--color-text-primary); }
.empty-state p  { font-size: 14px; color: var(--color-text-secondary); max-width: 320px; }

/* ── Read panel ── */
.read-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.4);
  z-index: 100; backdrop-filter: blur(2px);
}
.read-panel {
  position: fixed; top: 0; right: 0; bottom: 0; width: min(480px, 100vw);
  background: var(--color-surface); z-index: 101;
  display: flex; flex-direction: column;
  box-shadow: -4px 0 32px rgba(0,0,0,0.15);
}
.read-panel-inner { display: flex; flex-direction: column; height: 100%; }
.read-panel-header {
  display: flex; align-items: center; gap: 12px;
  padding: 16px 20px; border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}
.panel-title { font-size: 16px; font-weight: 700; color: var(--color-text-primary); }
.read-panel-content { flex: 1; overflow-y: auto; padding: 24px 24px; }
.read-subject { font-size: 20px; font-weight: 700; margin-bottom: 16px; line-height: 1.3; }
.read-meta {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 12px; margin-bottom: 24px; padding-bottom: 16px;
  border-bottom: 1px solid var(--color-border);
}
.read-from { display: flex; gap: 12px; align-items: center; }
.read-from-name { font-size: 14px; font-weight: 600; }
.read-from-role { font-size: 12px; color: var(--color-text-secondary); }
.read-date { font-size: 12px; color: var(--color-text-tertiary); white-space: nowrap; }
.read-body { font-size: 14px; line-height: 1.75; color: var(--color-text-primary); }
.read-body p { margin-bottom: 4px; }
.read-panel-footer {
  padding: 16px 24px; border-top: 1px solid var(--color-border);
  flex-shrink: 0;
}

/* Transitions */
.slide-panel-enter-active,
.slide-panel-leave-active { transition: transform 250ms cubic-bezier(.4, 0, .2, 1); }
.slide-panel-enter-from,
.slide-panel-leave-to { transform: translateX(100%); }

.fade-enter-active, .fade-leave-active { transition: opacity 200ms; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.header-actions { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

/* ── Compose modal ── */
.compose-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.4); z-index: 200;
  backdrop-filter: blur(2px);
}
.compose-modal {
  position: fixed; left: 50%; top: 50%;
  transform: translate(-50%, -50%);
  width: min(520px, calc(100vw - 32px));
  z-index: 201; padding: 0; overflow: hidden;
  box-shadow: var(--shadow-xl);
}
.compose-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px; border-bottom: 1px solid var(--color-border);
}
.compose-title { font-size: 15px; font-weight: 700; color: var(--color-text-primary); }
.compose-body { padding: 20px; display: flex; flex-direction: column; gap: 14px; }
.compose-textarea { resize: vertical; min-height: 120px; }
.compose-footer {
  display: flex; justify-content: flex-end; gap: 8px;
  padding: 14px 20px; border-top: 1px solid var(--color-border);
}

.compose-up-enter-active, .compose-up-leave-active { transition: all 220ms cubic-bezier(.4,0,.2,1); }
.compose-up-enter-from, .compose-up-leave-to { opacity: 0; transform: translate(-50%, -48%) scale(.96); }

@media (max-width: 640px) {
  .messages-page { padding: 16px; }
  .page-header { flex-direction: column; align-items: flex-start; gap: 12px; }
  .header-actions { width: 100%; justify-content: space-between; }
  .read-meta { flex-direction: column; }
}
</style>

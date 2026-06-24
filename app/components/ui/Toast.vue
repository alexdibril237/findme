<template>
  <Teleport to="body">
    <div class="toast-container" role="region" aria-label="Notifications" aria-live="polite">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast"
          :class="`toast--${toast.type}`"
          role="alert"
        >
          <span class="toast-icon" aria-hidden="true">
            <svg v-if="toast.type === 'success'" width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <svg v-else-if="toast.type === 'error'" width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <svg v-else-if="toast.type === 'warning'" width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          </span>
          <span class="toast-message">{{ toast.message }}</span>
          <button
            class="toast-close"
            @click="removeToast(toast.id)"
            aria-label="Fermer la notification"
          >
            <svg width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToast } from '../../composables/useToast'
const { toasts, removeToast } = useToast()
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 24px; right: 24px;
  z-index: 9999;
  display: flex; flex-direction: column;
  gap: 10px; align-items: flex-end;
  pointer-events: none;
  max-width: 420px;
}

.toast {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  min-width: 280px; max-width: 420px;
  font-size: 14px; font-weight: 500;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  pointer-events: all;
  border-left: 3px solid currentColor;
  line-height: 1.4;
}

.toast--success { background: #ECFDF5; color: #0C6B3A; }
.toast--error   { background: #FEF2F2; color: #BA1A1A; }
.toast--info    { background: #EFF6FF; color: #185FA5; }
.toast--warning { background: #FFFBEB; color: #854F0B; }

.toast-icon { flex-shrink: 0; margin-top: 1px; }
.toast-message { flex: 1; }
.toast-close {
  flex-shrink: 0; padding: 2px; cursor: pointer;
  opacity: 0.6; transition: opacity 150ms;
  background: none; border: none; color: inherit;
  line-height: 0;
}
.toast-close:hover { opacity: 1; }

.toast-enter-active { animation: toastIn 300ms cubic-bezier(0.34, 1.56, 0.64, 1); }
.toast-leave-active { animation: toastOut 250ms ease forwards; }
.toast-move { transition: transform 300ms ease; }

@keyframes toastIn {
  from { transform: translateX(100%); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
}
@keyframes toastOut {
  from { transform: translateX(0);    opacity: 1; max-height: 100px; }
  to   { transform: translateX(110%); opacity: 0; max-height: 0;    }
}

@media (max-width: 480px) {
  .toast-container { left: 12px; right: 12px; bottom: 12px; }
  .toast { min-width: unset; width: 100%; }
}
</style>

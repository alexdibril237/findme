<template>
  <span class="status-badge" :class="`status-badge--${status}`">
    <span class="status-dot" aria-hidden="true"></span>
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{ status: 'verified' | 'pending' | 'draft' }>()
const { t } = useI18n()

const label = computed(() => t(`address.status.${props.status}`))
</script>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.status-badge--verified {
  background: var(--color-success-light);
  color: var(--color-success);
}
.status-badge--pending {
  background: var(--color-warning-light);
  color: var(--color-warning);
}
.status-badge--draft {
  background: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
}
</style>

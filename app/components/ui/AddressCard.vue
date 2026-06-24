<template>
  <div class="address-card card card-hover">
    <!-- Photo -->
    <div class="addr-photo">
      <img v-if="address.photo" :src="address.photo" :alt="`Photo — ${address.label}`" loading="lazy"/>
      <div v-else class="addr-photo-placeholder" aria-label="Aucune photo">
        <IconLocation :size="28" style="color: var(--color-text-tertiary)"/>
      </div>
    </div>

    <!-- Contenu -->
    <div class="addr-body">
      <div class="addr-top">
        <h3 class="addr-label">{{ address.label }}</h3>
        <StatusBadge :status="address.status" />
      </div>
      <p class="addr-street">{{ address.street }}, {{ address.neighborhood }}</p>
      <p class="addr-city">{{ address.city }}, {{ address.country }}</p>
      <div class="addr-code">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#185FA5" stroke-width="2" aria-hidden="true">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        {{ address.addressCode }}
      </div>
    </div>

    <!-- Actions -->
    <div class="addr-actions">
      <slot name="actions">
        <NuxtLink :to="`/address/edit/${address.id}`" class="btn btn-secondary btn-sm">
          <IconForm :size="14" />
          {{ t('address.edit') }}
        </NuxtLink>
        <button class="btn btn-ghost btn-sm" @click="$emit('pdf', address)">
          <IconPdf :size="14" />
          PDF
        </button>
        <button class="btn btn-danger btn-sm" @click="$emit('delete', address)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14H6L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/>
            <path d="M9 6V4h6v2"/>
          </svg>
          {{ t('address.delete') }}
        </button>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import StatusBadge from './StatusBadge.vue'
import IconLocation from '../IconLocation.vue'
import IconForm from '../IconForm.vue'
import IconPdf from '../IconPdf.vue'

const { t } = useI18n()

defineProps<{
  address: {
    id: string
    label: string
    status: 'verified' | 'pending' | 'draft'
    photo?: string
    street: string
    neighborhood: string
    city: string
    country: string
    addressCode: string
  }
}>()

defineEmits<{
  pdf: [address: any]
  delete: [address: any]
}>()
</script>

<style scoped>
.address-card { padding: 0; overflow: hidden; }

.addr-photo {
  height: 160px;
  overflow: hidden;
  background: var(--color-bg-tertiary);
}
.addr-photo img { width: 100%; height: 100%; object-fit: cover; }
.addr-photo-placeholder {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
}

.addr-body { padding: 16px 16px 12px; }
.addr-top {
  display: flex; align-items: flex-start;
  justify-content: space-between; gap: 8px; margin-bottom: 8px;
}
.addr-label { font-size: 16px; font-weight: 700; flex: 1; line-height: 1.3; }
.addr-street { font-size: 13px; color: var(--color-text-secondary); margin-bottom: 2px; }
.addr-city { font-size: 12px; color: var(--color-text-tertiary); margin-bottom: 10px; }
.addr-code {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 12px; font-weight: 700;
  color: var(--color-primary);
  font-family: var(--font-display);
}

.addr-actions {
  padding: 12px 16px;
  border-top: 1px solid var(--color-border);
  display: flex; gap: 6px; flex-wrap: wrap;
}
</style>

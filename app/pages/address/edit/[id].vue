<template>
  <div class="edit-page">
    <div class="page-header">
      <NuxtLink to="/dashboard" class="btn btn-ghost btn-sm">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        {{ $t('common.back') }}
      </NuxtLink>
      <h1>{{ $t('address.edit') }}</h1>
    </div>

    <div v-if="loading" class="card" style="padding:48px;text-align:center">
      <div class="skeleton" style="height:24px;width:200px;margin:0 auto 12px"></div>
      <div class="skeleton" style="height:16px;width:300px;margin:0 auto"></div>
    </div>

    <div v-else-if="address" class="card edit-form">
      <form @submit.prevent="handleSubmit" novalidate>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">{{ $t('address.fields.label') }} <span class="required">*</span></label>
            <input v-model="form.label" type="text" class="form-input"
              :class="{ error: errors.label }"
              @blur="errors.label = !form.label ? $t('validation.required') : ''" required/>
            <p v-if="errors.label" class="form-error">{{ errors.label }}</p>
          </div>
          <div class="form-group">
            <label class="form-label">{{ $t('address.fields.country') }} <span class="required">*</span></label>
            <input v-model="form.country" type="text" class="form-input"
              :class="{ error: errors.country }"
              @blur="errors.country = !form.country ? $t('validation.required') : ''" required/>
            <p v-if="errors.country" class="form-error">{{ errors.country }}</p>
          </div>
          <div class="form-group">
            <label class="form-label">{{ $t('address.fields.city') }} <span class="required">*</span></label>
            <input v-model="form.city" type="text" class="form-input"
              :class="{ error: errors.city }"
              @blur="errors.city = !form.city ? $t('validation.required') : ''" required/>
            <p v-if="errors.city" class="form-error">{{ errors.city }}</p>
          </div>
          <div class="form-group">
            <label class="form-label">{{ $t('address.fields.neighborhood') }} <span class="required">*</span></label>
            <input v-model="form.neighborhood" type="text" class="form-input"
              :class="{ error: errors.neighborhood }"
              @blur="errors.neighborhood = !form.neighborhood ? $t('validation.required') : ''" required/>
            <p v-if="errors.neighborhood" class="form-error">{{ errors.neighborhood }}</p>
          </div>
          <div class="form-group">
            <label class="form-label">{{ $t('address.fields.street') }} <span class="required">*</span></label>
            <input v-model="form.street" type="text" class="form-input"
              :class="{ error: errors.street }"
              @blur="errors.street = !form.street ? $t('validation.required') : ''" required/>
            <p v-if="errors.street" class="form-error">{{ errors.street }}</p>
          </div>
          <div class="form-group">
            <label class="form-label">{{ $t('address.fields.house_number') }}</label>
            <input v-model="form.houseNumber" type="text" class="form-input"/>
          </div>
        </div>

        <div class="form-group gps-section">
          <label class="form-label">{{ $t('address.fields.gps') }}</label>

          <!-- Recherche Nominatim -->
          <div class="search-box">
            <div class="search-input-wrap">
              <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                class="form-input search-input"
                :placeholder="$t('address.search_placeholder')"
                @input="onSearchInput"
                @keydown.escape="suggestions = []"
                autocomplete="off"
              />
              <svg v-if="searching" class="animate-spin search-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
            </div>
            <ul v-if="suggestions.length" class="suggestions-list" role="listbox">
              <li v-for="s in suggestions" :key="s.place_id" class="suggestion-item" @click="selectSuggestion(s)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#185FA5" stroke-width="2" class="sugg-icon">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <span>{{ s.display_name }}</span>
              </li>
            </ul>
          </div>

          <ClientOnly>
            <LeafletMap
              ref="leafletMapRef"
              :latitude="form.gps.latitude"
              :longitude="form.gps.longitude"
              height="300px"
              :zoom="17"
              :interactive="true"
              @position-change="pos => { form.gps.latitude = pos.lat; form.gps.longitude = pos.lng }"
            />
            <template #fallback>
              <div class="map-fallback">{{ $t('common.loading') }}</div>
            </template>
          </ClientOnly>

          <div class="gps-footer">
            <code class="coords-val">{{ form.gps.latitude.toFixed(6) }}°, {{ form.gps.longitude.toFixed(6) }}°</code>
            <button type="button" class="btn btn-outline btn-sm" @click="detectGPS" :disabled="gpsDetecting">
              <svg v-if="gpsDetecting" class="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
              </svg>
              {{ gpsDetecting ? $t('address.gps_detecting') : $t('address.gps_manual') }}
            </button>
          </div>
        </div>

        <div class="form-actions">
          <NuxtLink to="/dashboard" class="btn btn-secondary">{{ $t('common.cancel') }}</NuxtLink>
          <button type="submit" class="btn btn-primary" :disabled="addressStore.loading">
            <svg v-if="addressStore.loading" class="animate-spin" width="16" height="16"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            {{ addressStore.loading ? $t('common.loading') : $t('common.save') }}
          </button>
        </div>
      </form>
    </div>

    <div v-else class="card" style="padding:48px;text-align:center;color:var(--color-text-secondary)">
      {{ $t('errors.not_found') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useSeoMeta, navigateTo } from '#imports'
import { useI18n } from 'vue-i18n'
import { useAddressStore } from '../../../stores/address'
import LeafletMap from '../../../components/map/LeafletMap.vue'

definePageMeta({ middleware: 'auth', layout: 'dashboard' })
useSeoMeta({ title: 'Modifier adresse — findMe' })

const { t, locale } = useI18n()
const route = useRoute()
const addressStore = useAddressStore()

const loading = ref(true)
const address = ref<any>(null)
const gpsDetecting = ref(false)
const leafletMapRef = ref<any>(null)

// ── Recherche Nominatim ──────────────────────────────────────
const searchQuery = ref('')
const suggestions = ref<any[]>([])
const searching = ref(false)
let searchTimer: ReturnType<typeof setTimeout>

const nominatimSearch = async (query: string) => {
  if (!query || query.length < 3) { suggestions.value = []; return }
  searching.value = true
  try {
    const results = await $fetch<any[]>('https://nominatim.openstreetmap.org/search', {
      params: { q: query, format: 'json', addressdetails: '1', limit: '6' },
      headers: { 'Accept-Language': `${locale.value},fr,en`, 'User-Agent': 'findMe-App/1.0' },
    })
    suggestions.value = results || []
  } catch { suggestions.value = [] }
  finally { searching.value = false }
}

const onSearchInput = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => nominatimSearch(searchQuery.value), 400)
}

const selectSuggestion = (s: any) => {
  const lat = parseFloat(s.lat)
  const lng = parseFloat(s.lon)
  form.gps.latitude = lat
  form.gps.longitude = lng
  suggestions.value = []
  searchQuery.value = s.display_name
  const a = s.address || {}
  if (a.road || a.pedestrian) form.street = a.road || a.pedestrian || form.street
  if (a.suburb || a.neighbourhood || a.quarter) form.neighborhood = a.suburb || a.neighbourhood || a.quarter || form.neighborhood
  if (a.city || a.town) form.city = a.city || a.town || form.city
  if (a.country) form.country = a.country
  nextTick(() => { leafletMapRef.value?.flyToPosition(lat, lng, 18) })
}

const form = reactive({
  label: '', country: '', city: '', neighborhood: '',
  street: '', houseNumber: '', postalCode: '',
  gps: { latitude: 4.0511, longitude: 9.7679 },
})

const errors = reactive({
  label: '', country: '', city: '', neighborhood: '', street: '',
})

onMounted(async () => {
  try {
    const data = await addressStore.fetchAddress(route.params.id as string)
    address.value = data
    Object.assign(form, {
      label: data.label,
      country: data.country,
      city: data.city,
      neighborhood: data.neighborhood,
      street: data.street,
      houseNumber: data.houseNumber || '',
      postalCode: data.postalCode || '',
      gps: { latitude: data.gps?.latitude ?? 4.0511, longitude: data.gps?.longitude ?? 9.7679 },
    })
  } finally {
    loading.value = false
  }
})

const detectGPS = () => {
  if (!navigator.geolocation) return
  gpsDetecting.value = true
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      form.gps.latitude = pos.coords.latitude
      form.gps.longitude = pos.coords.longitude
      gpsDetecting.value = false
    },
    () => { gpsDetecting.value = false }
  )
}

const validate = () => {
  const req = t('validation.required')
  errors.label = !form.label ? req : ''
  errors.country = !form.country ? req : ''
  errors.city = !form.city ? req : ''
  errors.neighborhood = !form.neighborhood ? req : ''
  errors.street = !form.street ? req : ''
  return !Object.values(errors).some(e => e)
}

const handleSubmit = async () => {
  if (!validate()) return
  try {
    await addressStore.updateAddress(route.params.id as string, { ...form })
    await navigateTo('/dashboard')
  } catch { /* toast affiché par le store */ }
}
</script>

<style scoped>
.edit-page { padding: 32px; max-width: 800px; }
.page-header { display: flex; align-items: center; gap: 20px; margin-bottom: 32px; }
.page-header h1 { font-size: 24px; }
.edit-form { padding: 28px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 20px; }
.gps-section { margin-top: 12px; }
.map-fallback { height: 300px; display: flex; align-items: center; justify-content: center; background: var(--color-bg-secondary); border-radius: var(--radius-lg); color: var(--color-text-secondary); }

.search-box { position: relative; margin-bottom: 12px; }
.search-input-wrap { position: relative; display: flex; align-items: center; }
.search-icon { position: absolute; left: 12px; color: var(--color-text-tertiary); pointer-events: none; flex-shrink: 0; }
.search-input { padding-left: 38px !important; padding-right: 36px !important; }
.search-spin { position: absolute; right: 12px; color: var(--color-primary); }
.suggestions-list {
  position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 200;
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: var(--radius-lg); box-shadow: var(--shadow-lg);
  max-height: 240px; overflow-y: auto; list-style: none; padding: 4px 0; margin: 0;
}
.suggestion-item {
  display: flex; align-items: flex-start; gap: 10px; padding: 10px 14px; cursor: pointer;
  font-size: 13px; color: var(--color-text-primary); transition: background var(--transition-fast);
}
.suggestion-item:hover { background: var(--color-bg-secondary); }
.sugg-icon { flex-shrink: 0; margin-top: 2px; }
.gps-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 10px; gap: 12px; flex-wrap: wrap; }
.coords-val { font-family: var(--font-display); font-size: 12px; background: var(--color-bg-secondary); padding: 4px 10px; border-radius: var(--radius-md); color: var(--color-primary); }
.form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; }
.required { color: var(--color-error); }
@media (max-width: 640px) {
  .edit-page { padding: 16px; }
  .form-grid { grid-template-columns: 1fr; }
  .gps-controls { flex-direction: column; align-items: stretch; }
  .gps-coords { flex-direction: column; }
}
</style>

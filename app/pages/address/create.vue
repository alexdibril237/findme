<template>
  <div class="create-page">
    <div class="page-header">
      <NuxtLink to="/dashboard" class="btn btn-ghost btn-sm">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        {{ $t('common.back') }}
      </NuxtLink>
      <div>
        <h1>{{ $t('address.create') }}</h1>
        <p class="page-sub">{{ $t('common.page') }} {{ currentStep }} {{ $t('common.of') }} 4</p>
      </div>
    </div>

    <!-- Stepper -->
    <div class="stepper" role="list">
      <div v-for="(step, i) in steps" :key="i" class="stepper-item" role="listitem">
        <div class="stepper-circle"
          :class="{ active: currentStep === i + 1, done: currentStep > i + 1 }">
          <svg v-if="currentStep > i + 1" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span v-else>{{ i + 1 }}</span>
        </div>
        <div v-if="i < steps.length - 1" class="stepper-line" :class="{ done: currentStep > i + 1 }"></div>
        <span class="stepper-label" :class="{ active: currentStep === i + 1, done: currentStep > i + 1 }">
          {{ step }}
        </span>
      </div>
    </div>

    <!-- Étape 1 : Localisation -->
    <div v-if="currentStep === 1" class="step-content card">
      <h2>{{ $t('address.steps.step1') }}</h2>
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">{{ $t('address.fields.country') }} <span class="required">*</span></label>
          <input v-model="form.country" type="text" class="form-input" :class="{ error: errors.country }"
            placeholder="Ex: Cameroun" @blur="errors.country = !form.country ? $t('validation.required') : ''"/>
          <p v-if="errors.country" class="form-error" role="alert">{{ errors.country }}</p>
        </div>
        <div class="form-group">
          <label class="form-label">{{ $t('address.fields.city') }} <span class="required">*</span></label>
          <input v-model="form.city" type="text" class="form-input" :class="{ error: errors.city }"
            placeholder="Ex: Douala" @blur="errors.city = !form.city ? $t('validation.required') : ''"/>
          <p v-if="errors.city" class="form-error" role="alert">{{ errors.city }}</p>
        </div>
        <div class="form-group">
          <label class="form-label">{{ $t('address.fields.neighborhood') }} <span class="required">*</span></label>
          <input v-model="form.neighborhood" type="text" class="form-input"
            :class="{ error: errors.neighborhood }" placeholder="Ex: Akwa, Bonapriso..."
            @blur="errors.neighborhood = !form.neighborhood ? $t('validation.required') : ''"/>
          <p v-if="errors.neighborhood" class="form-error" role="alert">{{ errors.neighborhood }}</p>
        </div>
        <div class="form-group">
          <label class="form-label">{{ $t('address.fields.street') }} <span class="required">*</span></label>
          <input v-model="form.street" type="text" class="form-input" :class="{ error: errors.street }"
            placeholder="Ex: Rue Alfred Saker"
            @blur="errors.street = !form.street ? $t('validation.required') : ''"/>
          <p v-if="errors.street" class="form-error" role="alert">{{ errors.street }}</p>
        </div>
        <div class="form-group">
          <label class="form-label">{{ $t('address.fields.house_number') }} <span class="required">*</span></label>
          <input v-model="form.houseNumber" type="text" class="form-input" placeholder="Ex: 142"/>
        </div>
        <div class="form-group">
          <label class="form-label">{{ $t('address.fields.postal_code') }}</label>
          <input v-model="form.postalCode" type="text" class="form-input" placeholder="Ex: BP 1234"/>
        </div>
      </div>
      <div class="form-group" style="margin-top:8px">
        <label class="form-label">{{ $t('address.fields.label') }} <span class="required">*</span></label>
        <input v-model="form.label" type="text" class="form-input" :class="{ error: errors.label }"
          placeholder="Ex: Résidence Akwa, Bureau Bonanjo..."
          @blur="errors.label = !form.label ? $t('validation.required') : ''"/>
        <p v-if="errors.label" class="form-error" role="alert">{{ errors.label }}</p>
      </div>
    </div>

    <!-- Étape 2 : Localisation GPS -->
    <div v-if="currentStep === 2" class="step-content card">
      <h2>{{ $t('address.fields.gps') }}</h2>

      <!-- Barre de recherche Nominatim -->
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

        <!-- Suggestions -->
        <ul v-if="suggestions.length" class="suggestions-list" role="listbox">
          <li
            v-for="s in suggestions"
            :key="s.place_id"
            class="suggestion-item"
            role="option"
            @click="selectSuggestion(s)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#185FA5" stroke-width="2" class="sugg-icon">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <span>{{ s.display_name }}</span>
          </li>
        </ul>
      </div>

      <!-- Carte Leaflet -->
      <ClientOnly>
        <LeafletMap
          ref="leafletMapRef"
          :latitude="form.gps.latitude"
          :longitude="form.gps.longitude"
          height="380px"
          :zoom="17"
          :interactive="true"
          @position-change="onPositionChange"
        />
        <template #fallback>
          <div class="map-fallback">{{ $t('common.loading') }}</div>
        </template>
      </ClientOnly>

      <!-- Contrôles bas -->
      <div class="gps-footer">
        <div class="gps-coords-row">
          <span class="coords-label">GPS :</span>
          <code class="coords-val">{{ form.gps.latitude.toFixed(6) }}°, {{ form.gps.longitude.toFixed(6) }}°</code>
        </div>
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
      <p class="step-hint" style="margin-top:8px">{{ $t('address.gps_hint') }}</p>
    </div>

    <!-- Étape 3 : Photo -->
    <div v-if="currentStep === 3" class="step-content card">
      <h2>{{ $t('address.fields.photo') }}</h2>
      <p class="step-hint">{{ $t('address.photo_hint') }}</p>
      <div
        class="photo-drop"
        :class="{ 'photo-drop-hover': isDragging, 'has-photo': form.photoPreview }"
        @dragover.prevent="isDragging = true"
        @dragleave="isDragging = false"
        @drop.prevent="handleDrop"
        @click="fileInput?.click()"
        role="button"
        tabindex="0"
        :aria-label="$t('address.fields.photo')"
      >
        <img v-if="form.photoPreview" :src="form.photoPreview" alt="Aperçu" class="photo-preview"/>
        <div v-else class="photo-placeholder">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#185FA5" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          <p>{{ $t('address.photo_upload') }}</p>
          <small>{{ $t('address.photo_hint') }}</small>
        </div>
      </div>
      <input ref="fileInput" type="file" accept="image/*" class="sr-only" @change="handleFile"/>
      <div v-if="form.photoPreview" style="margin-top:12px">
        <button class="btn btn-ghost btn-sm" @click="form.photoPreview = ''; form.photo = ''">
          {{ $t('common.delete') }}
        </button>
      </div>
    </div>

    <!-- Étape 4 : Confirmation -->
    <div v-if="currentStep === 4" class="step-content card">
      <h2>{{ $t('address.steps.step4') }}</h2>
      <div class="recap-grid">
        <div class="recap-item"><span class="recap-label">{{ $t('address.fields.label') }}</span><strong>{{ form.label }}</strong></div>
        <div class="recap-item"><span class="recap-label">{{ $t('address.fields.country') }}</span><strong>{{ form.country }}</strong></div>
        <div class="recap-item"><span class="recap-label">{{ $t('address.fields.city') }}</span><strong>{{ form.city }}</strong></div>
        <div class="recap-item"><span class="recap-label">{{ $t('address.fields.neighborhood') }}</span><strong>{{ form.neighborhood }}</strong></div>
        <div class="recap-item"><span class="recap-label">{{ $t('address.fields.street') }}</span><strong>{{ form.street }}</strong></div>
        <div class="recap-item"><span class="recap-label">{{ $t('address.fields.house_number') }}</span><strong>{{ form.houseNumber }}</strong></div>
        <div class="recap-item">
          <span class="recap-label">{{ $t('address.fields.gps') }}</span>
          <strong>{{ form.gps.latitude.toFixed(5) }}° N, {{ form.gps.longitude.toFixed(5) }}° E</strong>
        </div>
      </div>
      <div v-if="form.photoPreview" class="recap-photo">
        <img :src="form.photoPreview" alt="Photo du bâtiment" loading="lazy"/>
      </div>
    </div>

    <!-- Navigation entre étapes -->
    <div class="step-nav">
      <button v-if="currentStep > 1" class="btn btn-secondary" @click="currentStep--">
        ← {{ $t('common.previous') }}
      </button>
      <span></span>
      <button v-if="currentStep < 4" class="btn btn-primary" @click="nextStep">
        {{ $t('common.next') }} →
      </button>
      <button v-else class="btn btn-primary" @click="handleSubmit" :disabled="addressStore.loading">
        <svg v-if="addressStore.loading" class="animate-spin" width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
        {{ addressStore.loading ? $t('common.loading') : $t('address.create') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSeoMeta, navigateTo } from '#imports'
import { useAuthStore } from '../../stores/auth'
import { useAddressStore } from '../../stores/address'
import { useMessageStore } from '../../stores/messages'

definePageMeta({ middleware: 'auth', layout: 'dashboard' })
useSeoMeta({ title: 'Créer une adresse — findMe' })

const { t, locale } = useI18n()
const authStore = useAuthStore()
const addressStore = useAddressStore()
const msgStore = useMessageStore()

const currentStep = ref(1)
const steps = computed(() => [
  t('address.steps.step1'),
  t('address.steps.step2'),
  t('address.steps.step3'),
  t('address.steps.step4'),
])

const form = reactive({
  label: '',
  country: 'Cameroun',
  countryCode: 'CM',
  city: '',
  neighborhood: '',
  street: '',
  houseNumber: '',
  postalCode: '',
  gps: { latitude: 4.0511, longitude: 9.7679 },
  photo: '',
  photoPreview: '',
})

const errors = reactive({
  label: '', country: '', city: '', neighborhood: '', street: '',
})

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
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

  // Auto-remplir les champs depuis Nominatim
  const a = s.address || {}
  if (a.road || a.pedestrian || a.footway) form.street = a.road || a.pedestrian || a.footway || form.street
  if (a.suburb || a.neighbourhood || a.quarter || a.village) form.neighborhood = a.suburb || a.neighbourhood || a.quarter || a.village || form.neighborhood
  if (a.city || a.town || a.municipality) form.city = a.city || a.town || a.municipality || form.city
  if (a.country) form.country = a.country
  if (a.house_number) form.houseNumber = a.house_number

  // Animer la carte vers la position trouvée
  nextTick(() => {
    leafletMapRef.value?.flyToPosition(lat, lng, 18)
  })
}

// Auto-géocoder l'adresse saisie à l'étape 1 quand on arrive à l'étape 2
const geocodeFromStep1 = async () => {
  const q = [form.street, form.neighborhood, form.city, form.country].filter(Boolean).join(', ')
  if (!q) return
  searchQuery.value = q
  await nominatimSearch(q)
  if (suggestions.value.length > 0) {
    const best = suggestions.value[0]
    form.gps.latitude = parseFloat(best.lat)
    form.gps.longitude = parseFloat(best.lon)
    suggestions.value = []
    nextTick(() => {
      leafletMapRef.value?.flyToPosition(form.gps.latitude, form.gps.longitude, 18)
    })
  }
}

// ── GPS natif ────────────────────────────────────────────────
const detectGPS = () => {
  if (!navigator.geolocation) return
  gpsDetecting.value = true
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      form.gps.latitude = pos.coords.latitude
      form.gps.longitude = pos.coords.longitude
      gpsDetecting.value = false
      nextTick(() => {
        leafletMapRef.value?.flyToPosition(pos.coords.latitude, pos.coords.longitude, 18)
      })
    },
    () => { gpsDetecting.value = false }
  )
}

const onCoordsInput = () => {
  // map auto-updates via :latitude/:longitude props watch
}

// Auto-save toutes les 30 secondes
let autoSaveInterval: ReturnType<typeof setInterval>
onMounted(() => {
  addressStore.loadDraft()
  if (addressStore.draft) {
    Object.assign(form, addressStore.draft)
  }
  autoSaveInterval = setInterval(() => {
    addressStore.saveDraft({ ...form })
  }, 30000)
})
onUnmounted(() => clearInterval(autoSaveInterval))

const onPositionChange = (pos: { lat: number; lng: number }) => {
  form.gps = { latitude: pos.lat, longitude: pos.lng }
}

const validateStep1 = () => {
  const req = t('validation.required')
  errors.label = !form.label ? req : ''
  errors.country = !form.country ? req : ''
  errors.city = !form.city ? req : ''
  errors.neighborhood = !form.neighborhood ? req : ''
  errors.street = !form.street ? req : ''
  return !Object.values(errors).some(e => e)
}

const nextStep = async () => {
  if (currentStep.value === 1 && !validateStep1()) return
  currentStep.value++
  // Auto-géocoder l'adresse saisie à l'étape 1 quand on arrive en étape 2
  if (currentStep.value === 2) {
    await nextTick()
    geocodeFromStep1()
  }
}

const handleFile = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  compressImage(file)
}

const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('image/')) compressImage(file)
}

const compressImage = (file: File) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const maxSize = 800
      let { width, height } = img
      if (width > height && width > maxSize) { height = (height * maxSize) / width; width = maxSize }
      else if (height > maxSize) { width = (width * maxSize) / height; height = maxSize }
      canvas.width = width; canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
      form.photoPreview = canvas.toDataURL('image/jpeg', 0.85)
      form.photo = form.photoPreview
    }
    img.src = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const handleSubmit = async () => {
  try {
    const newAddr = await addressStore.createAddress({
      label: form.label,
      country: form.country,
      countryCode: form.countryCode,
      city: form.city,
      neighborhood: form.neighborhood,
      street: form.street,
      houseNumber: form.houseNumber,
      postalCode: form.postalCode,
      gps: form.gps,
      photo: form.photo,
    }, authStore.currentUser?.id || '')
    // Notification automatique "en attente de vérification"
    const userId = authStore.currentUser?.id
    if (userId && newAddr) {
      msgStore.sendToUser(
        userId,
        `Adresse "${newAddr.label}" reçue — en attente de vérification`,
        `Bonjour,\n\nVotre adresse "${newAddr.label}" (code : ${newAddr.addressCode}) a bien été soumise.\n\nElle est actuellement en attente de vérification par notre équipe. Vous serez notifié(e) dès qu'elle sera validée.\n\nCordialement,\nL'équipe findMe`,
      )
    }
    await navigateTo('/dashboard')
  } catch {
    // Le toast est déjà affiché par le store
  }
}
</script>

<style scoped>
.create-page { padding: 32px; max-width: 800px; }
.page-header { display: flex; align-items: center; gap: 20px; margin-bottom: 32px; }
.page-header h1 { font-size: 24px; margin-bottom: 4px; }
.page-sub { color: var(--color-text-secondary); font-size: 13px; }
.stepper { display: flex; align-items: flex-start; margin-bottom: 32px; }
.stepper-item { display: flex; align-items: center; flex: 1; flex-direction: column; position: relative; }
.stepper-circle { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; border: 2px solid var(--color-border); background: var(--color-bg); color: var(--color-text-tertiary); transition: all 250ms; }
.stepper-circle.active { border-color: var(--color-primary); background: var(--color-primary); color: white; }
.stepper-circle.done { border-color: var(--color-accent); background: var(--color-accent); color: white; }
.stepper-line { position: absolute; top: 18px; left: calc(50% + 18px); right: calc(-50% + 18px); height: 2px; background: var(--color-border); transition: background 250ms; }
.stepper-line.done { background: var(--color-accent); }
.stepper-label { font-size: 11px; font-weight: 500; color: var(--color-text-tertiary); margin-top: 6px; text-align: center; }
.stepper-label.active { color: var(--color-primary); }
.stepper-label.done { color: var(--color-accent); }
.step-content { padding: 28px; margin-bottom: 24px; }
.step-content h2 { font-size: 20px; margin-bottom: 20px; }
.step-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.step-header h2 { margin-bottom: 0; }
.step-hint { color: var(--color-text-secondary); font-size: 13px; margin-bottom: 16px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 20px; }
.gps-display { display: flex; align-items: center; gap: 8px; margin-top: 12px; font-size: 13px; color: var(--color-primary); background: var(--color-primary-light); padding: 10px 14px; border-radius: var(--radius-md); }

/* ── Barre de recherche ── */
.search-box { position: relative; margin-bottom: 14px; }
.search-input-wrap { position: relative; display: flex; align-items: center; }
.search-icon { position: absolute; left: 12px; color: var(--color-text-tertiary); pointer-events: none; flex-shrink: 0; }
.search-input { padding-left: 38px !important; padding-right: 36px !important; }
.search-spin { position: absolute; right: 12px; color: var(--color-primary); }

.suggestions-list {
  position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 200;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  max-height: 260px; overflow-y: auto;
  list-style: none; padding: 4px 0; margin: 0;
}
.suggestion-item {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 10px 14px; cursor: pointer;
  font-size: 13px; color: var(--color-text-primary);
  transition: background var(--transition-fast);
  border: none; background: none; width: 100%; text-align: left;
}
.suggestion-item:hover { background: var(--color-bg-secondary); }
.sugg-icon { flex-shrink: 0; margin-top: 2px; }

/* ── Pied GPS ── */
.gps-footer {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: 12px; gap: 12px; flex-wrap: wrap;
}
.gps-coords-row { display: flex; align-items: center; gap: 8px; font-size: 13px; }
.coords-label { color: var(--color-text-tertiary); font-weight: 600; }
.coords-val {
  font-family: var(--font-display); font-size: 12px;
  background: var(--color-bg-secondary); padding: 4px 10px;
  border-radius: var(--radius-md); color: var(--color-primary);
}
.map-fallback { height: 380px; display: flex; align-items: center; justify-content: center; background: var(--color-bg-secondary); border-radius: var(--radius-lg); color: var(--color-text-secondary); }
.photo-drop { border: 2px dashed var(--color-border); border-radius: var(--radius-xl); min-height: 200px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 200ms; overflow: hidden; }
.photo-drop:hover, .photo-drop-hover { border-color: var(--color-primary); background: var(--color-primary-light); }
.photo-placeholder { text-align: center; color: var(--color-text-tertiary); padding: 24px; }
.photo-placeholder p { margin: 12px 0 4px; font-weight: 500; }
.photo-preview { width: 100%; height: 100%; object-fit: cover; min-height: 200px; }
.recap-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
.recap-item { display: flex; flex-direction: column; gap: 3px; }
.recap-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--color-text-tertiary); }
.recap-photo { border-radius: var(--radius-md); overflow: hidden; max-height: 200px; }
.recap-photo img { width: 100%; height: 200px; object-fit: cover; }
.step-nav { display: flex; align-items: center; justify-content: space-between; }
.required { color: var(--color-error); }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); }
@media (max-width: 640px) {
  .create-page { padding: 16px; }
  .form-grid { grid-template-columns: 1fr; }
  .recap-grid { grid-template-columns: 1fr; }
}
</style>

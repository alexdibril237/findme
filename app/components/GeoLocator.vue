<template>
  <div class="geolocator">

    <!-- Bouton de détection automatique -->
    <div class="geo-actions">
      <button
        type="button"
        class="btn btn-secondary btn-sm"
        @click="detectPosition"
        :disabled="detecting"
        aria-label="Détecter ma position GPS"
      >
        <svg v-if="!detecting" width="15" height="15" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
          <path d="M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M16.95 7.05l2.12-2.12M4.93 19.07l2.12-2.12"/>
        </svg>
        <svg v-else class="animate-spin" width="15" height="15" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
        {{ detecting ? 'Détection...' : 'Ma position actuelle' }}
      </button>
      <span v-if="geoError" class="geo-error" role="alert">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        {{ geoError }}
      </span>
      <span v-if="detected" class="geo-success" role="status">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0C6B3A" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        Position détectée
      </span>
    </div>

    <!-- Champs de saisie manuelle -->
    <div class="coords-grid">
      <div class="form-group">
        <label class="form-label" :for="uid + '-lat'">
          Latitude <span class="required" aria-hidden="true">*</span>
        </label>
        <input
          :id="uid + '-lat'"
          v-model.number="localLat"
          type="number" step="0.00001" min="-90" max="90"
          class="form-input"
          placeholder="Ex: 4.05110"
          @change="onCoordsChange"
          aria-describedby="lat-hint"
        />
        <span id="lat-hint" class="form-hint">Entre -90 et 90</span>
      </div>
      <div class="form-group">
        <label class="form-label" :for="uid + '-lng'">
          Longitude <span class="required" aria-hidden="true">*</span>
        </label>
        <input
          :id="uid + '-lng'"
          v-model.number="localLng"
          type="number" step="0.00001" min="-180" max="180"
          class="form-input"
          placeholder="Ex: 9.76790"
          @change="onCoordsChange"
          aria-describedby="lng-hint"
        />
        <span id="lng-hint" class="form-hint">Entre -180 et 180</span>
      </div>
    </div>

    <!-- Badge coordonnées actives -->
    <div class="coords-badge" aria-live="polite">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#185FA5" stroke-width="2">
        <circle cx="12" cy="10" r="3"/>
        <path d="M12 2C7.59 2 4 5.59 4 10c0 5.5 8 12 8 12s8-6.5 8-12c0-4.41-3.59-8-8-8z"/>
      </svg>
      <strong>{{ localLat.toFixed(5) }}° N</strong>
      &nbsp;·&nbsp;
      <strong>{{ localLng.toFixed(5) }}° E</strong>
    </div>

    <!-- Aperçu carte (iframe OpenStreetMap — aucune librairie JS) -->
    <div class="map-preview" :style="{ height }">
      <iframe
        :key="iframeKey"
        :src="iframeSrc"
        :width="'100%'"
        :height="'100%'"
        frameborder="0"
        scrolling="no"
        marginheight="0"
        marginwidth="0"
        :title="`Carte — ${localLat.toFixed(4)}, ${localLng.toFixed(4)}`"
        loading="lazy"
        style="border:none; border-radius: var(--radius-md);"
        referrerpolicy="no-referrer"
      ></iframe>
      <div class="map-overlay-hint">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        Modifiez les coordonnées ci-dessus pour déplacer la position
      </div>
    </div>

    <!-- Lien vers OSM complet -->
    <a
      :href="`https://www.openstreetmap.org/?mlat=${localLat}&mlon=${localLng}#map=16/${localLat}/${localLng}`"
      target="_blank" rel="noopener noreferrer"
      class="osm-link"
      aria-label="Voir sur OpenStreetMap (nouvel onglet)"
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
        <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
      </svg>
      Voir sur OpenStreetMap
    </a>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
  latitude:  number
  longitude: number
  height?:   string
}

const props = withDefaults(defineProps<Props>(), {
  height: '320px',
})

const emit = defineEmits<{
  (e: 'position-change', pos: { lat: number; lng: number }): void
}>()

const uid = `geo-${Math.random().toString(36).slice(2, 7)}`

const localLat  = ref(props.latitude)
const localLng  = ref(props.longitude)
const detecting = ref(false)
const detected  = ref(false)
const geoError  = ref('')
const iframeKey = ref(0)

// URL de l'iframe OSM — se met à jour quand les coordonnées changent
const iframeSrc = computed(() => {
  const lat  = localLat.value
  const lng  = localLng.value
  const zoom = 0.008
  return `https://www.openstreetmap.org/export/embed.html` +
    `?bbox=${lng - zoom}%2C${lat - zoom}%2C${lng + zoom}%2C${lat + zoom}` +
    `&layer=mapnik&marker=${lat}%2C${lng}`
})

watch(() => props.latitude,  v => { localLat.value = v })
watch(() => props.longitude, v => { localLng.value = v })

const refreshIframe = () => { iframeKey.value++ }

const onCoordsChange = () => {
  detected.value = false
  emit('position-change', { lat: localLat.value, lng: localLng.value })
  refreshIframe()
}

const detectPosition = () => {
  if (!('geolocation' in navigator)) {
    geoError.value = 'Géolocalisation non supportée par ce navigateur'
    return
  }
  detecting.value = true
  geoError.value  = ''
  detected.value  = false

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      localLat.value  = parseFloat(pos.coords.latitude.toFixed(5))
      localLng.value  = parseFloat(pos.coords.longitude.toFixed(5))
      detecting.value = false
      detected.value  = true
      emit('position-change', { lat: localLat.value, lng: localLng.value })
      refreshIframe()
    },
    (err) => {
      detecting.value = false
      switch (err.code) {
        case 1: geoError.value = 'Permission refusée. Autorisez la localisation dans votre navigateur.'; break
        case 2: geoError.value = 'Position indisponible. Vérifiez votre GPS.'; break
        case 3: geoError.value = 'Délai dépassé. Réessayez.'; break
        default: geoError.value = 'Erreur de géolocalisation.'
      }
    },
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
  )
}

defineExpose({ geolocate: detectPosition })
</script>

<style scoped>
.geolocator { display: flex; flex-direction: column; gap: 14px; }

.geo-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }

.geo-error {
  display: flex; align-items: center; gap: 5px;
  font-size: 12px; color: var(--color-error);
}
.geo-success {
  display: flex; align-items: center; gap: 5px;
  font-size: 12px; color: var(--color-success);
  font-weight: 600;
}

.coords-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.coords-badge {
  display: inline-flex; align-items: center; gap: 7px;
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: var(--radius-md);
  padding: 9px 14px; font-size: 13px;
}

.map-preview {
  position: relative; border-radius: var(--radius-md);
  overflow: hidden; border: 1.5px solid var(--color-border);
  background: var(--color-bg-secondary);
}

.map-overlay-hint {
  position: absolute; bottom: 0; left: 0; right: 0;
  background: rgba(12, 26, 46, 0.65);
  color: rgba(255,255,255,0.75);
  font-size: 11px; padding: 7px 12px;
  display: flex; align-items: center; gap: 5px;
  backdrop-filter: blur(4px);
}

.osm-link {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 12px; color: var(--color-primary);
  text-decoration: none; font-weight: 500;
  transition: opacity 150ms;
  align-self: flex-start;
}
.osm-link:hover { opacity: 0.75; text-decoration: underline; }

.form-hint { font-size: 11px; color: var(--color-text-tertiary); }
.required { color: var(--color-error); }

@media (max-width: 480px) {
  .coords-grid { grid-template-columns: 1fr; }
}
</style>

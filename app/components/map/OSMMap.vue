<template>
  <div class="osm-wrapper">
    <div ref="mapEl" class="osm-map" :style="{ height: height || '300px' }"></div>

    <!-- Boutons de contrôle (mode interactif seulement) -->
    <div v-if="interactive" class="map-controls">
      <button class="map-btn" @click="geolocate" :title="'Ma position'" aria-label="Me localiser">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
          <path d="M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M17.66 6.34l2.12-2.12M4.22 19.78l2.12-2.12"/>
        </svg>
      </button>
    </div>

    <!-- Affichage coordonnées GPS -->
    <div class="map-coords" aria-live="polite">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="12" cy="10" r="3"/>
        <path d="M12 2C7.59 2 4 5.59 4 10c0 5.5 8 12 8 12s8-6.5 8-12c0-4.41-3.59-8-8-8z"/>
      </svg>
      {{ coordsDisplay }}
    </div>

    <!-- État erreur si Leaflet non chargé -->
    <div v-if="leafletError" class="map-error">
      <span>Carte indisponible. Vérifiez votre connexion.</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const props = withDefaults(defineProps<{
  latitude?: number
  longitude?: number
  interactive?: boolean
  height?: string
}>(), {
  latitude: 4.0511,
  longitude: 9.7679,
  interactive: true,
  height: '300px',
})

const emit = defineEmits<{
  'position-change': [{ lat: number; lng: number }]
}>()

const mapEl = ref<HTMLElement | null>(null)
const currentLat = ref(props.latitude)
const currentLng = ref(props.longitude)
const leafletError = ref(false)

let map: any = null
let marker: any = null

const coordsDisplay = computed(() =>
  `${currentLat.value.toFixed(4)}° N, ${currentLng.value.toFixed(4)}° E`
)

// Icône marqueur SVG personnalisée aux couleurs de la charte
const getMarkerIcon = (L: any) => L.divIcon({
  html: `<svg width="36" height="44" viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 0C8.06 0 0 8.06 0 18C0 31.5 18 44 18 44C18 44 36 31.5 36 18C36 8.06 27.94 0 18 0Z" fill="#185FA5"/>
    <circle cx="18" cy="18" r="7" fill="white"/>
    <circle cx="18" cy="18" r="4" fill="#185FA5"/>
  </svg>`,
  className: '',
  iconSize: [36, 44],
  iconAnchor: [18, 44],
  popupAnchor: [0, -44],
})

onMounted(async () => {
  if (!process.client || !mapEl.value) return

  let L: any
  try {
    L = (await import('leaflet')).default
  } catch {
    leafletError.value = true
    return
  }

  // Initialiser la carte Leaflet
  map = L.map(mapEl.value, {
    zoomControl: false,
    attributionControl: true,
  }).setView([props.latitude, props.longitude], 15)

  // Tuiles OpenStreetMap réelles
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
  }).addTo(map)

  // Contrôles zoom (position bas-droite pour éviter chevauchement)
  L.control.zoom({ position: 'bottomright' }).addTo(map)

  // Marqueur
  const icon = getMarkerIcon(L)
  marker = L.marker([props.latitude, props.longitude], {
    draggable: props.interactive,
    icon,
  }).addTo(map)

  if (props.interactive) {
    // Déplacement par drag
    marker.on('dragend', () => {
      const pos = marker.getLatLng()
      currentLat.value = parseFloat(pos.lat.toFixed(6))
      currentLng.value = parseFloat(pos.lng.toFixed(6))
      emit('position-change', { lat: currentLat.value, lng: currentLng.value })
    })

    // Déplacement par clic sur la carte
    map.on('click', (e: any) => {
      marker.setLatLng(e.latlng)
      currentLat.value = parseFloat(e.latlng.lat.toFixed(6))
      currentLng.value = parseFloat(e.latlng.lng.toFixed(6))
      emit('position-change', { lat: currentLat.value, lng: currentLng.value })
    })
  }
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
    marker = null
  }
})

// Géolocalisation du navigateur
const geolocate = () => {
  if (!navigator.geolocation) return
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude
      if (map && marker) {
        map.setView([lat, lng], 16)
        marker.setLatLng([lat, lng])
        currentLat.value = parseFloat(lat.toFixed(6))
        currentLng.value = parseFloat(lng.toFixed(6))
        emit('position-change', { lat: currentLat.value, lng: currentLng.value })
      }
    },
    (err) => console.warn('Géolocalisation échouée :', err.message)
  )
}

// Exposer geolocate pour appel depuis le parent
defineExpose({ geolocate })

// Réagir aux changements de props
watch(() => [props.latitude, props.longitude], ([lat, lng]) => {
  if (map && marker && lat && lng) {
    map.setView([lat, lng], map.getZoom())
    marker.setLatLng([lat, lng])
    currentLat.value = lat
    currentLng.value = lng
  }
})
</script>

<style scoped>
.osm-wrapper {
  position: relative;
  border-radius: var(--radius-md, 8px);
  overflow: hidden;
  background: #f0f0f0;
}

.osm-map {
  width: 100%;
  z-index: 0;
}

.map-controls {
  position: absolute;
  top: 12px; right: 12px;
  z-index: 1000;
  display: flex; flex-direction: column; gap: 8px;
}

.map-btn {
  width: 36px; height: 36px;
  background: white;
  border: 1px solid rgba(0,0,0,0.15);
  border-radius: 8px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: #185FA5;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  transition: all 150ms ease;
}
.map-btn:hover { background: #185FA5; color: white; }

.map-coords {
  position: absolute;
  bottom: 8px; left: 8px;
  z-index: 1000;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(6px);
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 12px; font-weight: 500;
  color: #0C447C;
  display: flex; align-items: center; gap: 5px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  pointer-events: none;
}

.map-error {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.9);
  color: #BA1A1A; font-size: 14px;
  z-index: 1001;
}

/* Fix Leaflet z-index dans Nuxt */
:deep(.leaflet-pane) { z-index: 1 !important; }
:deep(.leaflet-top),
:deep(.leaflet-bottom) { z-index: 100 !important; }
</style>

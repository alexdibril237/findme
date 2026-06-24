<template>
  <div class="lmap-wrapper" :style="{ height: height || '300px' }">
    <div ref="mapEl" class="lmap-el"></div>

    <!-- Bouton géolocaliser -->
    <div v-if="interactive" class="lmap-controls">
      <button class="lmap-btn" @click="geolocate" title="Ma position" aria-label="Me localiser">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="3 11 22 2 13 21 11 13 3 11"/>
        </svg>
      </button>
    </div>

    <!-- Coordonnées -->
    <div class="lmap-coords" aria-live="polite">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="12" cy="10" r="3"/>
        <path d="M12 2C7.59 2 4 5.59 4 10c0 5.5 8 12 8 12s8-6.5 8-12c0-4.41-3.59-8-8-8z"/>
      </svg>
      {{ displayLat }}° N, {{ displayLng }}° E
    </div>

    <!-- Erreur -->
    <div v-if="hasError" class="lmap-error">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      Carte indisponible — vérifiez votre connexion
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const props = withDefaults(defineProps<{
  latitude?: number
  longitude?: number
  zoom?: number
  interactive?: boolean
  height?: string
}>(), {
  latitude: 4.0511,
  longitude: 9.7679,
  zoom: 15,
  interactive: true,
  height: '300px',
})

const emit = defineEmits<{
  'position-change': [{ lat: number; lng: number }]
}>()

const mapEl = ref<HTMLElement | null>(null)
const currentLat = ref(props.latitude)
const currentLng = ref(props.longitude)
const hasError = ref(false)

const displayLat = computed(() => currentLat.value.toFixed(5))
const displayLng = computed(() => currentLng.value.toFixed(5))

let map: any = null
let marker: any = null

const pinIcon = (L: any) => L.divIcon({
  html: `<svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 0C7.16 0 0 7.16 0 16 0 28 16 40 16 40S32 28 32 16C32 7.16 24.84 0 16 0Z" fill="#185FA5"/>
    <circle cx="16" cy="16" r="6" fill="white"/>
    <circle cx="16" cy="16" r="3.5" fill="#185FA5"/>
  </svg>`,
  className: '',
  iconSize: [32, 40],
  iconAnchor: [16, 40],
  popupAnchor: [0, -40],
})

onMounted(async () => {
  if (!process.client || !mapEl.value) return

  let L: any
  try {
    L = (await import('leaflet')).default
  } catch {
    hasError.value = true
    return
  }

  map = L.map(mapEl.value, {
    zoomControl: false,
    attributionControl: true,
    dragging: props.interactive,
    scrollWheelZoom: props.interactive,
    doubleClickZoom: props.interactive,
    touchZoom: props.interactive,
  }).setView([props.latitude, props.longitude], props.zoom)

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
  }).addTo(map)

  L.control.zoom({ position: 'bottomright' }).addTo(map)

  marker = L.marker([props.latitude, props.longitude], {
    draggable: props.interactive,
    icon: pinIcon(L),
  }).addTo(map)

  if (props.interactive) {
    marker.on('dragend', () => {
      const p = marker.getLatLng()
      currentLat.value = parseFloat(p.lat.toFixed(6))
      currentLng.value = parseFloat(p.lng.toFixed(6))
      emit('position-change', { lat: currentLat.value, lng: currentLng.value })
    })

    map.on('click', (e: any) => {
      marker.setLatLng(e.latlng)
      currentLat.value = parseFloat(e.latlng.lat.toFixed(6))
      currentLng.value = parseFloat(e.latlng.lng.toFixed(6))
      emit('position-change', { lat: currentLat.value, lng: currentLng.value })
    })
  }
})

onUnmounted(() => {
  if (map) { map.remove(); map = null; marker = null }
})

watch(() => [props.latitude, props.longitude], ([lat, lng]) => {
  if (!map || !marker || !lat || !lng) return
  map.setView([lat, lng], map.getZoom())
  marker.setLatLng([lat, lng])
  currentLat.value = lat as number
  currentLng.value = lng as number
})

const flyToPosition = (lat: number, lng: number, z?: number) => {
  if (!map || !marker) return
  const targetZoom = z ?? props.zoom
  map.flyTo([lat, lng], targetZoom, { duration: 0.8 })
  marker.setLatLng([lat, lng])
  currentLat.value = lat
  currentLng.value = lng
}

const geolocate = () => {
  if (!navigator.geolocation || !map || !marker) return
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude
      flyToPosition(lat, lng, 17)
      emit('position-change', { lat, lng })
    },
    (err) => console.warn('Géolocalisation :', err.message)
  )
}

defineExpose({ flyToPosition, geolocate })
</script>

<style scoped>
.lmap-wrapper {
  position: relative;
  border-radius: var(--radius-md, 8px);
  overflow: hidden;
  background: #e8f0f8;
  width: 100%;
}

.lmap-el {
  width: 100%;
  height: 100%;
}

.lmap-controls {
  position: absolute;
  top: 10px; right: 10px;
  z-index: 1000;
}

.lmap-btn {
  width: 34px; height: 34px;
  background: white;
  border: 1px solid rgba(0,0,0,0.12);
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  color: #185FA5;
  box-shadow: 0 2px 6px rgba(0,0,0,0.12);
  transition: all 140ms ease;
}
.lmap-btn:hover { background: #185FA5; color: white; }

.lmap-coords {
  position: absolute;
  bottom: 8px; left: 8px;
  z-index: 1000;
  background: rgba(255,255,255,0.93);
  backdrop-filter: blur(6px);
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 11.5px; font-weight: 500;
  color: #0C447C;
  display: flex; align-items: center; gap: 5px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  pointer-events: none;
}

.lmap-error {
  position: absolute; inset: 0; z-index: 1001;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  background: rgba(255,255,255,0.92);
  color: #BA1A1A; font-size: 13px;
}

/* Fix z-index Leaflet dans Nuxt */
:deep(.leaflet-pane) { z-index: 1 !important; }
:deep(.leaflet-top), :deep(.leaflet-bottom) { z-index: 100 !important; }
:deep(.leaflet-control-zoom) { border: none !important; box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important; }
:deep(.leaflet-control-zoom a) { color: #185FA5 !important; font-weight: 700 !important; }
</style>

<template>
  <div class="leaflet-wrapper" :style="{ height }">
    <div ref="mapEl" class="leaflet-map-el"></div>
    <div v-if="!mapReady" class="map-loading">
      <svg class="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

const props = withDefaults(defineProps<{
  latitude?: number
  longitude?: number
  height?: string
  interactive?: boolean
  zoom?: number
}>(), {
  latitude: 4.0511,
  longitude: 9.7679,
  height: '300px',
  interactive: true,
  zoom: 15,
})

const emit = defineEmits<{
  'position-change': [{ lat: number; lng: number }]
}>()

const mapEl = ref<HTMLElement | null>(null)
const mapReady = ref(false)
let mapInstance: any = null
let marker: any = null

const initMap = async () => {
  if (!mapEl.value || mapInstance) return

  const L = (await import('leaflet')).default
  await import('leaflet/dist/leaflet.css')

  // Fix icônes Leaflet avec Vite
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })

  mapInstance = L.map(mapEl.value, {
    zoomControl: props.interactive,
    dragging: props.interactive,
    scrollWheelZoom: props.interactive,
    doubleClickZoom: props.interactive,
    touchZoom: props.interactive,
  }).setView([props.latitude, props.longitude], props.zoom)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(mapInstance)

  // Marqueur glissable pour affiner la position manuellement
  marker = L.marker([props.latitude, props.longitude], {
    draggable: props.interactive,
  }).addTo(mapInstance)

  if (props.interactive) {
    // Clic sur la carte → déplace le marqueur
    mapInstance.on('click', (e: any) => {
      const { lat, lng } = e.latlng
      marker.setLatLng([lat, lng])
      emit('position-change', { lat, lng })
    })

    // Glisser le marqueur → met à jour les coordonnées
    marker.on('dragend', (e: any) => {
      const { lat, lng } = e.target.getLatLng()
      emit('position-change', { lat, lng })
    })
  }

  mapReady.value = true
}

// Animation fluide vers une nouvelle position
const flyToPosition = (lat: number, lng: number, zoom = 17) => {
  if (!mapInstance || !marker) return
  marker.setLatLng([lat, lng])
  mapInstance.flyTo([lat, lng], zoom, { duration: 1.2, easeLinearity: 0.25 })
}

// Mise à jour simple (sans animation, pour les inputs manuels)
const updateMarker = (lat: number, lng: number) => {
  if (!mapInstance || !marker) return
  marker.setLatLng([lat, lng])
  mapInstance.setView([lat, lng], mapInstance.getZoom())
}

watch(() => [props.latitude, props.longitude], ([lat, lng]) => {
  updateMarker(Number(lat), Number(lng))
})

onMounted(() => { initMap() })

onBeforeUnmount(() => {
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
  }
})

defineExpose({
  flyToPosition,
  setPosition: (lat: number, lng: number) => {
    flyToPosition(lat, lng)
    emit('position-change', { lat, lng })
  },
})
</script>

<style scoped>
.leaflet-wrapper {
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--color-border);
}
.leaflet-map-el { width: 100%; height: 100%; }
.map-loading {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  background: var(--color-bg-secondary);
  color: var(--color-primary);
}
</style>

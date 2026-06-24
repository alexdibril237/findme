<template>
  <div
    class="custom-map"
    :style="{ height }"
    ref="mapContainer"
    :class="{ 'map-dark': dark, 'map-interactive': interactive }"
  >
    <!-- Canvas principal -->
    <canvas
      ref="canvas"
      class="map-canvas"
      @mousedown="interactive ? startDrag($event) : null"
      @mousemove="interactive ? onDrag($event) : null"
      @mouseup="interactive ? endDrag() : null"
      @mouseleave="interactive ? endDrag() : null"
      @touchstart.prevent="interactive ? startDragTouch($event) : null"
      @touchmove.prevent="interactive ? onDragTouch($event) : null"
      @touchend="interactive ? endDrag() : null"
      :style="{ cursor: interactive ? (isDragging ? 'grabbing' : 'grab') : 'default' }"
      :aria-label="`Carte — position ${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`"
      role="img"
    ></canvas>

    <!-- Coordonnées affichées -->
    <div class="map-coords" aria-live="polite">
      <svg width="10" height="10" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="12" cy="10" r="3"/>
        <path d="M12 2C7.59 2 4 5.59 4 10c0 5.5 8 12 8 12s8-6.5 8-12c0-4.41-3.59-8-8-8z"/>
      </svg>
      {{ currentLat.toFixed(4) }}° N, {{ currentLng.toFixed(4) }}° E
    </div>

    <!-- Bouton recentrer -->
    <button
      v-if="interactive"
      class="map-recenter"
      @click="recenter"
      aria-label="Recentrer sur ma position"
      title="Recentrer"
    >
      <svg width="16" height="16" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="3"/>
        <line x1="12" y1="2" x2="12" y2="6"/>
        <line x1="12" y1="18" x2="12" y2="22"/>
        <line x1="2" y1="12" x2="6" y2="12"/>
        <line x1="18" y1="12" x2="22" y2="12"/>
      </svg>
    </button>

    <!-- Bouton géolocalisation -->
    <button
      v-if="interactive"
      class="map-geolocate"
      @click="geolocate"
      :class="{ loading: geoLoading }"
      aria-label="Détecter ma position"
      title="Ma position"
    >
      <svg v-if="!geoLoading" width="16" height="16" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="3 11 22 2 13 21 11 13 3 11"/>
      </svg>
      <svg v-else width="16" height="16" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2"
        class="animate-spin">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  latitude: number
  longitude: number
  interactive?: boolean
  height?: string
  dark?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  interactive: true,
  height: '300px',
  dark: false,
})

const emit = defineEmits<{
  (e: 'update:latitude', val: number): void
  (e: 'update:longitude', val: number): void
  (e: 'position-change', lat: number, lng: number): void
}>()

import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'

const canvas = ref<HTMLCanvasElement | null>(null)
const mapContainer = ref<HTMLDivElement | null>(null)
const currentLat = ref(props.latitude)
const currentLng = ref(props.longitude)
const geoLoading = ref(false)

// État du drag
const isDragging = ref(false)
const dragStart = reactive({ x: 0, y: 0 })
const mapOffset = reactive({ x: 0, y: 0 })
const tempOffset = reactive({ x: 0, y: 0 })

// Zoom
const zoom = ref(12)

// Couleurs selon mode
const colors = computed(() => props.dark ? {
  bg: '#0A1929',
  grid: 'rgba(24,95,165,0.2)',
  gridStrong: 'rgba(24,95,165,0.4)',
  road: 'rgba(255,255,255,0.06)',
  roadStrong: 'rgba(255,255,255,0.1)',
  water: '#0C2340',
  park: '#0A2A1A',
  building: 'rgba(255,255,255,0.04)',
  text: 'rgba(255,255,255,0.3)',
  coords: 'rgba(255,255,255,0.6)',
} : {
  bg: '#E8F0F8',
  grid: 'rgba(24,95,165,0.08)',
  gridStrong: 'rgba(24,95,165,0.2)',
  road: 'rgba(255,255,255,0.9)',
  roadStrong: '#FFFFFF',
  water: '#B8D4E8',
  park: '#C8E6C9',
  building: 'rgba(180,200,220,0.5)',
  text: 'rgba(12,68,124,0.5)',
  coords: 'rgba(12,68,124,0.8)',
})

// Convertir lat/lng en pixels canvas
const latLngToPixel = (lat: number, lng: number, canvasW: number, canvasH: number) => {
  const scale = Math.pow(2, zoom.value)
  const x = ((lng + 180) / 360) * scale * 256
  const sinLat = Math.sin((lat * Math.PI) / 180)
  const y = (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale * 256

  const centerX = ((currentLng.value + 180) / 360) * scale * 256
  const sinCenter = Math.sin((currentLat.value * Math.PI) / 180)
  const centerY = (0.5 - Math.log((1 + sinCenter) / (1 - sinCenter)) / (4 * Math.PI)) * scale * 256

  return {
    x: canvasW / 2 + (x - centerX) + mapOffset.x + tempOffset.x,
    y: canvasH / 2 + (y - centerY) + mapOffset.y + tempOffset.y,
  }
}

// Convertir pixel canvas en lat/lng
const pixelToLatLng = (px: number, py: number, canvasW: number, canvasH: number) => {
  const scale = Math.pow(2, zoom.value)
  const centerX = ((currentLng.value + 180) / 360) * scale * 256
  const sinCenter = Math.sin((currentLat.value * Math.PI) / 180)
  const centerY = (0.5 - Math.log((1 + sinCenter) / (1 - sinCenter)) / (4 * Math.PI)) * scale * 256

  const x = centerX + (px - canvasW / 2) - mapOffset.x - tempOffset.x
  const y = centerY + (py - canvasH / 2) - mapOffset.y - tempOffset.y

  const lng = (x / (scale * 256)) * 360 - 180
  const n = Math.PI - (2 * Math.PI * y) / (scale * 256)
  const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)))

  return { lat, lng }
}

// Dessiner la carte
const drawMap = () => {
  if (!canvas.value) return
  const ctx = canvas.value.getContext('2d')
  if (!ctx) return

  const W = canvas.value.width
  const H = canvas.value.height
  const c = colors.value

  // Fond
  ctx.fillStyle = c.bg
  ctx.fillRect(0, 0, W, H)

  // Zone eau (rivière simulée)
  ctx.fillStyle = c.water
  ctx.beginPath()
  ctx.ellipse(W * 0.15, H * 0.6, W * 0.12, H * 0.08, -0.3, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = c.water
  ctx.beginPath()
  ctx.ellipse(W * 0.85, H * 0.35, W * 0.1, H * 0.06, 0.2, 0, Math.PI * 2)
  ctx.fill()

  // Parcs verts
  ctx.fillStyle = c.park
  ctx.beginPath()
  ctx.ellipse(W * 0.7, H * 0.75, W * 0.08, H * 0.06, 0.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(W * 0.25, H * 0.2, W * 0.06, H * 0.05, -0.3, 0, Math.PI * 2)
  ctx.fill()

  // Grille de rues
  const gridSize = Math.max(20, 60 - zoom.value * 2)
  const offsetX = ((mapOffset.x + tempOffset.x) % gridSize + gridSize) % gridSize
  const offsetY = ((mapOffset.y + tempOffset.y) % gridSize + gridSize) % gridSize

  // Rues secondaires
  ctx.strokeStyle = c.grid
  ctx.lineWidth = 0.5
  for (let x = -gridSize + offsetX; x < W + gridSize; x += gridSize) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
  }
  for (let y = -gridSize + offsetY; y < H + gridSize; y += gridSize) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
  }

  // Routes principales
  const roadSize = gridSize * 3
  const roadOffX = ((mapOffset.x + tempOffset.x) % roadSize + roadSize) % roadSize
  const roadOffY = ((mapOffset.y + tempOffset.y) % roadSize + roadSize) % roadSize

  ctx.strokeStyle = c.road
  ctx.lineWidth = props.dark ? 3 : 4
  for (let x = -roadSize + roadOffX; x < W + roadSize; x += roadSize) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
  }
  for (let y = -roadSize + roadOffY; y < H + roadSize; y += roadSize) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
  }

  // Axes principaux (plus épais)
  ctx.strokeStyle = c.roadStrong
  ctx.lineWidth = props.dark ? 5 : 7
  const axisX = W / 2 + ((mapOffset.x + tempOffset.x) % (roadSize * 2))
  const axisY = H / 2 + ((mapOffset.y + tempOffset.y) % (roadSize * 2))
  ctx.beginPath(); ctx.moveTo(axisX, 0); ctx.lineTo(axisX, H); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(0, axisY); ctx.lineTo(W, axisY); ctx.stroke()

  // Blocs bâtiments
  ctx.fillStyle = c.building
  const blockGrid = gridSize
  for (let bx = offsetX; bx < W; bx += blockGrid) {
    for (let by = offsetY; by < H; by += blockGrid) {
      const pad = blockGrid * 0.15
      const bw = blockGrid * 0.65
      const bh = blockGrid * 0.65
      ctx.fillRect(bx + pad, by + pad, bw, bh)
    }
  }

  // Cercle de zone autour du pin
  const center = latLngToPixel(currentLat.value, currentLng.value, W, H)
  const gradient = ctx.createRadialGradient(
    center.x, center.y, 0, center.x, center.y, 60
  )
  gradient.addColorStop(0, 'rgba(24,95,165,0.15)')
  gradient.addColorStop(1, 'rgba(24,95,165,0)')
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(center.x, center.y, 60, 0, Math.PI * 2)
  ctx.fill()

  // Pulse animation
  const pulseRadius = 20 + Math.sin(Date.now() / 500) * 8
  ctx.strokeStyle = 'rgba(24,95,165,0.4)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(center.x, center.y, pulseRadius, 0, Math.PI * 2)
  ctx.stroke()

  // Ombre du pin
  ctx.fillStyle = 'rgba(0,0,0,0.15)'
  ctx.beginPath()
  ctx.ellipse(center.x, center.y + 24, 10, 4, 0, 0, Math.PI * 2)
  ctx.fill()

  // Pin principal
  const pinSize = 28
  ctx.fillStyle = '#185FA5'
  ctx.beginPath()
  ctx.arc(center.x, center.y - pinSize / 2, pinSize / 2, Math.PI, 0)
  ctx.lineTo(center.x + pinSize / 2, center.y - pinSize / 2)
  ctx.quadraticCurveTo(center.x + pinSize / 2, center.y, center.x, center.y + pinSize / 2)
  ctx.quadraticCurveTo(center.x - pinSize / 2, center.y, center.x - pinSize / 2, center.y - pinSize / 2)
  ctx.closePath()
  ctx.fill()

  // Contour pin
  ctx.strokeStyle = 'white'
  ctx.lineWidth = 2
  ctx.stroke()

  // Point blanc au centre du pin
  ctx.fillStyle = 'white'
  ctx.beginPath()
  ctx.arc(center.x, center.y - pinSize / 2, pinSize / 5, 0, Math.PI * 2)
  ctx.fill()

  // Nom du quartier si zoom suffisant
  if (zoom.value >= 12) {
    ctx.font = `600 11px Inter, sans-serif`
    ctx.fillStyle = c.text
    ctx.textAlign = 'center'
    ctx.fillText('Douala · Littoral', W / 2, H - 12)
  }

  // Échelle
  drawScale(ctx, W, H)
}

// Dessiner l'échelle
const drawScale = (ctx: CanvasRenderingContext2D, W: number, H: number) => {
  const scaleWidth = 60
  const x = 12
  const y = H - 20
  const metersPerPixel = (156543 * Math.cos(currentLat.value * Math.PI / 180)) / Math.pow(2, zoom.value)
  const meters = Math.round(scaleWidth * metersPerPixel)
  const label = meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${meters} m`

  ctx.strokeStyle = props.dark ? 'rgba(255,255,255,0.5)' : 'rgba(12,68,124,0.6)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(x, y); ctx.lineTo(x + scaleWidth, y)
  ctx.moveTo(x, y - 4); ctx.lineTo(x, y + 4)
  ctx.moveTo(x + scaleWidth, y - 4); ctx.lineTo(x + scaleWidth, y + 4)
  ctx.stroke()

  ctx.font = '10px Inter, sans-serif'
  ctx.fillStyle = props.dark ? 'rgba(255,255,255,0.5)' : 'rgba(12,68,124,0.6)'
  ctx.textAlign = 'center'
  ctx.fillText(label, x + scaleWidth / 2, y - 6)
}

// Animation loop
let animFrame: number
const startAnimation = () => {
  const loop = () => {
    drawMap()
    animFrame = requestAnimationFrame(loop)
  }
  loop()
}

// Drag handlers
const startDrag = (e: MouseEvent) => {
  isDragging.value = true
  dragStart.x = e.clientX
  dragStart.y = e.clientY
}

const onDrag = (e: MouseEvent) => {
  if (!isDragging.value) return
  tempOffset.x = e.clientX - dragStart.x
  tempOffset.y = e.clientY - dragStart.y
}

const endDrag = () => {
  if (!isDragging.value) return
  isDragging.value = false

  if (!canvas.value) return
  const W = canvas.value.width
  const H = canvas.value.height

  // Convertir le offset en nouvelles coords
  const newCenter = pixelToLatLng(
    W / 2 - tempOffset.x,
    H / 2 - tempOffset.y,
    W, H
  )
  currentLat.value = newCenter.lat
  currentLng.value = newCenter.lng

  mapOffset.x = 0
  mapOffset.y = 0
  tempOffset.x = 0
  tempOffset.y = 0

  emit('update:latitude', currentLat.value)
  emit('update:longitude', currentLng.value)
  emit('position-change', currentLat.value, currentLng.value)
}

// Touch handlers
const startDragTouch = (e: TouchEvent) => {
  isDragging.value = true
  dragStart.x = e.touches[0].clientX
  dragStart.y = e.touches[0].clientY
}

const onDragTouch = (e: TouchEvent) => {
  if (!isDragging.value) return
  tempOffset.x = e.touches[0].clientX - dragStart.x
  tempOffset.y = e.touches[0].clientY - dragStart.y
}

// Recentrer
const recenter = () => {
  currentLat.value = props.latitude
  currentLng.value = props.longitude
  mapOffset.x = 0
  mapOffset.y = 0
  tempOffset.x = 0
  tempOffset.y = 0
  emit('update:latitude', currentLat.value)
  emit('update:longitude', currentLng.value)
}

// Géolocalisation
const geolocate = () => {
  if (!navigator.geolocation) return
  geoLoading.value = true

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      currentLat.value = pos.coords.latitude
      currentLng.value = pos.coords.longitude
      mapOffset.x = 0
      mapOffset.y = 0
      geoLoading.value = false
      emit('update:latitude', currentLat.value)
      emit('update:longitude', currentLng.value)
      emit('position-change', currentLat.value, currentLng.value)
    },
    () => {
      geoLoading.value = false
    },
    { enableHighAccuracy: true, timeout: 10000 }
  )
}

// Resize canvas
const resizeCanvas = () => {
  if (!canvas.value || !mapContainer.value) return
  canvas.value.width = mapContainer.value.clientWidth
  canvas.value.height = mapContainer.value.clientHeight
}

// Watch props
watch(() => [props.latitude, props.longitude], ([lat, lng]) => {
  currentLat.value = lat as number
  currentLng.value = lng as number
})

onMounted(() => {
  resizeCanvas()
  startAnimation()
  window.addEventListener('resize', resizeCanvas)
})

onUnmounted(() => {
  cancelAnimationFrame(animFrame)
  window.removeEventListener('resize', resizeCanvas)
})
</script>

<style scoped>
.custom-map {
  position: relative; width: 100%;
  border-radius: var(--radius-md); overflow: hidden;
  background: #E8F0F8;
}
.map-dark { background: #0A1929; }

.map-canvas {
  width: 100%; height: 100%; display: block;
}

.map-coords {
  position: absolute; bottom: 8px; right: 8px;
  display: flex; align-items: center; gap: 5px;
  background: rgba(255,255,255,0.9);
  backdrop-filter: blur(8px);
  border-radius: var(--radius-full);
  padding: 4px 10px; font-size: 11px;
  font-family: var(--font-display); font-weight: 600;
  color: var(--color-primary);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.map-dark .map-coords {
  background: rgba(10,25,41,0.9); color: #85B7EB;
}

.map-recenter, .map-geolocate {
  position: absolute; right: 8px;
  width: 32px; height: 32px; border-radius: var(--radius-md);
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(24,95,165,0.15);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--color-primary);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: all var(--transition-fast);
}
.map-recenter:hover, .map-geolocate:hover {
  background: var(--color-primary); color: white;
  transform: scale(1.05);
}
.map-dark .map-recenter, .map-dark .map-geolocate {
  background: rgba(10,25,41,0.9);
  border-color: rgba(24,95,165,0.3); color: #85B7EB;
}

.map-recenter { bottom: 36px; }
.map-geolocate { bottom: 76px; }

.map-geolocate.loading {
  pointer-events: none; opacity: 0.7;
}
</style>
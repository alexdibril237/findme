import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useToast } from '../composables/useToast'
import { useRuntimeConfig, useNuxtApp } from '#imports'

// Traducteur lazy — appelé dans chaque action, jamais au niveau setup
const tr = (key: string): string => {
  try {
    return (useNuxtApp().$i18n as any).t(key)
  } catch {
    return key
  }
}

// ── Persistance locale des adresses par utilisateur ──────────────────────────
const getStorageKey = () => {
  if (!process.client) return null
  try {
    const u = localStorage.getItem('findme_user')
    return u ? `findme_addresses_${JSON.parse(u).id}` : null
  } catch { return null }
}

const loadLocalAddresses = (): Address[] => {
  if (!process.client) return []
  try {
    const key = getStorageKey()
    if (!key) return []
    return JSON.parse(localStorage.getItem(key) || '[]')
  } catch { return [] }
}

const persistAddresses = (addrs: Address[]) => {
  if (!process.client) return
  try {
    const key = getStorageKey()
    if (key) localStorage.setItem(key, JSON.stringify(addrs))
  } catch {}
}
// ─────────────────────────────────────────────────────────────────────────────

interface GPS { latitude: number; longitude: number }

export interface Address {
  id: string; userId: string; label: string; country: string; countryCode: string
  city: string; neighborhood: string; street: string; houseNumber: string
  postalCode?: string | null; gps: GPS; photo?: string
  status: 'verified' | 'pending' | 'draft'
  addressCode: string; createdAt: string; updatedAt: string
}

export const useAddressStore = defineStore('address', () => {
  const { showToast } = useToast()
  const config = useRuntimeConfig()
  const api = config.public.apiBase

  const addresses = ref<Address[]>([])
  const currentAddress = ref<Address | null>(null)
  const draft = ref<Partial<Address> | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const limit = 4

  const canCreateMore = computed(() => addresses.value.length < limit)
  const remaining = computed(() => limit - addresses.value.length)
  const verifiedAddresses = computed(() => addresses.value.filter(a => a.status === 'verified'))

  const getHeaders = (): Record<string, string> => {
    if (!process.client) return {}
    const tok = localStorage.getItem('findme_token')
    return tok ? { Authorization: `Bearer ${tok}` } : {}
  }

  const genCode = (neighborhood = 'ADDR') =>
    `FM ${Math.floor(Math.random() * 9000) + 1000} ${neighborhood.substring(0, 4).toUpperCase()}`

  // GET /addresses — charge depuis le localStorage d'abord (évite les données mock)
  const fetchMyAddresses = async (_userId?: string) => {
    loading.value = true
    error.value = null
    try {
      const local = loadLocalAddresses()
      if (local.length > 0) {
        // L'utilisateur a des adresses créées → utiliser le stockage local
        addresses.value = local
        return
      }
      // Aucune adresse locale : l'utilisateur est nouveau ou a supprimé ses données
      // On ne charge PAS le mock pour éviter des adresses "Jean Dupont" fictives
      addresses.value = []
    } finally {
      loading.value = false
    }
  }

  // POST /addresses
  const createAddress = async (addressData: Partial<Address>, _userId?: string) => {
    if (addresses.value.length >= limit) {
      showToast(tr('errors.limit_reached'), 'error')
      throw new Error('ADDRESS_LIMIT_REACHED')
    }
    loading.value = true
    error.value = null
    try {
      const code = genCode(addressData.neighborhood)
      const res = await $fetch<any>(`${api}/addresses`, {
        method: 'POST',
        headers: { ...getHeaders(), 'Content-Type': 'application/json' },
        body: {
          ...addressData,
          status: 'pending',
          addressCode: code,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      })
      const returned = res?.data || {}
      const newAddress: Address = {
        id: returned.id || `addr_${Date.now()}`,
        userId: returned.userId || '',
        addressCode: returned.addressCode || code,
        status: returned.status || 'pending',
        createdAt: returned.createdAt || new Date().toISOString(),
        updatedAt: returned.updatedAt || new Date().toISOString(),
        ...addressData,
      } as Address
      addresses.value.push(newAddress)
      persistAddresses(addresses.value)
      draft.value = null
      if (process.client) localStorage.removeItem('findme_draft')
      showToast(tr('address.created'), 'success')
      return newAddress
    } catch (err: any) {
      const code = err?.data?.error?.code || ''
      if (code === 'ADDRESS_LIMIT_REACHED') {
        showToast(tr('errors.limit_reached'), 'error')
      } else {
        showToast(tr('errors.server'), 'error')
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  // PUT /addresses/:id
  const updateAddress = async (id: string, updates: Partial<Address>) => {
    loading.value = true
    error.value = null
    try {
      const res = await $fetch<any>(`${api}/addresses/${id}`, {
        method: 'PUT',
        headers: { ...getHeaders(), 'Content-Type': 'application/json' },
        body: { ...updates, updatedAt: new Date().toISOString() },
      })
      const returned = res?.data || {}
      const idx = addresses.value.findIndex(a => a.id === id)
      if (idx !== -1) {
        addresses.value[idx] = { ...addresses.value[idx], ...updates, ...returned }
      }
      persistAddresses(addresses.value)
      showToast(tr('address.updated'), 'success')
      return addresses.value[idx] || { ...updates, id } as Address
    } catch {
      error.value = 'NETWORK_ERROR'
      showToast(tr('errors.network'), 'error')
      throw new Error('NETWORK_ERROR')
    } finally {
      loading.value = false
    }
  }

  // DELETE /addresses/:id
  const deleteAddress = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      await $fetch(`${api}/addresses/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
      addresses.value = addresses.value.filter(a => a.id !== id)
      persistAddresses(addresses.value)
      showToast(tr('address.deleted'), 'success')
    } catch {
      error.value = 'NETWORK_ERROR'
      showToast(tr('errors.network'), 'error')
      throw new Error('NETWORK_ERROR')
    } finally {
      loading.value = false
    }
  }

  // GET /addresses/:id
  const fetchAddress = async (id: string): Promise<Address> => {
    loading.value = true
    try {
      // Chercher d'abord dans le stockage local
      const local = loadLocalAddresses()
      const localAddr = local.find(a => a.id === id)
      if (localAddr) {
        currentAddress.value = localAddr
        return localAddr
      }
      // Sinon appel API
      const res = await $fetch<any>(`${api}/addresses/${id}`, { headers: getHeaders() })
      const data = res?.data || res
      const addr: Address = { ...data, addressCode: data.addressCode || genCode(data.neighborhood) }
      currentAddress.value = addr
      return addr
    } catch {
      showToast(tr('errors.network'), 'error')
      throw new Error('NETWORK_ERROR')
    } finally {
      loading.value = false
    }
  }

  // Brouillon localStorage
  const saveDraft = (data: Partial<Address>) => {
    draft.value = { ...draft.value, ...data }
    if (process.client) localStorage.setItem('findme_draft', JSON.stringify(draft.value))
    showToast(tr('address.draft_saved'), 'info')
  }

  const loadDraft = () => {
    if (!process.client) return
    try {
      const saved = localStorage.getItem('findme_draft')
      if (saved) draft.value = JSON.parse(saved)
    } catch { draft.value = null }
  }

  const clearDraft = () => {
    draft.value = null
    if (process.client) localStorage.removeItem('findme_draft')
  }

  const setCurrentAddress = (address: Address | null) => { currentAddress.value = address }

  return {
    addresses, currentAddress, draft, loading, error, limit,
    canCreateMore, remaining, verifiedAddresses,
    fetchMyAddresses, createAddress, updateAddress, deleteAddress, fetchAddress,
    saveDraft, loadDraft, clearDraft, setCurrentAddress,
  }
})

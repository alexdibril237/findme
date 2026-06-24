import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRuntimeConfig } from '#imports'

export interface Message {
  id: string
  fromName: string
  fromRole: string
  subject: string
  body: string
  read: boolean
  createdAt: string
}

export const useMessageStore = defineStore('messages', () => {
  const config = useRuntimeConfig()
  const messages = ref<Message[]>([])
  const loading  = ref(false)
  const fetched  = ref(false)

  const unreadCount = computed(() => messages.value.filter(m => !m.read).length)

  const fetchMessages = async () => {
    if (!process.client) return
    const tok = localStorage.getItem('findme_token')
    if (!tok) return
    loading.value = true
    try {
      const res = await $fetch<any>(`${config.public.apiBase}/messages`, {
        headers: { Authorization: `Bearer ${tok}` },
      })
      messages.value = res?.data?.messages || []
      fetched.value = true
    } catch {
      messages.value = []
    } finally {
      loading.value = false
    }
  }

  const markRead = async (id: string) => {
    const msg = messages.value.find(m => m.id === id)
    if (!msg || msg.read) return
    msg.read = true
    const tok = process.client ? localStorage.getItem('findme_token') : null
    try {
      await $fetch(`${config.public.apiBase}/messages/${id}/read`, {
        method: 'PATCH',
        headers: tok ? { Authorization: `Bearer ${tok}` } : {},
      })
    } catch {}
  }

  return { messages, loading, fetched, unreadCount, fetchMessages, markRead }
})

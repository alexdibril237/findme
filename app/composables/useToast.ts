import { reactive } from 'vue'

export interface ToastItem {
  id: number
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
}

// État global partagé entre tous les composants
const toasts = reactive<ToastItem[]>([])
let _nextId = 0

export const useToast = () => {
  const showToast = (
    message: string,
    type: ToastItem['type'] = 'info',
    duration = 4000
  ) => {
    const id = ++_nextId
    toasts.push({ id, type, message })
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration)
    }
  }

  const removeToast = (id: number) => {
    const idx = toasts.findIndex(t => t.id === id)
    if (idx !== -1) toasts.splice(idx, 1)
  }

  return { toasts, showToast, removeToast }
}

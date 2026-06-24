import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Message {
  id: string
  fromName: string
  fromRole: 'admin' | 'user'
  subject: string
  body: string
  read: boolean
  createdAt: string
  fromUserId?: string
}

const ADMIN_INBOX_KEY = 'findme_admin_inbox'

function makeId () {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

function daysAgo (n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

function seedUserMessages (userId: string): Message[] {
  const seeds: Message[] = [
    {
      id: makeId(),
      fromName: 'Admin findMe',
      fromRole: 'admin',
      subject: 'Bienvenue sur findMe !',
      body: `Bonjour,\n\nNous sommes ravis de vous accueillir sur findMe, la plateforme d'adressage numérique.\n\nGrâce à votre compte, vous pouvez :\n• Créer jusqu'à 4 adresses numériques personnalisées\n• Exporter votre adresse en PDF avec QR Code\n• Partager votre code d'adresse pour recevoir des livraisons\n\nN'hésitez pas à créer votre première adresse dès maintenant.\n\nCordialement,\nL'équipe findMe`,
      read: false,
      createdAt: daysAgo(7),
    },
    {
      id: makeId(),
      fromName: 'Admin findMe',
      fromRole: 'admin',
      subject: 'Comment créer votre première adresse numérique',
      body: `Bonjour,\n\nVoici un guide rapide pour créer votre adresse :\n\n1. Cliquez sur "Nouvelle adresse" dans votre tableau de bord\n2. Renseignez le label (ex: "Domicile", "Bureau")\n3. Utilisez la géolocalisation pour remplir automatiquement les champs\n4. Ajoutez une photo de votre logement (optionnel)\n5. Cliquez sur "Publier l'adresse"\n\nUn code unique (ex: CM-YAO-00001) sera généré automatiquement.\n\nBonne création !\n\nL'équipe findMe`,
      read: true,
      createdAt: daysAgo(5),
    },
    {
      id: makeId(),
      fromName: 'Admin findMe',
      fromRole: 'admin',
      subject: 'Votre compte a été activé avec succès',
      body: `Bonjour,\n\nVotre compte findMe est maintenant pleinement actif.\n\nVous avez accès à toutes les fonctionnalités de la plateforme. Si vous avez des questions ou rencontrez des difficultés, n'hésitez pas à nous contacter via le formulaire de support.\n\nMerci de nous faire confiance.\n\nCordialement,\nL'équipe findMe`,
      read: true,
      createdAt: daysAgo(3),
    },
  ]
  localStorage.setItem(`findme_messages_${userId}`, JSON.stringify(seeds))
  localStorage.setItem(`findme_msg_seeded_${userId}`, '1')
  return seeds
}

function seedAdminInbox (): Message[] {
  const seeds: Message[] = [
    {
      id: makeId(),
      fromName: 'Amadou Diallo',
      fromRole: 'user',
      subject: 'Problème lors de la création de mon adresse',
      body: `Bonjour,\n\nJe rencontre une difficulté lors de la création de mon adresse. La géolocalisation ne semble pas fonctionner correctement, le marqueur se positionne très loin de chez moi.\n\nPourriez-vous m'aider ?\n\nMerci`,
      read: false,
      createdAt: daysAgo(1),
    },
    {
      id: makeId(),
      fromName: 'Fatou Ndiaye',
      fromRole: 'user',
      subject: 'Question sur l\'export PDF',
      body: `Bonjour,\n\nJ'aimerais savoir si le PDF généré est accepté par les services postaux comme document officiel d'adresse.\n\nMerci pour votre réponse.\n\nCordialement,\nFatou`,
      read: false,
      createdAt: daysAgo(2),
    },
    {
      id: makeId(),
      fromName: 'Jean-Baptiste Koné',
      fromRole: 'user',
      subject: 'Demande de vérification de mon adresse',
      body: `Bonjour,\n\nJ'ai créé mon adresse il y a 3 jours (code : CM-DLA-00047) mais elle est toujours en statut "En attente". Pourriez-vous accélérer la vérification ?\n\nJ'en ai besoin pour une livraison urgente.\n\nMerci d'avance`,
      read: true,
      createdAt: daysAgo(4),
    },
    {
      id: makeId(),
      fromName: 'Marie-Claire Essomba',
      fromRole: 'user',
      subject: 'Félicitations pour l\'application !',
      body: `Bonjour,\n\nJe voulais juste vous féliciter pour cette excellente initiative. Enfin une solution pour les adresses en Afrique !\n\nJ'ai recommandé findMe à toute ma famille. Continuez comme ça.\n\nBonne continuation,\nMarie-Claire`,
      read: true,
      createdAt: daysAgo(6),
    },
  ]
  localStorage.setItem(ADMIN_INBOX_KEY, JSON.stringify(seeds))
  localStorage.setItem('findme_admin_inbox_seeded', '1')
  return seeds
}

export const useMessageStore = defineStore('messages', () => {
  const messages  = ref<Message[]>([])
  const loading   = ref(false)
  const fetched   = ref(false)
  const adminInbox = ref<Message[]>([])

  const unreadCount      = computed(() => messages.value.filter(m => !m.read).length)
  const adminUnreadCount = computed(() => adminInbox.value.filter(m => !m.read).length)

  // ── Boîte de réception utilisateur (messages de l'admin) ──
  const fetchMessages = async () => {
    if (!process.client) return
    loading.value = true
    try {
      const userRaw = localStorage.getItem('findme_user')
      const user = userRaw ? JSON.parse(userRaw) : null
      if (!user?.id) { messages.value = []; return }
      const raw = localStorage.getItem(`findme_messages_${user.id}`)
      const existing: Message[] = raw ? JSON.parse(raw) : []
      if (existing.length === 0 && !localStorage.getItem(`findme_msg_seeded_${user.id}`)) {
        messages.value = seedUserMessages(user.id)
      } else {
        messages.value = existing
      }
      fetched.value = true
    } catch {
      messages.value = []
    } finally {
      loading.value = false
    }
  }

  const markRead = (id: string) => {
    if (!process.client) return
    const msg = messages.value.find(m => m.id === id)
    if (!msg || msg.read) return
    msg.read = true
    const userRaw = localStorage.getItem('findme_user')
    const user = userRaw ? JSON.parse(userRaw) : null
    if (!user?.id) return
    localStorage.setItem(`findme_messages_${user.id}`, JSON.stringify(messages.value))
  }

  // ── Boîte de réception admin (messages des utilisateurs) ──
  const fetchAdminInbox = () => {
    if (!process.client) return
    try {
      const raw = localStorage.getItem(ADMIN_INBOX_KEY)
      const existing: Message[] = raw ? JSON.parse(raw) : []
      if (existing.length === 0 && !localStorage.getItem('findme_admin_inbox_seeded')) {
        adminInbox.value = seedAdminInbox()
      } else {
        adminInbox.value = existing
      }
    } catch {
      adminInbox.value = []
    }
  }

  const markAdminRead = (id: string) => {
    if (!process.client) return
    const msg = adminInbox.value.find(m => m.id === id)
    if (!msg || msg.read) return
    msg.read = true
    localStorage.setItem(ADMIN_INBOX_KEY, JSON.stringify(adminInbox.value))
  }

  const markAdminUnread = (id: string) => {
    if (!process.client) return
    const msg = adminInbox.value.find(m => m.id === id)
    if (!msg || !msg.read) return
    msg.read = false
    localStorage.setItem(ADMIN_INBOX_KEY, JSON.stringify(adminInbox.value))
  }

  // ── Envoi : utilisateur → admin ───────────────────────────
  const sendToAdmin = (subject: string, body: string): boolean => {
    if (!process.client) return false
    const userRaw = localStorage.getItem('findme_user')
    const user = userRaw ? JSON.parse(userRaw) : null
    if (!user) return false
    const existing: Message[] = JSON.parse(localStorage.getItem(ADMIN_INBOX_KEY) || '[]')
    existing.unshift({
      id: makeId(),
      fromName: user.name || 'Utilisateur',
      fromRole: 'user',
      subject,
      body,
      read: false,
      createdAt: new Date().toISOString(),
      fromUserId: user.id,
    })
    localStorage.setItem(ADMIN_INBOX_KEY, JSON.stringify(existing))
    adminInbox.value = existing
    return true
  }

  // ── Envoi : admin → utilisateur ───────────────────────────
  const sendToUser = (toUserId: string, subject: string, body: string, fromName = 'Admin findMe'): boolean => {
    if (!process.client) return false
    const key = `findme_messages_${toUserId}`
    const existing: Message[] = JSON.parse(localStorage.getItem(key) || '[]')
    existing.unshift({
      id: makeId(),
      fromName,
      fromRole: 'admin',
      subject,
      body,
      read: false,
      createdAt: new Date().toISOString(),
    })
    localStorage.setItem(key, JSON.stringify(existing))
    return true
  }

  return {
    messages, loading, fetched, unreadCount,
    adminInbox, adminUnreadCount,
    fetchMessages, markRead,
    fetchAdminInbox, markAdminRead, markAdminUnread,
    sendToAdmin, sendToUser,
  }
})

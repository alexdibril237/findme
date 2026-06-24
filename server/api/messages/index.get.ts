// In-memory messages store (seeded on server start)
const messages: any[] = [
  {
    id: 'm_001',
    userId: 'usr_001',
    fromName: 'Admin findMe',
    fromRole: 'admin',
    subject: 'Bienvenue sur findMe !',
    body: 'Bonjour Jean,\n\nNous sommes ravis de vous accueillir sur la plateforme findMe. Votre compte a bien été créé et vous pouvez dès maintenant ajouter vos adresses numériques.\n\nN\'hésitez pas à contacter le support si vous avez des questions.\n\nCordialement,\nL\'équipe findMe',
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'm_002',
    userId: 'usr_001',
    fromName: 'Admin findMe',
    fromRole: 'admin',
    subject: 'Votre adresse FM 4872 AKWA a été vérifiée',
    body: 'Bonjour,\n\nNous avons le plaisir de vous informer que votre adresse "Domicile" (code FM 4872 AKWA) a été vérifiée et validée par notre équipe.\n\nVous pouvez maintenant utiliser ce code pour recevoir des livraisons et des services.\n\nCordialement,\nL\'équipe findMe',
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
]

export default defineEventHandler((event) => {
  const userId = getHeader(event, 'x-user-id') || 'usr_001'
  const userMessages = messages
    .filter(m => m.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return {
    success: true,
    data: {
      messages: userMessages,
      unread: userMessages.filter(m => !m.read).length,
      total: userMessages.length,
    },
  }
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { userId, subject, message } = body

  if (!userId || !subject || !message) {
    throw createError({ statusCode: 400, message: 'userId, subject et message sont requis' })
  }

  const newMessage = {
    id: `m_${Date.now()}`,
    userId,
    fromName: 'Admin findMe',
    fromRole: 'admin',
    subject,
    body: message,
    read: false,
    createdAt: new Date().toISOString(),
  }

  return {
    success: true,
    message: 'Message envoyé avec succès',
    data: newMessage,
  }
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, email } = body

  return {
    success: true,
    message: 'Compte créé avec succès',
    data: {
      user: {
        id: 'usr_' + Date.now(),
        name: name || 'Utilisateur',
        email: email || 'user@example.com',
        role: 'user',
        city: 'Douala',
        createdAt: new Date().toISOString(),
      },
      token: 'mock_token_' + Math.random().toString(36).substring(2, 18),
    },
  }
})

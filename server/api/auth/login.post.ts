export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email } = body

  const name = email?.includes('admin') ? 'Admin findMe' : 'Jean Dupont'
  const role = email?.includes('admin') ? 'admin' : 'user'

  return {
    success: true,
    message: 'Connexion réussie',
    data: {
      user: {
        id: 'usr_001',
        name,
        email: email || 'jean.dupont@example.com',
        role,
        city: 'Douala',
        createdAt: '2024-01-15T08:00:00.000Z',
      },
      token: 'mock_token_' + Math.random().toString(36).substring(2, 18),
    },
  }
})

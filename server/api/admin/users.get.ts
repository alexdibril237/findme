export default defineEventHandler(() => {
  return {
    success: true,
    data: {
      users: [
        { id: 'usr_001', name: 'Jean Dupont', email: 'jean.dupont@example.com', role: 'user', city: 'Douala', addressCount: 2, createdAt: '2024-01-15T08:00:00.000Z' },
        { id: 'usr_002', name: 'Aïcha Toubé', email: 'aicha.toube@example.com', role: 'user', city: 'Yaoundé', addressCount: 1, createdAt: '2024-02-20T10:30:00.000Z' },
        { id: 'usr_003', name: 'Paul Biya Jr', email: 'paul.biya@example.com', role: 'user', city: 'Bafoussam', addressCount: 3, createdAt: '2024-03-05T09:00:00.000Z' },
        { id: 'usr_004', name: 'Admin findMe', email: 'admin@findme.cm', role: 'admin', city: 'Douala', addressCount: 0, createdAt: '2023-12-01T00:00:00.000Z' },
      ],
      total: 4,
    },
  }
})

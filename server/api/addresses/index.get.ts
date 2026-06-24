export default defineEventHandler(() => {
  return {
    success: true,
    data: {
      addresses: [
        {
          id: 'addr_001',
          label: 'Domicile',
          street: 'Rue Alfred Saker',
          neighborhood: 'Akwa',
          city: 'Douala',
          country: 'Cameroun',
          status: 'verified',
          addressCode: 'FM 4872 AKWA',
          photo: null,
          createdAt: '2024-03-10T10:00:00.000Z',
        },
        {
          id: 'addr_002',
          label: 'Bureau',
          street: 'Avenue Kennedy',
          neighborhood: 'Bonanjo',
          city: 'Douala',
          country: 'Cameroun',
          status: 'pending',
          addressCode: 'FM 2341 BONA',
          photo: null,
          createdAt: '2024-04-05T14:30:00.000Z',
        },
      ],
      total: 2,
      limit: 50,
      remaining: 0,
    },
  }
})

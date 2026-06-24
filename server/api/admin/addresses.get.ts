export default defineEventHandler(() => {
  return {
    success: true,
    data: {
      addresses: [
        { id: 'addr_001', label: 'Domicile', street: 'Rue Alfred Saker', neighborhood: 'Akwa', city: 'Douala', country: 'Cameroun', status: 'verified', addressCode: 'FM 4872 AKWA', createdAt: '2024-03-10T10:00:00.000Z' },
        { id: 'addr_002', label: 'Bureau', street: 'Avenue Kennedy', neighborhood: 'Bonanjo', city: 'Douala', country: 'Cameroun', status: 'pending', addressCode: 'FM 2341 BONA', createdAt: '2024-04-05T14:30:00.000Z' },
        { id: 'addr_003', label: 'Résidence', street: 'Rue Mvolyé', neighborhood: 'Mvolyé', city: 'Yaoundé', country: 'Cameroun', status: 'draft', addressCode: 'FM 8810 MVOL', createdAt: '2024-05-01T09:00:00.000Z' },
      ],
      total: 3,
    },
  }
})

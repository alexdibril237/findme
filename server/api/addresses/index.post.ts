export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  return {
    success: true,
    message: 'Adresse créée avec succès',
    data: {
      id: 'addr_' + Date.now(),
      label: body.label || 'Nouvelle adresse',
      street: body.street || '',
      neighborhood: body.neighborhood || '',
      city: body.city || 'Douala',
      country: body.country || 'Cameroun',
      status: 'pending',
      addressCode: 'FM ' + Math.floor(1000 + Math.random() * 9000) + ' ' + (body.neighborhood || 'ADDR').toUpperCase().slice(0, 4),
      photo: body.photo || null,
      createdAt: new Date().toISOString(),
    },
  }
})

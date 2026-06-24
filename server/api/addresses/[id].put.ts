export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  return {
    success: true,
    message: 'Adresse mise à jour',
    data: {
      id,
      label: body.label,
      street: body.street,
      neighborhood: body.neighborhood,
      city: body.city,
      country: body.country,
      status: body.status || 'pending',
      updatedAt: new Date().toISOString(),
    },
  }
})

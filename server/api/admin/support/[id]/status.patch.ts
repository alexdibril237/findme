export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  return {
    success: true,
    message: 'Statut mis à jour',
    data: { id, status: body.status || 'resolved' },
  }
})

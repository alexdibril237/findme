export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  // In a real app: mark message as read in DB
  return {
    success: true,
    data: { id, read: true },
  }
})

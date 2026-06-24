export default defineEventHandler(async (event) => {
  await readBody(event)
  return {
    success: true,
    message: 'Message envoyé. Notre équipe vous répondra sous 24h.',
    data: { ticketId: 'tkt_' + Date.now() },
  }
})

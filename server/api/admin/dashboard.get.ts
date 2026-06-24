export default defineEventHandler(() => {
  return {
    success: true,
    data: {
      users: { total: 25432, newThisMonth: 1240 },
      addresses: { total: 70215, verifiedThisMonth: 3400 },
      support: { open: 28, resolvedThisMonth: 142 },
    },
  }
})

export default defineEventHandler(async (event) => {
  const { email, otp } = await readBody(event)

  if (!email || !otp) {
    throw createError({ statusCode: 400, statusMessage: 'Email et code requis' })
  }

  const stored = await useStorage('cache').getItem<{ otp: string; expiry: number }>(`otp:${email}`)

  if (!stored) {
    throw createError({ statusCode: 400, statusMessage: 'Aucun code trouvé. Redemandez un code.' })
  }

  if (Date.now() > stored.expiry) {
    await useStorage('cache').removeItem(`otp:${email}`)
    throw createError({ statusCode: 400, statusMessage: 'Code expiré. Redemandez un code.' })
  }

  if (stored.otp !== otp.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Code incorrect' })
  }

  // OTP valide → supprimer du cache
  await useStorage('cache').removeItem(`otp:${email}`)

  return { success: true, message: 'Code vérifié avec succès' }
})

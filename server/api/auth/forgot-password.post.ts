import { Resend } from 'resend'

export default defineEventHandler(async (event) => {
  const { email } = await readBody(event)

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Email invalide' })
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const expiry = Date.now() + 15 * 60 * 1000 // 15 min

  // Stocker l'OTP dans le cache Nitro (TTL 15 min)
  await useStorage('cache').setItem(`otp:${email}`, { otp, expiry })

  const resendApiKey = process.env.RESEND_API_KEY || useRuntimeConfig().resendApiKey as string

  if (resendApiKey) {
    const resend = new Resend(resendApiKey)
    await resend.emails.send({
      from: 'findMe <onboarding@resend.dev>',
      to: email,
      subject: 'Votre code de réinitialisation — findMe',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:12px;">
          <div style="text-align:center;margin-bottom:24px;">
            <span style="font-size:32px;font-weight:900;color:#185FA5;">find<span style="color:#5DCAA5;">Me</span></span>
          </div>
          <h2 style="font-size:20px;color:#111827;margin-bottom:8px;">Réinitialisation de mot de passe</h2>
          <p style="color:#6b7280;margin-bottom:24px;">Utilisez le code ci-dessous pour réinitialiser votre mot de passe. Ce code expire dans <strong>15 minutes</strong>.</p>
          <div style="background:#185FA5;color:white;font-size:36px;font-weight:800;text-align:center;padding:24px;border-radius:8px;letter-spacing:12px;">
            ${otp}
          </div>
          <p style="color:#9ca3af;font-size:13px;margin-top:24px;">Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
          <p style="color:#9ca3af;font-size:12px;text-align:center;">© findMe by GeoLink Africa · Douala, Cameroun</p>
        </div>
      `,
    })
    return { success: true }
  }

  // Mode développement : retourner l'OTP directement
  return { success: true, devOtp: otp }
})

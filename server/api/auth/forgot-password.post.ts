import { Resend } from 'resend'

export default defineEventHandler(async (event) => {
  const { email, token } = await readBody(event)

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Email invalide' })
  }

  if (!token) {
    throw createError({ statusCode: 400, statusMessage: 'Token manquant' })
  }

  // Construire le lien de réinitialisation à partir de l'hôte de la requête
  const host = getHeader(event, 'host') || 'localhost:3000'
  const proto = host.startsWith('localhost') ? 'http' : 'https'
  const resetLink = `${proto}://${host}/auth/reset-password?token=${token}`

  const resendApiKey = process.env.RESEND_API_KEY || (useRuntimeConfig().resendApiKey as string)

  if (resendApiKey) {
    const resend = new Resend(resendApiKey)
    await resend.emails.send({
      from: 'findMe <onboarding@resend.dev>',
      to: email,
      subject: 'Réinitialisez votre mot de passe — findMe',
      html: `
        <div style="font-family:'Plus Jakarta Sans',sans-serif;max-width:520px;margin:0 auto;padding:40px 32px;background:#f9fafb;border-radius:16px;">
          <div style="text-align:center;margin-bottom:32px;">
            <span style="font-size:28px;font-weight:900;color:#185FA5;letter-spacing:-1px;">find<span style="color:#5DCAA5;">Me</span></span>
          </div>
          <h2 style="font-size:22px;color:#111827;margin-bottom:12px;font-weight:700;">Réinitialisation de mot de passe</h2>
          <p style="color:#6b7280;font-size:15px;line-height:1.6;margin-bottom:28px;">
            Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous. Ce lien expire dans <strong>1 heure</strong>.
          </p>
          <div style="text-align:center;margin-bottom:28px;">
            <a href="${resetLink}"
               style="display:inline-block;background:#185FA5;color:white;font-size:15px;font-weight:700;
                      text-decoration:none;padding:14px 32px;border-radius:9999px;">
              Réinitialiser mon mot de passe
            </a>
          </div>
          <p style="color:#9ca3af;font-size:13px;line-height:1.6;">
            Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br/>
            <a href="${resetLink}" style="color:#185FA5;word-break:break-all;">${resetLink}</a>
          </p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0;">
          <p style="color:#9ca3af;font-size:12px;text-align:center;">
            Si vous n'avez pas fait cette demande, ignorez cet email.<br/>
            © findMe by GeoLink Africa · Douala, Cameroun
          </p>
        </div>
      `,
    })
    return { success: true, sent: true }
  }

  // Pas de clé Resend — mode démo uniquement
  return { success: true, sent: false }
})

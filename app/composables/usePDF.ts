import { useToast } from './useToast'

export const generateAddressPDF = async (address: any) => {
  const { showToast } = useToast()

  // Import dynamique — évite les erreurs SSR de jsPDF
  const { default: jsPDF } = await import('jspdf')
  const QRCode = await import('qrcode')

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = 210
  const margin = 20

  // Header sombre
  doc.setFillColor(15, 39, 68)
  doc.rect(0, 0, W, 50, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(24)
  doc.setTextColor(255, 255, 255)
  doc.text('findMe', margin, 28)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(148, 180, 212)
  doc.text('by GeoLink Africa · Douala, Cameroun', margin, 38)

  doc.setFontSize(12)
  doc.setTextColor(230, 241, 251)
  doc.text("CERTIFICAT D'ADRESSE", W - margin, 28, { align: 'right' })

  // Ligne accent
  doc.setFillColor(24, 95, 165)
  doc.rect(0, 50, W, 3, 'F')

  // Titre adresse
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(12, 26, 46)
  doc.text(address.label || 'Adresse', margin, 72)

  // Badge statut
  const statusColor: [number, number, number] = address.status === 'verified' ? [12, 107, 58] : [186, 122, 23]
  doc.setFillColor(...statusColor)
  doc.roundedRect(W - margin - 32, 63, 32, 8, 2, 2, 'F')
  doc.setFontSize(8)
  doc.setTextColor(255, 255, 255)
  doc.text(address.status === 'verified' ? 'VERIFIE' : 'EN ATTENTE', W - margin - 16, 68.5, { align: 'center' })

  // Code adresse
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(24, 95, 165)
  doc.text(address.addressCode || '', margin, 83)

  doc.setDrawColor(230, 241, 251)
  doc.setLineWidth(0.5)
  doc.line(margin, 90, W - margin, 90)

  // Champs adresse
  let y = 102
  const fields = [
    { label: 'Pays', value: address.country },
    { label: 'Ville', value: address.city },
    { label: 'Quartier', value: address.neighborhood },
    { label: 'Rue', value: address.street },
    { label: 'Numéro', value: address.houseNumber },
    { label: 'Code postal', value: address.postalCode || 'Non renseigné' },
  ]

  fields.forEach((field) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(136, 135, 128)
    doc.text(field.label.toUpperCase(), margin, y)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(12, 26, 46)
    doc.text(String(field.value || '—'), margin + 45, y)
    y += 12
  })

  doc.setDrawColor(230, 241, 251)
  doc.line(margin, y + 4, W - margin, y + 4)
  y += 16

  // GPS
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(12, 26, 46)
  doc.text('COORDONNEES GPS', margin, y)
  y += 8

  doc.setFillColor(230, 241, 251)
  doc.roundedRect(margin, y, W - margin * 2, 16, 3, 3, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(24, 95, 165)

  const lat = address.gps?.latitude ?? 0
  const lng = address.gps?.longitude ?? 0
  doc.text(`${lat.toFixed(6)}° N, ${lng.toFixed(6)}° E`, W / 2, y + 10, { align: 'center' })
  y += 28

  // QR Code
  try {
    const qrData = `https://findme.geolink-africa.com/address/${address.id}`
    const qrDataUrl = await QRCode.toDataURL(qrData, {
      width: 128, margin: 1,
      color: { dark: '#0C447C', light: '#FFFFFF' },
    })

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(12, 26, 46)
    doc.text('QR CODE', margin, y)
    doc.addImage(qrDataUrl, 'PNG', margin, y + 4, 35, 35)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(136, 135, 128)
    doc.text('Scannez pour acceder a l\'adresse', margin + 40, y + 16)
    doc.setTextColor(24, 95, 165)
    doc.text(qrData, margin + 40, y + 26)
    y += 48
  } catch (e) {
    console.warn('QR generation failed:', e)
  }

  // Footer
  doc.setFillColor(248, 250, 252)
  doc.rect(0, 277, W, 20, 'F')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(136, 135, 128)
  doc.text(
    `© ${new Date().getFullYear()} findMe by GeoLink Africa · Genere le ${new Date().toLocaleDateString('fr-FR')}`,
    W / 2, 287, { align: 'center' }
  )
  doc.text('Ce document est officiel et verifiable en ligne.', W / 2, 292, { align: 'center' })

  const filename = `adresse_${(address.label || 'findme').toLowerCase().replace(/\s+/g, '_')}_${(address.addressCode || '').replace(/\s+/g, '_')}.pdf`
  doc.save(filename)
  showToast('PDF généré avec succès !', 'success')
}

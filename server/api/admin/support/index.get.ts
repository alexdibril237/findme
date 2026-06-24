export default defineEventHandler(() => {
  return {
    success: true,
    data: {
      tickets: [
        { id: 'tkt_001', name: 'Jean Dupont', email: 'jean.dupont@example.com', message: "Je n'arrive pas à générer mon PDF, le bouton ne répond pas.", status: 'open', createdAt: '2024-06-10T09:15:00.000Z' },
        { id: 'tkt_002', name: 'Aïcha Toubé', email: 'aicha.toube@example.com', message: "Mon adresse est vérifiée mais je ne reçois pas la confirmation par email.", status: 'resolved', createdAt: '2024-06-08T14:00:00.000Z' },
        { id: 'tkt_003', name: 'Paul Nkoum', email: 'paul.nkoum@example.com', message: "Comment modifier le quartier d'une adresse déjà enregistrée ?", status: 'open', createdAt: '2024-06-12T11:30:00.000Z' },
      ],
      total: 3,
    },
  }
})

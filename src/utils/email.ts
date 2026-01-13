const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY

export interface EmailData {
  to: string
  subject: string
  html: string
}

export async function sendEmail(data: EmailData): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn('Resend API key not configured')
    return false
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'noreply@uclouvain.be',
        to: data.to,
        subject: data.subject,
        html: data.html,
      }),
    })

    if (!response.ok) {
      throw new Error(`Email API error: ${response.statusText}`)
    }

    return true
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}

export function formatCandidatureEmail(cours: any, candidat: any): EmailData {
  return {
    to: candidat.email || '',
    subject: `Candidature pour le cours ${cours.code_cours}`,
    html: `
      <h2>Confirmation de candidature</h2>
      <p>Bonjour ${candidat.prenom} ${candidat.nom},</p>
      <p>Votre candidature pour le cours <strong>${cours.code_cours} - ${cours.intitule_court || cours.intitule_complet}</strong> a été enregistrée.</p>
      <p>Nous vous contacterons prochainement.</p>
      <p>Cordialement,<br>L'équipe UCLouvain</p>
    `,
  }
}

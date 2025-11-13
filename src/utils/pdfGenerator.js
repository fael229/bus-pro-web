import jsPDF from 'jspdf'

/**
 * Génère un PDF de reçu pour une réservation payée
 * @param {Object} reservation - Les détails de la réservation
 * @returns {Promise<void>}
 */
export const generateReceiptPDF = async (reservation) => {
  try {
    // Créer une nouvelle instance jsPDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    // Configuration des couleurs et styles
    const primaryColor = [41, 128, 185] // Bleu primary
    const textColor = [33, 37, 41] // Gris foncé
    const lightGray = [108, 117, 125]
    const successColor = [40, 167, 69] // Vert success

    // En-tête avec logo et titre
    pdf.setFillColor(...primaryColor)
    pdf.rect(0, 0, 210, 30, 'F')
    
    pdf.setTextColor(255, 255, 255)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(24)
    pdf.text('Bus Bénin', 15, 20)
    
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    pdf.text('Reçu de paiement', 15, 26)

    // Date et numéro de reçu
    const currentDate = new Date().toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    
    pdf.setTextColor(...textColor)
    pdf.setFontSize(10)
    pdf.text(`Date d'émission: ${currentDate}`, 15, 45)
    pdf.text(`N° de reçu: REC-${reservation.id}`, 15, 50)
    pdf.text(`ID Réservation: ${reservation.id}`, 15, 55)

    // Statut payé
    pdf.setFillColor(...successColor)
    pdf.roundedRect(150, 40, 45, 8, 2, 2, 'F')
    pdf.setTextColor(255, 255, 255)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(9)
    pdf.text('PAYÉ', 168, 46)

    // Section informations passager
    let currentY = 70
    pdf.setTextColor(...primaryColor)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(14)
    pdf.text('Informations du passager', 15, currentY)
    
    currentY += 10
    pdf.setTextColor(...textColor)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(11)
    
    pdf.text(`Nom: ${reservation.nom_passager}`, 15, currentY)
    currentY += 6
    pdf.text(`Email: ${reservation.email_passager}`, 15, currentY)
    currentY += 6
    pdf.text(`Téléphone: ${reservation.telephone_passager}`, 15, currentY)

    // Section détails du voyage
    currentY += 15
    pdf.setTextColor(...primaryColor)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(14)
    pdf.text('Détails du voyage', 15, currentY)

    currentY += 10
    pdf.setTextColor(...textColor)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(11)

    pdf.text(`Trajet: ${reservation.trajets.depart} → ${reservation.trajets.arrivee}`, 15, currentY)
    currentY += 6
    pdf.text(`Compagnie: ${reservation.trajets.compagnies?.nom || 'N/A'}`, 15, currentY)
    currentY += 6
    pdf.text(`Date de voyage: ${new Date(reservation.date_voyage).toLocaleDateString('fr-FR')}`, 15, currentY)
    currentY += 6
    pdf.text(`Horaire: ${reservation.horaire}`, 15, currentY)
    currentY += 6
    pdf.text(`Nombre de places: ${reservation.nb_places}`, 15, currentY)

    // Section paiement
    currentY += 15
    pdf.setTextColor(...primaryColor)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(14)
    pdf.text('Détails du paiement', 15, currentY)

    currentY += 10
    pdf.setTextColor(...textColor)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(11)

    if (reservation.fedapay_transaction_id) {
      pdf.text(`ID Transaction: ${reservation.fedapay_transaction_id}`, 15, currentY)
      currentY += 6
    }

    pdf.text(`Statut: ${reservation.statut_paiement === 'approved' ? 'Payé' : reservation.statut_paiement}`, 15, currentY)
    currentY += 6
    pdf.text(`Méthode: Mobile Money/Carte bancaire`, 15, currentY)

    // Tableau de facturation
    currentY += 15
    const tableStartY = currentY

    // En-tête du tableau
    pdf.setFillColor(248, 249, 250)
    pdf.rect(15, tableStartY, 180, 8, 'F')
    pdf.setTextColor(...textColor)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(10)
    pdf.text('Description', 20, tableStartY + 5)
    pdf.text('Quantité', 120, tableStartY + 5)
    pdf.text('Montant', 160, tableStartY + 5)

    // Ligne de séparation
    pdf.setDrawColor(...lightGray)
    pdf.line(15, tableStartY + 8, 195, tableStartY + 8)

    // Ligne du trajet
    currentY = tableStartY + 15
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Billet ${reservation.trajets.depart} - ${reservation.trajets.arrivee}`, 20, currentY)
    pdf.text(`${reservation.nb_places}`, 125, currentY)
    pdf.text(`${reservation.montant_total} FCFA`, 160, currentY)

    // Ligne de séparation
    pdf.line(15, currentY + 3, 195, currentY + 3)

    // Total
    currentY += 10
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(12)
    pdf.text('Total payé:', 120, currentY)
    pdf.setTextColor(...successColor)
    pdf.text(`${reservation.montant_total} FCFA`, 160, currentY)

    // Code QR ou informations supplémentaires
    currentY += 20
    pdf.setTextColor(...lightGray)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    pdf.text('Présentez ce reçu lors de votre voyage.', 15, currentY)
    currentY += 4
    pdf.text('Pour toute réclamation, contactez notre service client avec le numéro de réservation.', 15, currentY)

    // Pied de page
    pdf.setTextColor(...lightGray)
    pdf.setFontSize(8)
    pdf.text('Bus Bénin - Transport fiable et sécurisé', 15, 280)
    pdf.text(`Généré le ${currentDate}`, 15, 285)
    
    // Télécharger le PDF
    const fileName = `recu-bus-benin-${reservation.id}.pdf`
    pdf.save(fileName)

    return { success: true, fileName }

  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Génère un PDF optimisé pour mobile avec une mise en page simplifiée
 * @param {Object} reservation - Les détails de la réservation
 * @returns {Promise<void>}
 */
export const generateMobileReceiptPDF = async (reservation) => {
  try {
    // Format plus adapté au mobile (plus étroit)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 120] // Format ticket
    })

    const primaryColor = [41, 128, 185]
    const textColor = [33, 37, 41]
    const successColor = [40, 167, 69]

    // En-tête compact
    pdf.setFillColor(...primaryColor)
    pdf.rect(0, 0, 80, 15, 'F')
    
    pdf.setTextColor(255, 255, 255)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(12)
    pdf.text('Bus Bénin', 5, 8)
    pdf.setFontSize(8)
    pdf.text('Reçu', 5, 12)

    // Informations principales
    let y = 20
    pdf.setTextColor(...textColor)
    pdf.setFontSize(8)
    
    pdf.setFont('helvetica', 'bold')
    pdf.text(`ID: ${reservation.id}`, 5, y)
    y += 4
    
    pdf.setFont('helvetica', 'normal')
    pdf.text(`${reservation.trajets.depart} → ${reservation.trajets.arrivee}`, 5, y)
    y += 4
    pdf.text(`${reservation.nom_passager}`, 5, y)
    y += 4
    pdf.text(`${reservation.nb_places} place(s)`, 5, y)
    y += 4
    pdf.text(`${new Date(reservation.date_voyage).toLocaleDateString('fr-FR')}`, 5, y)
    y += 4
    pdf.text(`${reservation.horaire}`, 5, y)
    
    y += 8
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(...successColor)
    pdf.text(`${reservation.montant_total} FCFA`, 5, y)
    pdf.text('PAYÉ', 50, y)

    y += 8
    pdf.setTextColor(...textColor)
    pdf.setFontSize(6)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`${new Date().toLocaleDateString('fr-FR')}`, 5, y)

    // Télécharger
    const fileName = `ticket-mobile-${reservation.id}.pdf`
    pdf.save(fileName)

    return { success: true, fileName }

  } catch (error) {
    console.error('Erreur génération PDF mobile:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Détecte si l'utilisateur est sur mobile et utilise le bon format
 * @param {Object} reservation - Les détails de la réservation
 * @returns {Promise<void>}
 */
export const generateAdaptiveReceiptPDF = async (reservation) => {
  const isMobile = window.innerWidth < 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  
  if (isMobile) {
    return await generateMobileReceiptPDF(reservation)
  } else {
    return await generateReceiptPDF(reservation)
  }
}

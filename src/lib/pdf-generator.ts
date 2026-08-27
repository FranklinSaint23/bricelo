import jsPDF from 'jspdf'

export function generateOrderReceiptPDF(order: {
  id: string
  created_at: string
  status: string
  subtotal: number
  shipping_cost: number
  total: number
  payment_method?: string
  shipping_address: Record<string, string> | null
  order_items: Array<{
    quantity: number
    unit_price: number
    product?: { name: string } | null
    snapshot?: { name?: string; variant_name?: string; sku?: string; image?: string; unit_price?: number } | null
  }>
}) {
  const doc = new jsPDF()

  // ── 1. BANNIÈRE EN-TÊTE CORPORATE (#0f172a) ──
  doc.setFillColor(15, 23, 42) // Slate/Navy 900
  doc.rect(0, 0, 210, 38, 'F')

  // Marque BRICELO
  doc.setTextColor(245, 158, 11) // Gold #f59e0b
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('BRICELO', 15, 22)

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.text('.cm', 61, 22)

  doc.setFontSize(8)
  doc.setTextColor(148, 163, 184)
  doc.text('MARKETPLACE N°1 AU CAMEROUN', 15, 30)

  // Titre du Document
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('FACTURE & REÇU DE COMMANDE', 125, 20)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(203, 213, 225)
  doc.text(`Réf: FAC-${new Date(order.created_at).getFullYear()}-${order.id.slice(0, 8).toUpperCase()}`, 125, 28)

  // ── 2. BLOCS D'INFORMATIONS EN 2 COLONNES ──
  let y = 48

  // Boîte Client (Gauche)
  doc.setFillColor(248, 250, 252) // Light slate #f8fafc
  doc.setDrawColor(226, 232, 240)
  doc.roundedRect(15, y, 88, 38, 3, 3, 'FD')

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(15, 23, 42)
  doc.text('CLIENT & LIVRAISON', 20, y + 8)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(51, 65, 85)

  const addr = order.shipping_address || {}
  const clientName = addr.full_name || 'Client BRICELO'
  const clientPhone = addr.phone || ''
  const clientAddress = addr.address_line1 || addr.address_line || addr.quartier || 'Adresse non spécifiée'
  const clientCity = addr.city || 'Douala'

  doc.text(`Nom : ${clientName.slice(0, 32)}`, 20, y + 15)
  doc.text(`Tél : ${clientPhone}`, 20, y + 21)
  doc.text(`Adresse : ${clientAddress.slice(0, 35)}`, 20, y + 27)
  doc.text(`Ville : ${clientCity}`, 20, y + 33)

  // Boîte Commande & Émetteur (Droite)
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(107, y, 88, 38, 3, 3, 'FD')

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(15, 23, 42)
  doc.text('DÉTAILS COMMANDE', 112, y + 8)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(51, 65, 85)

  const dateStr = new Date(order.created_at).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  const payMethod = order.payment_method === 'cash' ? 'Paiement à la livraison (Cash)' : 'Paiement Mobile (OM/MoMo)'
  const statusFr = order.status === 'delivered' ? 'Livrée' : order.status === 'confirmed' ? 'Confirmée' : order.status === 'shipped' ? 'En cours de livraison' : 'En attente'

  doc.text(`Date : ${dateStr}`, 112, y + 15)
  doc.text(`Statut : ${statusFr}`, 112, y + 21)
  doc.text(`Paiement : ${payMethod}`, 112, y + 27)
  doc.text(`Émetteur : BRICELO Cameroun S.A.R.L`, 112, y + 33)

  // ── 3. TABLEAU DES ARTICLES ──
  y += 46

  // En-tête du Tableau (#0f172a)
  doc.setFillColor(15, 23, 42)
  doc.rect(15, y, 180, 9, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(255, 255, 255)
  doc.text('DÉSIGNATION DU PRODUIT', 20, y + 6)
  doc.text('QTÉ', 118, y + 6, { align: 'center' })
  doc.text('PRIX UNITAIRE', 150, y + 6, { align: 'right' })
  doc.text('TOTAL FCFA', 190, y + 6, { align: 'right' })

  y += 9

  // Lignes d'articles
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)

  order.order_items.forEach((item, index) => {
    // Fond alterné pour lisibilité professionnelle
    if (index % 2 === 0) {
      doc.setFillColor(255, 255, 255)
    } else {
      doc.setFillColor(248, 250, 252)
    }
    doc.rect(15, y, 180, 9, 'F')
    doc.setDrawColor(241, 245, 249)
    doc.line(15, y + 9, 195, y + 9)

    doc.setTextColor(30, 41, 59)
    const baseName = item.snapshot?.name || item.product?.name || 'Produit BRICELO'
    const varName = item.snapshot?.variant_name || null
    const sku = item.snapshot?.sku || null
    
    let fullName = baseName
    if (varName) fullName += ` (${varName})`
    if (sku) fullName += ` [SKU: ${sku}]`

    const truncatedName = fullName.length > 55 ? fullName.slice(0, 52) + '...' : fullName
    const itemTotal = item.unit_price * item.quantity

    doc.text(truncatedName, 20, y + 6)
    doc.text(String(item.quantity), 118, y + 6, { align: 'center' })
    doc.text(`${item.unit_price.toLocaleString('fr-FR')} F`, 150, y + 6, { align: 'right' })
    doc.setFont('helvetica', 'bold')
    doc.text(`${itemTotal.toLocaleString('fr-FR')} FCFA`, 190, y + 6, { align: 'right' })
    doc.setFont('helvetica', 'normal')

    y += 9

    // Gestion saut de page si nécessaire
    if (y > 250) {
      doc.addPage()
      y = 20
    }
  })

  // ── 4. RÉCAPITULATIF FINANCIER ──
  y += 6

  // Encadré de total
  doc.setFillColor(248, 250, 252)
  doc.setDrawColor(226, 232, 240)
  doc.roundedRect(110, y, 85, 34, 3, 3, 'FD')

  doc.setFontSize(8.5)
  doc.setTextColor(71, 85, 105)
  doc.text('Sous-total :', 115, y + 8)
  doc.text(`${order.subtotal.toLocaleString('fr-FR')} FCFA`, 190, y + 8, { align: 'right' })

  doc.text('Frais de livraison fixe :', 115, y + 15)
  doc.text(`${order.shipping_cost.toLocaleString('fr-FR')} FCFA`, 190, y + 15, { align: 'right' })

  // Bandeau Total Réglé (#0f172a)
  doc.setFillColor(15, 23, 42)
  doc.roundedRect(112, y + 19, 81, 11, 2, 2, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(245, 158, 11) // Gold
  doc.text('TOTAL RÉGLÉ :', 116, y + 26)
  doc.text(`${order.total.toLocaleString('fr-FR')} FCFA`, 190, y + 26, { align: 'right' })

  // ── 5. BADGE DE SÉCURITÉ ET PIED DE PAGE ──
  y += 44

  // Badge de certification
  doc.setFillColor(236, 253, 245) // Emerald 50
  doc.setDrawColor(167, 243, 208)
  doc.roundedRect(15, y, 180, 10, 2, 2, 'FD')

  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(5, 150, 105) // Emerald 600
  doc.text('DOCUMENT OFFICIEL ÉLECRONIQUEMENT VALIDÉ PAR BRICELO CAMEROUN', 105, y + 6.5, { align: 'center' })

  // Pied de page légal
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(148, 163, 184)
  doc.text('BRICELO Cameroun S.A.R.L — Douala & Yaoundé — Assistance WhatsApp : +237 6 52 70 42 18 — E-mail : bricelo237@gmail.com', 105, 285, { align: 'center' })

  // Déclencher le téléchargement du PDF
  const filename = `Facture_BRICELO_${order.id.slice(0, 8).toUpperCase()}.pdf`
  doc.save(filename)
}

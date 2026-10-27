import jsPDF from 'jspdf'
import {
  BRICELO_LOGO_BASE64,
  BRICELO_SIGNATURE_BASE64,
  BRICELO_MERCI_BASE64,
} from '@/lib/pdf-assets'

/**
 * Formate un montant en utilisant le point '.' comme séparateur de milliers
 * (ex: 13.900 au lieu de 13/900 ou 13 900)
 */
export function formatMoneyPDF(amount: number): string {
  const rounded = Math.round(amount || 0)
  return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/**
 * Dessine une ligne en tirets avec espacement régulier, compatible avec tous les moteurs jsPDF
 */
function drawDashedLine(
  doc: jsPDF,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  dashLen = 2.2,
  gapLen = 1.6
) {
  const dx = x2 - x1
  const dy = y2 - y1
  const dist = Math.sqrt(dx * dx + dy * dy)
  const steps = Math.floor(dist / (dashLen + gapLen))
  const stepX = (dx / dist) * (dashLen + gapLen)
  const stepY = (dy / dist) * (dashLen + gapLen)
  const dX = (dx / dist) * dashLen
  const dY = (dy / dist) * dashLen

  for (let i = 0; i < steps; i++) {
    const startX = x1 + i * stepX
    const startY = y1 + i * stepY
    doc.line(startX, startY, startX + dX, startY + dY)
  }
}

/**
 * Dessine les ailes géométriques stylisées de part et d'autre de l'en-tête (style facture de référence)
 */
function drawWings(doc: jsPDF, y: number) {
  doc.setDrawColor(217, 119, 6) // Amber #d97706
  doc.setLineWidth(0.8)

  // Aile gauche
  doc.line(32, y, 68, y)
  doc.line(68, y, 54, y + 4.5)
  doc.line(54, y + 4.5, 38, y + 4.5)
  doc.line(38, y + 4.5, 32, y)

  // Aile droite
  doc.line(178, y, 142, y)
  doc.line(142, y, 156, y + 4.5)
  doc.line(156, y + 4.5, 172, y + 4.5)
  doc.line(172, y + 4.5, 178, y)
}

export function buildOrderReceiptDoc(order: {
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
    snapshot?: {
      name?: string
      variant_name?: string
      sku?: string
      image?: string
      unit_price?: number
    } | null
  }>
}): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const year = new Date(order.created_at).getFullYear()
  const orderRef = order.id.slice(0, 8).toUpperCase()
  const invoiceNum = `BRC-${year}-${orderRef}`

  const dateStr = new Date(order.created_at).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  const addr = order.shipping_address || {}
  const clientName = addr.full_name || 'Client BRICÉLO'
  const clientPhone = addr.phone ? `Tél : ${addr.phone}` : 'Tél : Non renseigné'
  const clientAddress =
    addr.address_line1 || addr.address_line || addr.quartier || 'Adresse de livraison'
  const clientCity = addr.city || 'Douala'

  let payMethod = 'À la livraison (Cash)'
  if (order.payment_method === 'om' || order.payment_method === 'orange_money') {
    payMethod = 'Orange Money (OM)'
  } else if (order.payment_method === 'momo' || order.payment_method === 'mtn_momo') {
    payMethod = 'MTN Mobile Money'
  } else if (order.payment_method === 'card') {
    payMethod = 'Carte bancaire'
  }

  const statusFr =
    order.status === 'delivered'
      ? 'Livrée'
      : order.status === 'confirmed'
      ? 'Confirmée'
      : order.status === 'shipped'
      ? 'En cours de livraison'
      : order.status === 'cancelled'
      ? 'Annulée'
      : 'En attente'

  // ── 1. TITRE HAUT AVEC ÉTOILES ★ FACTURE ★ ──
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(217, 119, 6) // Amber #d97706
  doc.text('★', 70, 16, { align: 'center' })
  doc.text('★', 140, 16, { align: 'center' })

  doc.setTextColor(13, 27, 46) // Navy 900
  doc.text('FACTURE', 105, 16, { align: 'center' })

  // ── 2. LOGO BRICÉLO ET AILES DÉCORATIVES ──
  drawWings(doc, 25)
  try {
    doc.addImage(BRICELO_LOGO_BASE64, 'JPEG', 82, 19, 46, 14)
  } catch {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.setTextColor(245, 158, 11)
    doc.text('BRICÉLO.cm', 105, 27, { align: 'center' })
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(13, 27, 46)
  doc.text('BRICÉLO CAMEROUN S.A.R.L', 105, 37, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(100, 116, 139)
  doc.text('Marketplace N°1 au Cameroun • Douala & Yaoundé', 105, 41, { align: 'center' })
  doc.text(
    'Tél / WhatsApp : (+237) 6 52 70 42 18 • contact@bricelo.cm • www.bricelo.cm',
    105,
    45,
    { align: 'center' }
  )

  // ── 3. SÉPARATEUR TIRETS AVEC CHEVRONS »» - - - «« ──
  const sep1Y = 49
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(217, 119, 6) // Amber #d97706
  doc.text('»»', 15, sep1Y + 0.8)
  doc.text('««', 195, sep1Y + 0.8, { align: 'right' })

  doc.setDrawColor(217, 119, 6)
  doc.setLineWidth(0.5)
  drawDashedLine(doc, 23, sep1Y, 187, sep1Y)

  // ── 4. COLONNES D'INFORMATIONS METADATA (ENVOYÉ À RETIRÉ) ──
  const metaY = 56

  // Colonne Gauche : FACTURÉ À
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(217, 119, 6)
  doc.text('FACTURÉ À', 15, metaY)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(13, 27, 46)
  doc.text(clientName.slice(0, 36), 15, metaY + 5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(71, 85, 105)
  doc.text(clientPhone, 15, metaY + 9.5)
  doc.text(`Adresse : ${clientAddress.slice(0, 40)}`, 15, metaY + 14)
  doc.text(`Ville : ${clientCity}, Cameroun`, 15, metaY + 18.5)

  // Colonne Droite : DÉTAILS DE LA COMMANDE
  const colRightLabelX = 125
  const colRightValX = 195

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(217, 119, 6)
  doc.text('DÉTAILS COMMANDE', colRightLabelX, metaY)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(217, 119, 6)
  doc.text('FACTURE N°', colRightLabelX, metaY + 5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(13, 27, 46)
  doc.text(invoiceNum, colRightValX, metaY + 5, { align: 'right' })

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(217, 119, 6)
  doc.text('DATE', colRightLabelX, metaY + 9.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(13, 27, 46)
  doc.text(dateStr, colRightValX, metaY + 9.5, { align: 'right' })

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(217, 119, 6)
  doc.text('COMMANDE N°', colRightLabelX, metaY + 14)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(13, 27, 46)
  doc.text(`#${orderRef}`, colRightValX, metaY + 14, { align: 'right' })

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(217, 119, 6)
  doc.text('PAIEMENT', colRightLabelX, metaY + 18.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(13, 27, 46)
  doc.text(payMethod, colRightValX, metaY + 18.5, { align: 'right' })

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(217, 119, 6)
  doc.text('STATUT', colRightLabelX, metaY + 23)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(13, 27, 46)
  doc.text(statusFr, colRightValX, metaY + 23, { align: 'right' })

  // ── 5. TABLEAU DES ARTICLES (MONTANTS AVEC SÉPARATEUR POINT '.') ──
  let tableY = 85
  doc.setFillColor(13, 27, 46) // Navy 900
  doc.rect(15, tableY, 180, 8.5, 'F')

  // Liseré or supérieur sur l'en-tête de tableau
  doc.setFillColor(245, 176, 0)
  doc.rect(15, tableY, 180, 0.8, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(255, 255, 255)
  doc.text('QTÉ', 22, tableY + 5.8, { align: 'center' })
  doc.text('DÉSIGNATION', 35, tableY + 5.8)
  doc.text('PRIX UNIT. (FCFA)', 150, tableY + 5.8, { align: 'right' })
  doc.text('MONTANT (FCFA)', 190, tableY + 5.8, { align: 'right' })

  tableY += 8.5

  order.order_items.forEach((item, idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor(255, 255, 255)
    } else {
      doc.setFillColor(248, 250, 252)
    }
    doc.rect(15, tableY, 180, 8.5, 'F')

    doc.setDrawColor(241, 245, 249)
    doc.setLineWidth(0.3)
    doc.line(15, tableY + 8.5, 195, tableY + 8.5)

    const baseName = item.snapshot?.name || item.product?.name || 'Article BRICÉLO'
    const varName = item.snapshot?.variant_name || null
    let fullName = baseName
    if (varName) fullName += ` (${varName})`

    const truncated = fullName.length > 52 ? fullName.slice(0, 49) + '...' : fullName
    const itemTotal = item.quantity * item.unit_price

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(15, 23, 42)
    doc.text(String(item.quantity), 22, tableY + 5.5, { align: 'center' })
    doc.text(truncated, 35, tableY + 5.5)
    doc.text(`${formatMoneyPDF(item.unit_price)} F`, 150, tableY + 5.5, { align: 'right' })

    doc.setFont('helvetica', 'bold')
    doc.text(`${formatMoneyPDF(itemTotal)} FCFA`, 190, tableY + 5.5, { align: 'right' })

    tableY += 8.5

    // Si la liste est longue, on saute de page proprement
    if (tableY > 210) {
      doc.addPage()
      tableY = 20
    }
  })

  // ── 6. RÉCAPITULATIF FINANCIER & SIGNATURE (SÉPARATEUR POINT '.') ──
  tableY += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(100, 116, 139)
  doc.text('Sous-total :', 135, tableY)
  doc.setTextColor(15, 23, 42)
  doc.text(`${formatMoneyPDF(order.subtotal)} FCFA`, 190, tableY, { align: 'right' })

  tableY += 5.5
  doc.setTextColor(100, 116, 139)
  doc.text('Frais de livraison :', 135, tableY)
  doc.setTextColor(15, 23, 42)
  const shippingStr =
    order.shipping_cost > 0
      ? `${formatMoneyPDF(order.shipping_cost)} FCFA`
      : 'Offert'
  doc.text(shippingStr, 190, tableY, { align: 'right' })

  tableY += 7.5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(13, 27, 46)
  doc.text('TOTAL', 135, tableY)
  doc.setTextColor(217, 119, 6) // Amber #d97706
  doc.text(`${formatMoneyPDF(order.total)} FCFA`, 190, tableY, { align: 'right' })

  // ── 7. SIGNATURE AUTHENTIQUE BRICÉLO ──
  tableY += 3
  try {
    doc.addImage(BRICELO_SIGNATURE_BASE64, 'PNG', 135, tableY, 55, 22)
  } catch {
    doc.setFont('helvetica', 'bolditalic')
    doc.setFontSize(14)
    doc.setTextColor(13, 27, 46)
    doc.text('Bricélo', 160, tableY + 12, { align: 'center' })
  }

  tableY += 23
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(7.5)
  doc.setTextColor(100, 116, 139)
  doc.text('Pour BRICÉLO Cameroun', 162, tableY, { align: 'center' })
  doc.text('Service des Commandes & Expéditions', 162, tableY + 3.5, { align: 'center' })

  // ── 8. SÉPARATEUR INFÉRIEUR AVEC CHEVRONS »» - - - «« ──
  const botSepY = 246
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(217, 119, 6)
  doc.text('»»', 15, botSepY + 0.8)
  doc.text('««', 195, botSepY + 0.8, { align: 'right' })

  doc.setDrawColor(217, 119, 6)
  doc.setLineWidth(0.5)
  drawDashedLine(doc, 23, botSepY, 187, botSepY)

  // ── 9. CONDITIONS LOCALISÉES AU CAMEROUN & GRAND MERCI STYLISÉ ──
  const footY = 254
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(217, 119, 6)
  doc.text('CONDITIONS ET MODALITÉS DE LIVRAISON', 15, footY)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(71, 85, 105)
  doc.text(
    '• Paiement comptant à la livraison (Cash) ou via Mobile Money (Orange Money / MTN MoMo).',
    15,
    footY + 4.5
  )
  doc.text(
    "• Veuillez vérifier la conformité et l'état de votre colis dès sa remise par le coursier.",
    15,
    footY + 8.5
  )
  doc.text(
    '• Retours et échanges acceptés sous 48h selon les conditions générales de vente Bricélo.',
    15,
    footY + 12.5
  )
  doc.text(
    '• Service Client & Réclamations : WhatsApp (+237 6 52 70 42 18) — contact@bricelo.cm',
    15,
    footY + 16.5
  )

  // Grand "Merci" stylisé en bas à droite
  try {
    doc.addImage(BRICELO_MERCI_BASE64, 'PNG', 145, footY - 1, 46, 16)
  } catch {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(26)
    doc.setTextColor(217, 119, 6)
    doc.text('Merci', 168, footY + 10, { align: 'center' })
  }

  return doc
}

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
    snapshot?: {
      name?: string
      variant_name?: string
      sku?: string
      image?: string
      unit_price?: number
    } | null
  }>
}) {
  const doc = buildOrderReceiptDoc(order)
  const orderRef = order.id.slice(0, 8).toUpperCase()
  const filename = `Facture_BRICELO_${orderRef}.pdf`
  doc.save(filename)
}

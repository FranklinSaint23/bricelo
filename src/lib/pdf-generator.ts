import jsPDF from 'jspdf'

export function generateOrderReceiptPDF(order: {
  id: string
  created_at: string
  status: string
  subtotal: number
  shipping_cost: number
  total: number
  shipping_address: Record<string, string> | null
  order_items: Array<{
    quantity: number
    unit_price: number
    product?: { name: string } | null
  }>
}) {
  const doc = new jsPDF()

  // Header Banner
  doc.setFillColor(11, 25, 44) // Navy
  doc.rect(0, 0, 210, 35, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('BRICELO', 15, 22)

  doc.setTextColor(255, 153, 0) // Gold
  doc.setFontSize(14)
  doc.text('.com', 56, 22)

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'normal')
  doc.text('REÇU DE COMMANDE', 135, 22)

  // Order Info Section
  doc.setTextColor(30, 41, 59)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text(`N° Commande: #${order.id.slice(0, 8).toUpperCase()}`, 15, 48)

  doc.setFont('helvetica', 'normal')
  const dateStr = new Date(order.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  doc.text(`Date: ${dateStr}`, 15, 54)
  const statusFr = order.status === 'delivered' ? 'Livrée' : order.status === 'confirmed' ? 'Confirmée' : order.status === 'shipped' ? 'En livraison' : 'En attente'
  doc.text(`Statut: ${statusFr}`, 15, 60)

  // Delivery Address
  if (order.shipping_address) {
    const addr = order.shipping_address
    doc.setFont('helvetica', 'bold')
    doc.text('Adresse de livraison:', 120, 48)
    doc.setFont('helvetica', 'normal')
    doc.text(`${addr.full_name || ''}`, 120, 54)
    const line1 = addr.address_line1 || addr.address_line || ''
    if (line1) doc.text(line1, 120, 60)
    doc.text(`${addr.city || 'Cameroun'} ${addr.phone ? '• Tel: ' + addr.phone : ''}`, 120, line1 ? 66 : 60)
  }

  // Table Header
  let y = 78
  doc.setFillColor(241, 245, 249) // Light slate
  doc.rect(15, y - 5, 180, 8, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(15, 23, 42)
  doc.text('Article', 18, y)
  doc.text('Qté', 115, y)
  doc.text('Prix Unitaire', 135, y)
  doc.text('Total', 170, y)

  // Table Items
  doc.setFont('helvetica', 'normal')
  y += 8

  for (const item of order.order_items) {
    const name = item.product?.name ?? 'Produit'
    const truncatedName = name.length > 45 ? name.slice(0, 42) + '...' : name
    const itemTotal = item.unit_price * item.quantity

    doc.text(truncatedName, 18, y)
    doc.text(String(item.quantity), 118, y)
    doc.text(`${item.unit_price.toLocaleString('fr-FR')} FCFA`, 135, y)
    doc.text(`${itemTotal.toLocaleString('fr-FR')} FCFA`, 170, y)

    y += 8
    if (y > 260) {
      doc.addPage()
      y = 20
    }
  }

  // Separator Line
  y += 4
  doc.setDrawColor(226, 232, 240)
  doc.line(15, y, 195, y)
  y += 8

  // Total Summary
  doc.setFont('helvetica', 'normal')
  doc.text('Sous-total:', 125, y)
  doc.text(`${order.subtotal.toLocaleString('fr-FR')} FCFA`, 170, y)

  y += 6
  doc.text('Frais de livraison:', 125, y)
  doc.text(`${order.shipping_cost > 0 ? order.shipping_cost.toLocaleString('fr-FR') + ' FCFA' : 'Gratuit'}`, 170, y)

  y += 8
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(11, 25, 44)
  doc.text('TOTAL PAYÉ:', 125, y)
  doc.text(`${order.total.toLocaleString('fr-FR')} FCFA`, 170, y)

  // Footer Note
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(148, 163, 184)
  doc.text('Merci pour votre confiance sur BRICELO.com ! Service client WhatsApp: +237 6 52 70 42 18', 105, 285, { align: 'center' })

  // Trigger PDF file download
  doc.save(`Recu_BRICELO_${order.id.slice(0, 8).toUpperCase()}.pdf`)
}

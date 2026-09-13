import { getAdminClient } from '@/lib/supabase/admin'

export async function decrementStockForOrder(orderId: string) {
  try {
    const adminClient = getAdminClient()

    // Récupérer les articles de la commande
    const { data: items, error: itemsErr } = await adminClient
      .from('order_items')
      .select('product_id, variant_id, quantity')
      .eq('order_id', orderId)

    if (itemsErr || !items || items.length === 0) return

    for (const item of items) {
      if (item.product_id && item.quantity > 0) {
        // 1. Décrémenter le stock du produit principal (si non-variable)
        const { data: prod } = await adminClient
          .from('products')
          .select('stock, product_type')
          .eq('id', item.product_id)
          .maybeSingle()

        if (prod && prod.product_type !== 'variable') {
          const currentStock = Number(prod.stock ?? 0)
          const newStock = Math.max(0, currentStock - item.quantity)
          await adminClient
            .from('products')
            .update({ stock: newStock })
            .eq('id', item.product_id)
        }

        // 2. Décrémenter le stock de la variante si présente (produits à variantes)
        if (item.variant_id) {
          const { data: variant } = await adminClient
            .from('product_variants')
            .select('stock, stock_quantity, status')
            .eq('id', item.variant_id)
            .maybeSingle()

          if (variant) {
            const currentVarStock = Number((variant as any).stock_quantity ?? (variant as any).stock ?? 0)
            const newVarStock = Math.max(0, currentVarStock - item.quantity)
            const newStatus = newVarStock === 0 ? 'out_of_stock' : (variant.status === 'out_of_stock' ? 'active' : variant.status)

            await adminClient
              .from('product_variants')
              .update({
                stock: newVarStock,
                stock_quantity: newVarStock,
                status: newStatus,
              })
              .eq('id', item.variant_id)
          }
        }
      }
    }
  } catch (err) {
    console.error('[decrementStockForOrder] Erreur lors de la décrémentation du stock:', err)
  }
}

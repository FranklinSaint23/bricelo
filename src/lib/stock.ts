import { getAdminClient } from '@/lib/supabase/admin'

export async function decrementStockForOrder(orderId: string) {
  const adminClient = getAdminClient()

  // Récupérer les articles de la commande
  const { data: items } = await adminClient
    .from('order_items')
    .select('product_id, variant_id, quantity')
    .eq('order_id', orderId)

  if (!items || items.length === 0) return

  for (const item of items) {
    if (item.product_id && item.quantity > 0) {
      // 1. Décrémenter le stock du produit principal
      const { data: prod } = await adminClient
        .from('products')
        .select('stock')
        .eq('id', item.product_id)
        .single()

      if (prod) {
        const newStock = Math.max(0, (prod.stock ?? 0) - item.quantity)
        await adminClient
          .from('products')
          .update({ stock: newStock })
          .eq('id', item.product_id)
      }

      // 2. Décrémenter le stock du variant si présent
      if (item.variant_id) {
        const { data: variant } = await adminClient
          .from('product_variants')
          .select('stock')
          .eq('id', item.variant_id)
          .single()

        if (variant) {
          const newVarStock = Math.max(0, (variant.stock ?? 0) - item.quantity)
          await adminClient
            .from('product_variants')
            .update({ stock: newVarStock })
            .eq('id', item.variant_id)
        }
      }
    }
  }
}

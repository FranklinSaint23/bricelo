'use server'

import { decrementStockForOrder } from '@/lib/stock'

export async function processCashOrderStock(orderId: string) {
  try {
    await decrementStockForOrder(orderId)
    return { success: true }
  } catch (err) {
    console.error('[processCashOrderStock] Erreur:', err)
    return { error: 'Erreur décrémentation stock' }
  }
}

import { SupabaseClient } from '@supabase/supabase-js'
import { ProductOption, AdvancedProductVariant } from '@/types/variants'

export async function saveProductOptionsAndVariants(
  supabase: SupabaseClient,
  productId: string,
  hasVariants: boolean,
  options: ProductOption[],
  variants: AdvancedProductVariant[]
) {
  if (!productId) return

  // Si le produit n'a pas de variantes, nettoyer les anciennes options et variantes
  if (!hasVariants || options.length === 0 || variants.length === 0) {
    await supabase.from('product_options').delete().eq('product_id', productId)
    await supabase.from('product_variants').delete().eq('product_id', productId)
    return
  }

  // 1. Supprimer les anciennes options (la suppression en cascade supprime product_option_values)
  await supabase.from('product_options').delete().eq('product_id', productId)
  await supabase.from('product_variants').delete().eq('product_id', productId)

  // 2. Insérer les nouvelles options
  const optionValueIdMap = new Map<string, string>() // Key: "optionName|valText" => option_value_id

  for (let i = 0; i < options.length; i++) {
    const opt = options[i]
    const { data: newOpt, error: optErr } = await supabase
      .from('product_options')
      .insert({
        product_id: productId,
        name: opt.name.trim(),
        display_type: opt.display_type || 'button',
        position: i,
        required: true,
      })
      .select('id')
      .single()

    if (optErr || !newOpt) {
      console.error('[VariantSaver] Erreur création product_option:', optErr)
      continue
    }

    const optionId = newOpt.id

    // Insérer les valeurs d'options
    const valRows = opt.values.map((v, valIdx) => ({
      product_option_id: optionId,
      value: v.value.trim(),
      label: v.label?.trim() || v.value.trim(),
      position: valIdx,
      metadata: v.metadata || {},
      is_active: v.is_active ?? true,
    }))

    const { data: insertedVals, error: valErr } = await supabase
      .from('product_option_values')
      .insert(valRows)
      .select('id, value')

    if (valErr || !insertedVals) {
      console.error('[VariantSaver] Erreur insertion product_option_values:', valErr)
      continue
    }

    for (const valObj of insertedVals) {
      const mapKey = `${opt.name.trim().toLowerCase()}|${valObj.value.trim().toLowerCase()}`
      optionValueIdMap.set(mapKey, valObj.id)
    }
  }

  // 3. Insérer les variantes SKU (product_variants)
  for (const v of variants) {
    const { data: newVariant, error: varErr } = await supabase
      .from('product_variants')
      .insert({
        product_id: productId,
        name: v.option_values?.map((o) => o.value).join(' / ') || 'Variante',
        value: v.combination_key || 'defaut',
        price_adjustment: 0,
        price: v.price || 0,
        direct_price: v.price || 0,
        compare_at_price: v.compare_at_price || null,
        stock_quantity: v.stock_quantity || 0,
        stock: v.stock_quantity || 0,
        weight: v.weight_kg || v.weight || null,
        weight_kg: v.weight_kg || v.weight || null,
        length_cm: v.length_cm || null,
        width_cm: v.width_cm || null,
        height_cm: v.height_cm || null,
        sku: v.sku?.trim() || null,
        description: v.description?.trim() || null,
        status: v.status || 'active',
        combination_key: v.combination_key || null,
      })
      .select('id')
      .single()

    if (varErr || !newVariant) {
      console.error('[VariantSaver] Erreur insertion product_variant:', varErr)
      continue
    }

    const variantId = newVariant.id

    // 4. Insérer les liaisons pivots (product_variant_values)
    if (v.option_values && v.option_values.length > 0) {
      const pivotRows = []
      for (const optVal of v.option_values) {
        // Trouver la valeur par id d'option et valeur
        const mapKey = `${optVal.value.trim().toLowerCase()}`
        let valId: string | undefined = undefined

        for (const [key, id] of optionValueIdMap.entries()) {
          if (key.endsWith(`|${mapKey}`)) {
            valId = id
            break
          }
        }

        if (valId) {
          pivotRows.push({
            variant_id: variantId,
            option_value_id: valId,
          })
        }
      }

      if (pivotRows.length > 0) {
        await supabase.from('product_variant_values').insert(pivotRows)
      }
    }

    // 5. Insérer les images spécifiques de la variante
    if (v.images && v.images.length > 0) {
      const imgRows = v.images.map((img, imgIdx) => ({
        variant_id: variantId,
        url: img.url,
        position: imgIdx,
        alt: img.alt || null,
      }))
      await supabase.from('variant_images').insert(imgRows)
    }
  }
}

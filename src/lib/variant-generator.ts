import { ProductOption, ProductOptionValue, AdvancedProductVariant } from '@/types/variants'
import { slugify } from '@/lib/utils'

export const MAX_VARIANTS_LIMIT = 500

/**
 * Génère la clé de combinaison déterministe (triée et en minuscules)
 * Exemple: "noir|256go"
 */
export function generateCombinationKey(values: ProductOptionValue[]): string {
  return values
    .map((v) => slugify(v.value))
    .sort()
    .join('|')
}

/**
 * Génère un SKU automatique propre d'après le nom du produit et la combinaison
 * Exemple: Nom = "T-Shirt Premium", Combinaison = ["Noir", "XL"] => "TSH-NOI-XL"
 */
export function generateSKU(productName: string, values: ProductOptionValue[]): string {
  const prefix = productName
    .split(' ')
    .map((w) => w.substring(0, 3).toUpperCase())
    .join('')
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 8)

  const valSuffix = values
    .map((v) => v.value.substring(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, ''))
    .join('-')

  return `${prefix}-${valSuffix}`
}

/**
 * Calcul le produit cartésien de toutes les valeurs d'options
 */
export function generateVariantMatrix(
  options: ProductOption[],
  basePrice: number,
  baseStock: number,
  productName: string,
  existingVariants: AdvancedProductVariant[] = []
): { variants: AdvancedProductVariant[]; totalCount: number; excedesLimit: boolean } {
  // Filtrer les options qui possèdent au moins 1 valeur active
  const activeOptions = options.filter((opt) => opt.values.some((v) => v.is_active && v.value.trim() !== ''))

  if (activeOptions.length === 0) {
    return { variants: [], totalCount: 0, excedesLimit: false }
  }

  // Calcul du nombre total théorique de variantes
  const totalCount = activeOptions.reduce((acc, opt) => {
    const validVals = opt.values.filter((v) => v.is_active && v.value.trim() !== '')
    return acc * (validVals.length || 1)
  }, 1)

  if (totalCount > MAX_VARIANTS_LIMIT) {
    return { variants: [], totalCount, excedesLimit: true }
  }

  // Carte des clés existantes pour préserver prix et stock modifiés par le vendeur
  const existingMap = new Map<string, AdvancedProductVariant>()
  existingVariants.forEach((v) => {
    if (v.combination_key) {
      existingMap.set(v.combination_key.toLowerCase().trim(), v)
      const normKey = v.combination_key.split(/[\s|/:-]+/).map((s: string) => slugify(s)).sort().join('|')
      existingMap.set(normKey, v)
    }
    if (v.option_values && v.option_values.length > 0) {
      const optKey = generateCombinationKey(v.option_values as any)
      existingMap.set(optKey, v)
    }
  })

  // Fonction récursive de produit cartésien
  function cartesian(optionIndex: number, currentCombo: ProductOptionValue[]): ProductOptionValue[][] {
    if (optionIndex === activeOptions.length) {
      return [currentCombo]
    }

    const currentOption = activeOptions[optionIndex]
    const validValues = currentOption.values.filter((v) => v.is_active && v.value.trim() !== '')
    let results: ProductOptionValue[][] = []

    for (const val of validValues) {
      results = results.concat(cartesian(optionIndex + 1, [...currentCombo, val]))
    }

    return results
  }

  const combinations = cartesian(0, [])

  const variants: AdvancedProductVariant[] = combinations.map((combo) => {
    const key = generateCombinationKey(combo)
    const normKey = combo.map((c) => slugify(c.value)).sort().join('|')
    const existing = existingMap.get(key) || existingMap.get(normKey) || existingVariants.find((ev) => {
      const evVals = (ev.option_values ?? []).map((o: any) => slugify(o.value)).sort().join('|')
      return evVals === normKey
    })

    if (existing) {
      const vPrice = Number(existing.price) || Number((existing as any).direct_price) || 0
      const vStock = Number(existing.stock_quantity ?? (existing as any).stock ?? 0)
      return {
        ...existing,
        combination_key: key,
        option_values: combo,
        price: vPrice > 0 ? vPrice : (basePrice > 0 ? basePrice : 1000),
        stock_quantity: vStock >= 0 ? vStock : (baseStock > 0 ? baseStock : 10),
      }
    }

    return {
      sku: generateSKU(productName, combo),
      price: basePrice > 0 ? basePrice : 1000,
      compare_at_price: null,
      stock_quantity: baseStock > 0 ? baseStock : 10,
      weight: null,
      description: '',
      status: 'active',
      combination_key: key,
      option_values: combo,
      images: [],
    }
  })

  return { variants, totalCount, excedesLimit: false }
}

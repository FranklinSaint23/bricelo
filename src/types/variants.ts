// Types pour le système générique & relationnel de variantes produits (BRICELO)

export type DisplayType = 'button' | 'color' | 'image' | 'select' | 'radio'
export type VariantStatus = 'active' | 'inactive' | 'out_of_stock'

export interface ProductOptionValue {
  id?: string
  product_option_id?: string
  value: string
  label?: string | null
  position: number
  metadata?: {
    hex?: string
    image_url?: string
  } | null
  is_active: boolean
}

export interface ProductOption {
  id?: string
  product_id?: string
  name: string
  display_type: DisplayType
  position: number
  required: boolean
  values: ProductOptionValue[]
}

export interface VariantImage {
  id?: string
  variant_id?: string
  url: string
  position: number
  alt?: string | null
}

export interface AdvancedProductVariant {
  id?: string
  product_id?: string
  sku: string | null
  price: number
  compare_at_price?: number | null
  stock_quantity: number
  weight?: number | null
  description?: string | null
  status: VariantStatus
  combination_key: string // ex: "noir|256go"
  option_values?: ProductOptionValue[]
  images?: VariantImage[]
}

// Presets de types de produits pour pré-remplir les options dans le formulaire vendeur
export interface ProductTypePreset {
  id: string
  categoryLabel: string
  iconName: string
  description: string
  defaultOptions: {
    name: string
    display_type: DisplayType
    defaultValues: { value: string; label?: string; hex?: string }[]
  }[]
}

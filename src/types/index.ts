export type Role = 'customer' | 'vendor' | 'admin' | 'support'

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned'

export type PaymentStatus = 'pending' | 'success' | 'failed' | 'cancelled'

export interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  role: Role
  created_at: string
}

export interface Address {
  id: string
  user_id: string
  label: string
  full_name: string
  phone: string
  address_line: string
  city: string
  country: string
  is_default: boolean
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  parent_id: string | null
  children?: Category[]
}

export interface Store {
  id: string
  user_id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  banner_url: string | null
  rating: number
  review_count: number
  is_active: boolean
  created_at: string
}

export interface ProductVariant {
  id: string
  product_id: string
  name: string
  value: string
  price_adjustment: number
  stock: number
  sku: string | null
}

export interface Product {
  id: string
  store_id: string
  category_id: string
  name: string
  slug: string
  description: string
  price: number
  compare_at_price: number | null
  stock: number
  images: string[]
  rating: number
  review_count: number
  is_active: boolean
  is_featured: boolean
  promo_ends_at?: string | null
  created_at: string
  store?: Store
  category?: Category
  variants?: ProductVariant[]
}

export interface CartItem {
  id: string
  product_id: string
  variant_id: string | null
  quantity: number
  product: Product
  variant?: ProductVariant
}

export interface Order {
  id: string
  user_id: string
  store_id: string
  status: OrderStatus
  subtotal: number
  shipping_cost: number
  total: number
  shipping_address: Address
  created_at: string
  updated_at: string
  items?: OrderItem[]
  payment?: Payment
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  variant_id: string | null
  quantity: number
  unit_price: number
  total_price: number
  product?: Product
}

export interface Payment {
  id: string
  order_id: string
  transaction_ref: string
  amount: number
  currency: string
  status: PaymentStatus
  provider: 'campay' | 'cinetpay'
  created_at: string
}

export interface Review {
  id: string
  product_id: string
  user_id: string
  order_id: string
  rating: number
  comment: string | null
  created_at: string
  user?: Pick<User, 'id' | 'full_name' | 'avatar_url'>
}

export interface Notification {
  id: string
  user_id: string
  title: string
  body: string
  type: 'order' | 'payment' | 'system'
  is_read: boolean
  created_at: string
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  page_size: number
  total_pages: number
}

export * from './variants'

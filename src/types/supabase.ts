export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          role: 'customer' | 'vendor' | 'admin' | 'support'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      addresses: {
        Row: {
          id: string
          user_id: string
          label: string
          full_name: string
          phone: string
          address_line: string
          city: string
          country: string
          is_default: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['addresses']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['addresses']['Insert']>
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          parent_id: string | null
          sort_order: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['categories']['Insert']>
      }
      stores: {
        Row: {
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
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['stores']['Row'], 'id' | 'created_at' | 'updated_at' | 'rating' | 'review_count'>
        Update: Partial<Database['public']['Tables']['stores']['Insert']>
      }
      products: {
        Row: {
          id: string
          store_id: string
          category_id: string | null
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
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at' | 'rating' | 'review_count'>
        Update: Partial<Database['public']['Tables']['products']['Insert']>
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          name: string
          value: string
          price_adjustment: number
          stock: number
          sku: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['product_variants']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['product_variants']['Insert']>
      }
      cart_items: {
        Row: {
          id: string
          user_id: string
          product_id: string
          variant_id: string | null
          quantity: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['cart_items']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['cart_items']['Insert']>
      }
      orders: {
        Row: {
          id: string
          user_id: string
          store_id: string
          status: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled' | 'returned'
          subtotal: number
          shipping_cost: number
          total: number
          shipping_address: Json
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['orders']['Insert']>
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          variant_id: string | null
          quantity: number
          unit_price: number
          total_price: number
          snapshot: Json
        }
        Insert: Omit<Database['public']['Tables']['order_items']['Row'], 'id'>
        Update: never
      }
      payments: {
        Row: {
          id: string
          order_id: string
          transaction_ref: string
          amount: number
          currency: string
          status: 'pending' | 'success' | 'failed' | 'cancelled'
          provider: string
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['payments']['Insert']>
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          user_id: string
          order_id: string
          rating: number
          comment: string | null
          is_visible: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          body: string
          type: 'order' | 'payment' | 'system'
          is_read: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }
      ai_conversations: {
        Row: { id: string; user_id: string | null; session_id: string; created_at: string }
        Insert: Omit<Database['public']['Tables']['ai_conversations']['Row'], 'id' | 'created_at'>
        Update: never
      }
      ai_messages: {
        Row: { id: string; conversation_id: string; role: 'user' | 'assistant'; content: string; created_at: string }
        Insert: Omit<Database['public']['Tables']['ai_messages']['Row'], 'id' | 'created_at'>
        Update: never
      }
      audit_logs: {
        Row: { id: string; user_id: string | null; action: string; entity: string; entity_id: string | null; metadata: Json | null; created_at: string }
        Insert: Omit<Database['public']['Tables']['audit_logs']['Row'], 'id' | 'created_at'>
        Update: never
      }
    }
    Views: Record<string, never>
    Functions: {
      is_admin:    { Args: Record<string, never>; Returns: boolean }
      is_vendor:   { Args: Record<string, never>; Returns: boolean }
      owns_store:  { Args: { store_id: string };  Returns: boolean }
    }
    Enums: {
      user_role:      'customer' | 'vendor' | 'admin' | 'support'
      order_status:   'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled' | 'returned'
      payment_status: 'pending' | 'success' | 'failed' | 'cancelled'
      notif_type:     'order' | 'payment' | 'system'
    }
  }
}

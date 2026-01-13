export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          display_name: string | null
          stripe_connect_id: string | null
          payout_enabled: boolean
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          display_name?: string | null
          stripe_connect_id?: string | null
          payout_enabled?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          stripe_connect_id?: string | null
          payout_enabled?: boolean
          created_at?: string
        }
      }
      generations: {
        Row: {
          id: string
          user_id: string | null
          session_id: string | null
          mode: string
          source_images: string[]
          prompt: string | null
          settings: Json | null
          result_url: string | null
          thumbnail_url: string | null
          transmission_number: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          mode: string
          source_images: string[]
          prompt?: string | null
          settings?: Json | null
          result_url?: string | null
          thumbnail_url?: string | null
          transmission_number?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          mode?: string
          source_images?: string[]
          prompt?: string | null
          settings?: Json | null
          result_url?: string | null
          thumbnail_url?: string | null
          transmission_number?: number
          created_at?: string
        }
      }
      purchases: {
        Row: {
          id: string
          user_id: string | null
          generation_id: string
          printful_order_id: string | null
          product_type: string | null
          amount_cents: number
          stripe_payment_id: string | null
          status: string
          hall_submission_unlocked: boolean
          hall_submission_used: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          generation_id: string
          printful_order_id?: string | null
          product_type?: string | null
          amount_cents: number
          stripe_payment_id?: string | null
          status?: string
          hall_submission_unlocked?: boolean
          hall_submission_used?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          generation_id?: string
          printful_order_id?: string | null
          product_type?: string | null
          amount_cents?: number
          stripe_payment_id?: string | null
          status?: string
          hall_submission_unlocked?: boolean
          hall_submission_used?: boolean
          created_at?: string
        }
      }
      hall_submissions: {
        Row: {
          id: string
          user_id: string
          generation_id: string
          purchase_id: string
          title: string | null
          description: string | null
          price_cents: number
          status: string
          featured: boolean
          view_count: number
          approved_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          generation_id: string
          purchase_id: string
          title?: string | null
          description?: string | null
          price_cents: number
          status?: string
          featured?: boolean
          view_count?: number
          approved_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          generation_id?: string
          purchase_id?: string
          title?: string | null
          description?: string | null
          price_cents?: number
          status?: string
          featured?: boolean
          view_count?: number
          approved_at?: string | null
          created_at?: string
        }
      }
      hall_sales: {
        Row: {
          id: string
          submission_id: string
          buyer_email: string
          printful_order_id: string | null
          product_type: string | null
          total_cents: number
          creator_cut_cents: number
          platform_cut_cents: number
          stripe_payment_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          submission_id: string
          buyer_email: string
          printful_order_id?: string | null
          product_type?: string | null
          total_cents: number
          creator_cut_cents: number
          platform_cut_cents: number
          stripe_payment_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          submission_id?: string
          buyer_email?: string
          printful_order_id?: string | null
          product_type?: string | null
          total_cents?: number
          creator_cut_cents?: number
          platform_cut_cents?: number
          stripe_payment_id?: string | null
          created_at?: string
        }
      }
      payouts: {
        Row: {
          id: string
          user_id: string
          amount_cents: number
          stripe_transfer_id: string | null
          status: string
          created_at: string
          processed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          amount_cents: number
          stripe_transfer_id?: string | null
          status?: string
          created_at?: string
          processed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          amount_cents?: number
          stripe_transfer_id?: string | null
          status?: string
          created_at?: string
          processed_at?: string | null
        }
      }
    }
  }
}

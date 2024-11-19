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
      links: {
        Row: {
          id: string
          created_at: string
          title: string
          url: string
          description: string
          user_id: string
          username: string
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          url: string
          description: string
          user_id: string
          username: string
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          url?: string
          description?: string
          user_id?: string
          username?: string
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          username: string
          display_name: string | null
          avatar_url: string | null
        }
        Insert: {
          id: string
          created_at?: string
          username: string
          display_name?: string | null
          avatar_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          username?: string
          display_name?: string | null
          avatar_url?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

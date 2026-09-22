export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ai_usage_counters: {
        Row: {
          day: string
          feature: string
          request_count: number
        }
        Insert: {
          day: string
          feature: string
          request_count?: number
        }
        Update: {
          day?: string
          feature?: string
          request_count?: number
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          created_at: string
          first_name: string
          id: number
          last_name: string
          phone_number: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          first_name: string
          id?: never
          last_name: string
          phone_number: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          first_name?: string
          id?: never
          last_name?: string
          phone_number?: string
          updated_at?: string
        }
        Relationships: []
      }
      glass_pieces: {
        Row: {
          created_at: string
          glass_type_id: number
          height_in: number
          id: number
          origin: string
          quantity: number
          updated_at: string
          width_in: number
        }
        Insert: {
          created_at?: string
          glass_type_id: number
          height_in: number
          id?: never
          origin: string
          quantity: number
          updated_at?: string
          width_in: number
        }
        Update: {
          created_at?: string
          glass_type_id?: number
          height_in?: number
          id?: never
          origin?: string
          quantity?: number
          updated_at?: string
          width_in?: number
        }
        Relationships: [
          {
            foreignKeyName: "glass_pieces_glass_type_id_fkey"
            columns: ["glass_type_id"]
            isOneToOne: false
            referencedRelation: "glass_types"
            referencedColumns: ["id"]
          },
        ]
      }
      glass_types: {
        Row: {
          created_at: string
          id: number
          name: string
          price_per_sqft_cents: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: never
          name: string
          price_per_sqft_cents: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: never
          name?: string
          price_per_sqft_cents?: number
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          completed_at: string | null
          created_at: string
          id: number
          installation_date: string
          quote_id: number
          status: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: never
          installation_date: string
          quote_id: number
          status: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: never
          installation_date?: string
          quote_id?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: true
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_line_items: {
        Row: {
          created_at: string
          glass_type_id: number
          height_in: number
          id: number
          line_total_cents: number
          quantity: number
          quote_id: number
          unit_price_cents: number
          width_in: number
          window_type_id: number
        }
        Insert: {
          created_at?: string
          glass_type_id: number
          height_in: number
          id?: never
          line_total_cents: number
          quantity: number
          quote_id: number
          unit_price_cents: number
          width_in: number
          window_type_id: number
        }
        Update: {
          created_at?: string
          glass_type_id?: number
          height_in?: number
          id?: never
          line_total_cents?: number
          quantity?: number
          quote_id?: number
          unit_price_cents?: number
          width_in?: number
          window_type_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_line_items_glass_type_id_fkey"
            columns: ["glass_type_id"]
            isOneToOne: false
            referencedRelation: "glass_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_line_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_line_items_window_type_id_fkey"
            columns: ["window_type_id"]
            isOneToOne: false
            referencedRelation: "window_types"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          approved_at: string | null
          created_at: string
          customer_id: number
          declined_at: string | null
          id: number
          status: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          created_at?: string
          customer_id: number
          declined_at?: string | null
          id?: never
          status: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          created_at?: string
          customer_id?: number
          declined_at?: string | null
          id?: never
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      window_types: {
        Row: {
          created_at: string
          id: number
          labor_cost_cents: number
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: never
          labor_cost_cents: number
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: never
          labor_cost_cents?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_order_from_quote: { Args: { payload: Json }; Returns: number }
      get_glass_type_demand: {
        Args: { p_from: string; p_limit?: number; p_to: string }
        Returns: {
          glass_type_name: string
          total_quantity: number
          total_sqft: number
        }[]
      }
      get_order_status_summary: {
        Args: { p_as_of?: string }
        Returns: {
          complete_count: number
          overdue_count: number
          scheduled_count: number
        }[]
      }
      get_quote_conversion_summary: {
        Args: { p_from: string; p_to: string }
        Returns: {
          approval_rate: number
          approved_count: number
          declined_count: number
          pending_count: number
        }[]
      }
      get_revenue_summary: {
        Args: { p_from: string; p_to: string }
        Returns: {
          average_quote_cents: number
          quote_count: number
          total_cents: number
        }[]
      }
      get_top_customers_by_revenue: {
        Args: { p_from: string; p_limit?: number; p_to: string }
        Returns: {
          customer_id: number
          customer_name: string
          quote_count: number
          total_cents: number
        }[]
      }
      increment_ai_usage_counter: {
        Args: { p_day: string; p_feature: string }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const


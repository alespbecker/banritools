export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      agencies: {
        Row: {
          city: string | null
          created_at: string
          id: string
          name: string
          state: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          id?: string
          name: string
          state?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string
          id?: string
          name?: string
          state?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string
          agency_id: string | null
          created_at: string
          details: Json
          entity: string
          entity_id: string | null
          id: string
        }
        Insert: {
          action: string
          actor_id: string
          agency_id?: string | null
          created_at?: string
          details?: Json
          entity: string
          entity_id?: string | null
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string
          agency_id?: string | null
          created_at?: string
          details?: Json
          entity?: string
          entity_id?: string | null
          id?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          condition_type: string
          condition_value: number
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          condition_type: string
          condition_value?: number
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          condition_type?: string
          condition_value?: number
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      campaign_contacts: {
        Row: {
          assigned_to: string | null
          campaign_id: string
          contact_id: string
          created_at: string
          id: string
          status: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          campaign_id: string
          contact_id: string
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          campaign_id?: string
          contact_id?: string
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_contacts_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_contacts_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          agency_id: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          period_end: string
          period_start: string
          product_id: string | null
          status: string
          target_quantity: number
          updated_at: string
        }
        Insert: {
          agency_id?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
          period_end: string
          period_start: string
          product_id?: string | null
          status?: string
          target_quantity?: number
          updated_at?: string
        }
        Update: {
          agency_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          period_end?: string
          period_start?: string
          product_id?: string | null
          status?: string
          target_quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_interactions: {
        Row: {
          contact_id: string
          created_at: string
          id: string
          next_follow_up: string | null
          notes: string | null
          occurred_at: string
          outcome: string | null
          type: string
          user_id: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          id?: string
          next_follow_up?: string | null
          notes?: string | null
          occurred_at?: string
          outcome?: string | null
          type?: string
          user_id: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          id?: string
          next_follow_up?: string | null
          notes?: string | null
          occurred_at?: string
          outcome?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_interactions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          created_at: string
          id: string
          last_contact: string | null
          name: string
          next_follow_up: string | null
          notes: string | null
          phone: string | null
          product_interest: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_contact?: string | null
          name: string
          next_follow_up?: string | null
          notes?: string | null
          phone?: string | null
          product_interest?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_contact?: string | null
          name?: string
          next_follow_up?: string | null
          notes?: string | null
          phone?: string | null
          product_interest?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_reports: {
        Row: {
          agency_id: string | null
          capitalizacao: number | null
          capitalizacao_valor: number | null
          consignado_volume: number | null
          created_at: string
          credito_fidelidade_volume: number | null
          credito_minuto_aumento: number | null
          id: string
          pj_conta_empresarial: number | null
          pj_maquina_vero: number | null
          recuperacao_estagio_2: number | null
          recuperacao_estagio_3: number | null
          report_date: string
          seguro_ap_smart: number | null
          seguro_ap_smart_valor: number | null
          seguro_vida: number | null
          seguro_vida_valor: number | null
          user_id: string
        }
        Insert: {
          agency_id?: string | null
          capitalizacao?: number | null
          capitalizacao_valor?: number | null
          consignado_volume?: number | null
          created_at?: string
          credito_fidelidade_volume?: number | null
          credito_minuto_aumento?: number | null
          id?: string
          pj_conta_empresarial?: number | null
          pj_maquina_vero?: number | null
          recuperacao_estagio_2?: number | null
          recuperacao_estagio_3?: number | null
          report_date?: string
          seguro_ap_smart?: number | null
          seguro_ap_smart_valor?: number | null
          seguro_vida?: number | null
          seguro_vida_valor?: number | null
          user_id: string
        }
        Update: {
          agency_id?: string | null
          capitalizacao?: number | null
          capitalizacao_valor?: number | null
          consignado_volume?: number | null
          created_at?: string
          credito_fidelidade_volume?: number | null
          credito_minuto_aumento?: number | null
          id?: string
          pj_conta_empresarial?: number | null
          pj_maquina_vero?: number | null
          recuperacao_estagio_2?: number | null
          recuperacao_estagio_3?: number | null
          report_date?: string
          seguro_ap_smart?: number | null
          seguro_ap_smart_valor?: number | null
          seguro_vida?: number | null
          seguro_vida_valor?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_reports_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          agency_id: string | null
          created_at: string
          id: string
          period_end: string
          period_start: string
          period_type: string
          product_id: string | null
          scope: string
          target_amount: number | null
          target_quantity: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          agency_id?: string | null
          created_at?: string
          id?: string
          period_end: string
          period_start: string
          period_type?: string
          product_id?: string | null
          scope?: string
          target_amount?: number | null
          target_quantity?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          agency_id?: string | null
          created_at?: string
          id?: string
          period_end?: string
          period_start?: string
          period_type?: string
          product_id?: string | null
          scope?: string
          target_amount?: number | null
          target_quantity?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goals_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      points_log: {
        Row: {
          agency_id: string | null
          created_at: string
          id: string
          points: number
          reference_id: string | null
          source: string
          user_id: string
        }
        Insert: {
          agency_id?: string | null
          created_at?: string
          id?: string
          points?: number
          reference_id?: string | null
          source: string
          user_id: string
        }
        Update: {
          agency_id?: string | null
          created_at?: string
          id?: string
          points?: number
          reference_id?: string | null
          source?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "points_log_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "points_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          active: boolean
          created_at: string
          display_order: number
          id: string
          legacy_field: string | null
          name: string
          product_id: string
          slug: string
          updated_at: string
          variant_type: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          display_order?: number
          id?: string
          legacy_field?: string | null
          name: string
          product_id: string
          slug: string
          updated_at?: string
          variant_type?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          display_order?: number
          id?: string
          legacy_field?: string | null
          name?: string
          product_id?: string
          slug?: string
          updated_at?: string
          variant_type?: string
        }
        Relationships: []
      }
      production_entries: {
        Row: {
          agency_id: string | null
          amount: number | null
          created_at: string
          details: Json
          entry_date: string
          id: string
          notes: string | null
          product_id: string
          quantity: number
          status: string
          updated_at: string
          user_id: string
          variant_id: string | null
        }
        Insert: {
          agency_id?: string | null
          amount?: number | null
          created_at?: string
          details?: Json
          entry_date?: string
          id?: string
          notes?: string | null
          product_id: string
          quantity?: number
          status?: string
          updated_at?: string
          user_id: string
          variant_id?: string | null
        }
        Update: {
          agency_id?: string | null
          amount?: number | null
          created_at?: string
          details?: Json
          entry_date?: string
          id?: string
          notes?: string | null
          product_id?: string
          quantity?: number
          status?: string
          updated_at?: string
          user_id?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "production_entries_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_entries_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          category: string | null
          commission_per_unit: number
          commission_rate: number
          created_at: string
          description: string | null
          display_order: number
          field_schema: Json
          id: string
          legacy_field: string | null
          metric_type: string
          name: string
          points_per_unit: number
          slug: string
          subcategory: string | null
          unit: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          category?: string | null
          commission_per_unit?: number
          commission_rate?: number
          created_at?: string
          description?: string | null
          display_order?: number
          field_schema?: Json
          id?: string
          legacy_field?: string | null
          metric_type?: string
          name: string
          points_per_unit?: number
          slug: string
          subcategory?: string | null
          unit?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string | null
          commission_per_unit?: number
          commission_rate?: number
          created_at?: string
          description?: string | null
          display_order?: number
          field_schema?: Json
          id?: string
          legacy_field?: string | null
          metric_type?: string
          name?: string
          points_per_unit?: number
          slug?: string
          subcategory?: string | null
          unit?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          agency_id: string | null
          created_at: string
          email: string | null
          id: string
          name: string | null
        }
        Insert: {
          agency_id?: string | null
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
        }
        Update: {
          agency_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      ranking_monthly: {
        Row: {
          agency_id: string | null
          id: string
          month: string
          points: number
          position: number
          updated_at: string
          user_id: string
        }
        Insert: {
          agency_id?: string | null
          id?: string
          month: string
          points?: number
          position?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          agency_id?: string | null
          id?: string
          month?: string
          points?: number
          position?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ranking_monthly_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ranking_monthly_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tools: {
        Row: {
          created_at: string
          description: string | null
          enabled: boolean | null
          icon: string | null
          id: string
          name: string
          route: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          enabled?: boolean | null
          icon?: string | null
          id?: string
          name: string
          route?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          enabled?: boolean | null
          icon?: string | null
          id?: string
          name?: string
          route?: string | null
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          badge_id: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_points: {
        Row: {
          level: number
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          level?: number
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          level?: number
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_points_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_set_user_role: {
        Args: {
          _new_role: Database["public"]["Enums"]["app_role"]
          _target_user_id: string
        }
        Returns: undefined
      }
      calculate_report_points: {
        Args: { r: Database["public"]["Tables"]["daily_reports"]["Row"] }
        Returns: number
      }
      check_badges: { Args: { _user_id: string }; Returns: undefined }
      get_level: { Args: { pts: number }; Returns: number }
      get_user_agency_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      update_monthly_ranking: {
        Args: { _agency_id: string; _month: string; _user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user" | "funcionario" | "gerente" | "viewer"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user", "funcionario", "gerente", "viewer"],
    },
  },
} as const

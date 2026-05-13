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
      agent_traces: {
        Row: {
          agent: string
          cost_usd: number | null
          created_at: string
          error_message: string | null
          id: string
          input_redacted: Json | null
          input_tokens: number | null
          latency_ms: number | null
          output: Json | null
          output_tokens: number | null
          ref_id: string | null
          ref_table: string | null
          status: string
          tenant_id: string | null
        }
        Insert: {
          agent: string
          cost_usd?: number | null
          created_at?: string
          error_message?: string | null
          id?: string
          input_redacted?: Json | null
          input_tokens?: number | null
          latency_ms?: number | null
          output?: Json | null
          output_tokens?: number | null
          ref_id?: string | null
          ref_table?: string | null
          status?: string
          tenant_id?: string | null
        }
        Update: {
          agent?: string
          cost_usd?: number | null
          created_at?: string
          error_message?: string | null
          id?: string
          input_redacted?: Json | null
          input_tokens?: number | null
          latency_ms?: number | null
          output?: Json | null
          output_tokens?: number | null
          ref_id?: string | null
          ref_table?: string | null
          status?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_traces_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          candidate_id: string
          created_at: string
          id: string
          job_id: string
          match_breakdown: Json | null
          match_reasoning: string | null
          match_score: number | null
          stage: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          id?: string
          job_id: string
          match_breakdown?: Json | null
          match_reasoning?: string | null
          match_score?: number | null
          stage?: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          id?: string
          job_id?: string
          match_breakdown?: Json | null
          match_reasoning?: string | null
          match_score?: number | null
          stage?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_profiles: {
        Row: {
          candidate_id: string
          created_at: string
          embedding: string | null
          experience: Json
          id: string
          skills: Json
          summary: string | null
          updated_at: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          embedding?: string | null
          experience?: Json
          id?: string
          skills?: Json
          summary?: string | null
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          embedding?: string | null
          experience?: Json
          id?: string
          skills?: Json
          summary?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_profiles_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: true
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          email: string
          english_cefr: string | null
          full_name: string
          gender: string | null
          id: string
          linkedin_url: string | null
          phone_e164: string | null
          seniority: string | null
          tenant_id: string
          university: string | null
          updated_at: string
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          email: string
          english_cefr?: string | null
          full_name: string
          gender?: string | null
          id?: string
          linkedin_url?: string | null
          phone_e164?: string | null
          seniority?: string | null
          tenant_id: string
          university?: string | null
          updated_at?: string
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string
          english_cefr?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          linkedin_url?: string | null
          phone_e164?: string | null
          seniority?: string | null
          tenant_id?: string
          university?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          candidate_id: string
          channel: string
          created_at: string
          id: string
          job_id: string | null
          last_message_at: string | null
          state: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          candidate_id: string
          channel?: string
          created_at?: string
          id?: string
          job_id?: string | null
          last_message_at?: string | null
          state?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          channel?: string
          created_at?: string
          id?: string
          job_id?: string | null
          last_message_at?: string | null
          state?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_reports: {
        Row: {
          created_at: string
          english_breakdown: Json | null
          english_level: string | null
          id: string
          interview_id: string
          pdf_url: string | null
          recommendation: string | null
          red_flags: Json | null
          softskill_score: Json | null
          strengths: Json | null
          summary: string | null
          technical_score: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          english_breakdown?: Json | null
          english_level?: string | null
          id?: string
          interview_id: string
          pdf_url?: string | null
          recommendation?: string | null
          red_flags?: Json | null
          softskill_score?: Json | null
          strengths?: Json | null
          summary?: string | null
          technical_score?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          english_breakdown?: Json | null
          english_level?: string | null
          id?: string
          interview_id?: string
          pdf_url?: string | null
          recommendation?: string | null
          red_flags?: Json | null
          softskill_score?: Json | null
          strengths?: Json | null
          summary?: string | null
          technical_score?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_reports_interview_id_fkey"
            columns: ["interview_id"]
            isOneToOne: true
            referencedRelation: "interviews"
            referencedColumns: ["id"]
          },
        ]
      }
      interviews: {
        Row: {
          candidate_id: string
          created_at: string
          duration_minutes: number | null
          id: string
          job_id: string
          scheduled_at: string | null
          status: string
          tenant_id: string
          transcript_id: string | null
          updated_at: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          job_id: string
          scheduled_at?: string | null
          status?: string
          tenant_id: string
          transcript_id?: string | null
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          job_id?: string
          scheduled_at?: string | null
          status?: string
          tenant_id?: string
          transcript_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interviews_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interviews_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interviews_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interviews_transcript_id_fkey"
            columns: ["transcript_id"]
            isOneToOne: false
            referencedRelation: "transcripts"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          company_name: string
          created_at: string
          description_raw: string
          embedding: string | null
          english_min_cefr: string | null
          id: string
          ideal_profile: Json | null
          location: string | null
          modality: string
          parsed_jd: Json | null
          salary_max_usd: number | null
          salary_min_usd: number | null
          status: string
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          company_name: string
          created_at?: string
          description_raw: string
          embedding?: string | null
          english_min_cefr?: string | null
          id?: string
          ideal_profile?: Json | null
          location?: string | null
          modality: string
          parsed_jd?: Json | null
          salary_max_usd?: number | null
          salary_min_usd?: number | null
          status?: string
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          company_name?: string
          created_at?: string
          description_raw?: string
          embedding?: string | null
          english_min_cefr?: string | null
          id?: string
          ideal_profile?: Json | null
          location?: string | null
          modality?: string
          parsed_jd?: Json | null
          salary_max_usd?: number | null
          salary_min_usd?: number | null
          status?: string
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      outreach_messages: {
        Row: {
          channel: string
          content: string
          conversation_id: string
          created_at: string
          direction: string
          id: string
          status: string
          tenant_id: string
          twilio_sid: string | null
          updated_at: string
        }
        Insert: {
          channel?: string
          content: string
          conversation_id: string
          created_at?: string
          direction: string
          id?: string
          status?: string
          tenant_id: string
          twilio_sid?: string | null
          updated_at?: string
        }
        Update: {
          channel?: string
          content?: string
          conversation_id?: string
          created_at?: string
          direction?: string
          id?: string
          status?: string
          tenant_id?: string
          twilio_sid?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "outreach_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outreach_messages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      transcripts: {
        Row: {
          created_at: string
          id: string
          interview_id: string
          language: string
          raw_text: string | null
          segments: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          interview_id: string
          language?: string
          raw_text?: string | null
          segments?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          interview_id?: string
          language?: string
          raw_text?: string | null
          segments?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transcripts_interview_id_fkey"
            columns: ["interview_id"]
            isOneToOne: true
            referencedRelation: "interviews"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          display_name: string | null
          email: string
          id: string
          role: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email: string
          id: string
          role?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          role?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

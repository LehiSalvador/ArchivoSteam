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
      archive_collections: {
        Row: {
          archive_id: string
          collection_id: string
          sort_order: number
        }
        Insert: {
          archive_id: string
          collection_id: string
          sort_order?: number
        }
        Update: {
          archive_id?: string
          collection_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "archive_collections_archive_id_fkey"
            columns: ["archive_id"]
            isOneToOne: false
            referencedRelation: "archives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "archive_collections_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      archive_topics: {
        Row: {
          archive_id: string
          topic_id: string
        }
        Insert: {
          archive_id: string
          topic_id: string
        }
        Update: {
          archive_id?: string
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "archive_topics_archive_id_fkey"
            columns: ["archive_id"]
            isOneToOne: false
            referencedRelation: "archives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "archive_topics_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      archive_tours: {
        Row: {
          archive_id: string
          sort_order: number
          tour_id: string
        }
        Insert: {
          archive_id: string
          sort_order?: number
          tour_id: string
        }
        Update: {
          archive_id?: string
          sort_order?: number
          tour_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "archive_tours_archive_id_fkey"
            columns: ["archive_id"]
            isOneToOne: false
            referencedRelation: "archives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "archive_tours_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
        ]
      }
      archives: {
        Row: {
          applications: string | null
          archive_number: number | null
          archived_at: string | null
          audio_url: string | null
          card_description: string | null
          chapters: Json
          city_id: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          duration_seconds: number | null
          highlight_phrase: string | null
          id: string
          institution_id: string | null
          is_featured: boolean
          is_trending: boolean
          person_id: string | null
          primary_discipline_id: string | null
          published_at: string | null
          research: string | null
          scheduled_at: string | null
          short_description: string | null
          slug: string
          status: Database["public"]["Enums"]["archive_status"]
          subtitle: string | null
          summary: string | null
          title: string
          transcript: string | null
          updated_at: string
          updated_by: string | null
          video_published_at: string | null
          visibility: string
          youtube_channel: string | null
          youtube_raw: Json | null
          youtube_stats: Json | null
          youtube_sync_error: string | null
          youtube_synced_at: string | null
          youtube_thumbnail_url: string | null
          youtube_url: string | null
          youtube_video_id: string | null
        }
        Insert: {
          applications?: string | null
          archive_number?: number | null
          archived_at?: string | null
          audio_url?: string | null
          card_description?: string | null
          chapters?: Json
          city_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          duration_seconds?: number | null
          highlight_phrase?: string | null
          id?: string
          institution_id?: string | null
          is_featured?: boolean
          is_trending?: boolean
          person_id?: string | null
          primary_discipline_id?: string | null
          published_at?: string | null
          research?: string | null
          scheduled_at?: string | null
          short_description?: string | null
          slug: string
          status?: Database["public"]["Enums"]["archive_status"]
          subtitle?: string | null
          summary?: string | null
          title: string
          transcript?: string | null
          updated_at?: string
          updated_by?: string | null
          video_published_at?: string | null
          visibility?: string
          youtube_channel?: string | null
          youtube_raw?: Json | null
          youtube_stats?: Json | null
          youtube_sync_error?: string | null
          youtube_synced_at?: string | null
          youtube_thumbnail_url?: string | null
          youtube_url?: string | null
          youtube_video_id?: string | null
        }
        Update: {
          applications?: string | null
          archive_number?: number | null
          archived_at?: string | null
          audio_url?: string | null
          card_description?: string | null
          chapters?: Json
          city_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          duration_seconds?: number | null
          highlight_phrase?: string | null
          id?: string
          institution_id?: string | null
          is_featured?: boolean
          is_trending?: boolean
          person_id?: string | null
          primary_discipline_id?: string | null
          published_at?: string | null
          research?: string | null
          scheduled_at?: string | null
          short_description?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["archive_status"]
          subtitle?: string | null
          summary?: string | null
          title?: string
          transcript?: string | null
          updated_at?: string
          updated_by?: string | null
          video_published_at?: string | null
          visibility?: string
          youtube_channel?: string | null
          youtube_raw?: Json | null
          youtube_stats?: Json | null
          youtube_sync_error?: string | null
          youtube_synced_at?: string | null
          youtube_thumbnail_url?: string | null
          youtube_url?: string | null
          youtube_video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "archives_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "archives_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "archives_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "archives_primary_discipline_id_fkey"
            columns: ["primary_discipline_id"]
            isOneToOne: false
            referencedRelation: "disciplines"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json
          new_values: Json | null
          old_values: Json | null
          reason: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json
          new_values?: Json | null
          old_values?: Json | null
          reason?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json
          new_values?: Json | null
          old_values?: Json | null
          reason?: string | null
        }
        Relationships: []
      }
      cities: {
        Row: {
          country: string
          created_at: string
          id: string
          name: string
          region: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          country?: string
          created_at?: string
          id?: string
          name: string
          region?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          country?: string
          created_at?: string
          id?: string
          name?: string
          region?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      collections: {
        Row: {
          cover_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_public: boolean
          slug: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean
          slug: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      disciplines: {
        Row: {
          area: string | null
          created_at: string
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          area?: string | null
          created_at?: string
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          area?: string | null
          created_at?: string
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      document_sources: {
        Row: {
          document_id: string
          note: string | null
          source_id: string
        }
        Insert: {
          document_id: string
          note?: string | null
          source_id: string
        }
        Update: {
          document_id?: string
          note?: string | null
          source_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_sources_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_sources_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      document_versions: {
        Row: {
          content: string | null
          content_format: string
          created_at: string
          created_by: string | null
          document_id: string
          id: string
          is_current: boolean
          language: string
          version_number: number
        }
        Insert: {
          content?: string | null
          content_format?: string
          created_at?: string
          created_by?: string | null
          document_id: string
          id?: string
          is_current?: boolean
          language?: string
          version_number: number
        }
        Update: {
          content?: string | null
          content_format?: string
          created_at?: string
          created_by?: string | null
          document_id?: string
          id?: string
          is_current?: boolean
          language?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          archive_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          is_public: boolean
          kind: string
          slug: string | null
          sort_order: number
          status: string
          title: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          archive_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          is_public?: boolean
          kind?: string
          slug?: string | null
          sort_order?: number
          status?: string
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          archive_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          is_public?: boolean
          kind?: string
          slug?: string | null
          sort_order?: number
          status?: string
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_archive_id_fkey"
            columns: ["archive_id"]
            isOneToOne: false
            referencedRelation: "archives"
            referencedColumns: ["id"]
          },
        ]
      }
      institutions: {
        Row: {
          city_id: string | null
          created_at: string
          id: string
          kind: string | null
          name: string
          slug: string
          updated_at: string
          website: string | null
        }
        Insert: {
          city_id?: string | null
          created_at?: string
          id?: string
          kind?: string | null
          name: string
          slug: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          city_id?: string | null
          created_at?: string
          id?: string
          kind?: string | null
          name?: string
          slug?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "institutions_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      people: {
        Row: {
          bio: string | null
          birth_year: number | null
          city_id: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          display_name: string | null
          full_name: string
          headline: string | null
          id: string
          institution_id: string | null
          is_public: boolean
          links: Json
          photo_url: string | null
          primary_discipline_id: string | null
          short_bio: string | null
          slug: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          bio?: string | null
          birth_year?: number | null
          city_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          display_name?: string | null
          full_name: string
          headline?: string | null
          id?: string
          institution_id?: string | null
          is_public?: boolean
          links?: Json
          photo_url?: string | null
          primary_discipline_id?: string | null
          short_bio?: string | null
          slug: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          bio?: string | null
          birth_year?: number | null
          city_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          display_name?: string | null
          full_name?: string
          headline?: string | null
          id?: string
          institution_id?: string | null
          is_public?: boolean
          links?: Json
          photo_url?: string | null
          primary_discipline_id?: string | null
          short_bio?: string | null
          slug?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "people_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "people_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "people_primary_discipline_id_fkey"
            columns: ["primary_discipline_id"]
            isOneToOne: false
            referencedRelation: "disciplines"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          is_public: boolean
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          is_public?: boolean
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          is_public?: boolean
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      sources: {
        Row: {
          accessed_on: string | null
          author: string | null
          created_at: string
          created_by: string | null
          id: string
          is_verified: boolean
          note: string | null
          published_on: string | null
          publisher: string | null
          source_type: string | null
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          accessed_on?: string | null
          author?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_verified?: boolean
          note?: string | null
          published_on?: string | null
          publisher?: string | null
          source_type?: string | null
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          accessed_on?: string | null
          author?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_verified?: boolean
          note?: string | null
          published_on?: string | null
          publisher?: string | null
          source_type?: string | null
          title?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      topics: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      tours: {
        Row: {
          city_id: string | null
          cover_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_public: boolean
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          city_id?: string | null
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          city_id?: string | null
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tours_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
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
      current_role_level: { Args: never; Returns: string }
      evps_ping_heartbeat: { Args: { p_token: string }; Returns: Json }
      has_role: {
        Args: { p_role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_owner: { Args: never; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "MEMBER" | "EDITOR" | "ADMIN" | "OWNER"
      archive_status:
        | "DRAFT"
        | "RESEARCH"
        | "VERIFICATION"
        | "LEGAL_REVIEW"
        | "READY"
        | "SCHEDULED"
        | "PUBLISHED"
        | "CORRECTION"
        | "ARCHIVED"
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
      app_role: ["MEMBER", "EDITOR", "ADMIN", "OWNER"],
      archive_status: [
        "DRAFT",
        "RESEARCH",
        "VERIFICATION",
        "LEGAL_REVIEW",
        "READY",
        "SCHEDULED",
        "PUBLISHED",
        "CORRECTION",
        "ARCHIVED",
      ],
    },
  },
} as const

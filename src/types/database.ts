/**
 * Hand-authored types matching the Sprint 1A+1B schema.
 * Regenerate from a live project with:
 *   npx supabase gen types typescript --project-id <your-project-id> > src/types/database.ts
 *
 * Each table requires a `Relationships` array to satisfy @supabase/supabase-js's
 * GenericTable constraint. Until FK relationships are formally declared, this is [].
 */

export type Database = {
  public: {
    Tables: {
      trees: {
        Row: {
          id: string;
          name: string;
          creator_id: string;
          privacy: "public" | "private";
          legend_config: Record<string, unknown> | null;
          updated_at: string;
          created_by: string | null;
          last_edited_by: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          creator_id: string;
          privacy?: "public" | "private";
          legend_config?: Record<string, unknown> | null;
          updated_at?: string;
        };
        Update: {
          name?: string;
          privacy?: "public" | "private";
          legend_config?: Record<string, unknown> | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      persons: {
        Row: {
          id: string;
          tree_id: string;
          first_name: string;
          last_name: string | null;
          birth_date: string | null;
          birth_location: string | null;
          death_date: string | null;
          death_location: string | null;
          is_living: boolean;
          generation_index: number | null;
          canvas_x: number | null;
          canvas_y: number | null;
          profile_image_url: string | null;
          path: string | null;
          search_vector: string | null;
          is_deleted: boolean;
          deleted_at: string | null;
          created_by: string | null;
          last_edited_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tree_id: string;
          first_name: string;
          last_name?: string | null;
          birth_date?: string | null;
          birth_location?: string | null;
          death_date?: string | null;
          death_location?: string | null;
          is_living?: boolean;
          generation_index?: number | null;
          canvas_x?: number | null;
          canvas_y?: number | null;
          profile_image_url?: string | null;
          path?: string | null;
          is_deleted?: boolean;
          deleted_at?: string | null;
          created_at?: string;
        };
        Update: {
          first_name?: string;
          last_name?: string | null;
          birth_date?: string | null;
          birth_location?: string | null;
          death_date?: string | null;
          death_location?: string | null;
          is_living?: boolean;
          generation_index?: number | null;
          canvas_x?: number | null;
          canvas_y?: number | null;
          profile_image_url?: string | null;
          path?: string | null;
          is_deleted?: boolean;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      union_nodes: {
        Row: {
          id: string;
          tree_id: string;
          partner_1_id: string | null;
          partner_2_id: string | null;
          relationship_type: "married" | "partners" | "custom";
          canvas_x: number | null;
          canvas_y: number | null;
          path: string | null;
          is_deleted: boolean;
          deleted_at: string | null;
          created_by: string | null;
          last_edited_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tree_id: string;
          partner_1_id?: string | null;
          partner_2_id?: string | null;
          relationship_type?: "married" | "partners" | "custom";
          canvas_x?: number | null;
          canvas_y?: number | null;
          path?: string | null;
          is_deleted?: boolean;
          deleted_at?: string | null;
          created_at?: string;
        };
        Update: {
          partner_1_id?: string | null;
          partner_2_id?: string | null;
          relationship_type?: "married" | "partners" | "custom";
          canvas_x?: number | null;
          canvas_y?: number | null;
          path?: string | null;
          is_deleted?: boolean;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      edges: {
        Row: {
          id: string;
          union_node_id: string;
          child_person_id: string;
          edge_type: "biological" | "adopted" | "foster" | "guardian";
          created_by: string | null;
          last_edited_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          union_node_id: string;
          child_person_id: string;
          edge_type?: "biological" | "adopted" | "foster" | "guardian";
          created_at?: string;
        };
        Update: {
          edge_type?: "biological" | "adopted" | "foster" | "guardian";
        };
        Relationships: [];
      };
      tree_collaborators: {
        Row: {
          id: string;
          tree_id: string;
          user_id: string | null;
          role: "owner" | "editor" | "view_only";
          invite_token: string | null;
          invited_at: string;
          accepted_at: string | null;
          created_by: string | null;
          last_edited_by: string | null;
        };
        Insert: {
          id?: string;
          tree_id: string;
          user_id?: string | null;
          role: "owner" | "editor" | "view_only";
          invite_token?: string | null;
          invited_at?: string;
          accepted_at?: string | null;
        };
        Update: {
          role?: "owner" | "editor" | "view_only";
          invite_token?: string | null;
          accepted_at?: string | null;
        };
        Relationships: [];
      };
      branch_locks: {
        Row: {
          id: string;
          tree_id: string;
          path: string;
          locked_by: string;
          locked_at: string;
          created_by: string | null;
          last_edited_by: string | null;
        };
        Insert: {
          id?: string;
          tree_id: string;
          path: string;
          locked_by: string;
          locked_at?: string;
        };
        Update: {
          path?: string;
          locked_by?: string;
          locked_at?: string;
        };
        Relationships: [];
      };
      person_aliases: {
        Row: {
          id: string;
          canonical_person_id: string;
          display_path: string;
          tree_id: string;
          created_by: string | null;
          last_edited_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          canonical_person_id: string;
          display_path: string;
          tree_id: string;
          created_at?: string;
        };
        Update: {
          display_path?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          tree_id: string | null;
          type: string;
          payload: Record<string, unknown> | null;
          read_at: string | null;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          tree_id?: string | null;
          type: string;
          payload?: Record<string, unknown> | null;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          read_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      user_can_access_tree: {
        Args: { p_tree_id: string };
        Returns: boolean;
      };
      user_can_write_tree: {
        Args: { p_tree_id: string };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
  };
};

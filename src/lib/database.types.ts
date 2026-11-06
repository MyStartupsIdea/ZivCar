// Types generated from the ZivCar Supabase project (wwotwzpslwxluxvcwbvj).
// Regenerate with `npx supabase gen types typescript --project-id wwotwzpslwxluxvcwbvj`
// or the Supabase integration's "generate typescript types" action.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      listings: {
        Row: {
          body: string | null;
          brand: string;
          city: string;
          color: string | null;
          condition: string;
          created_at: string;
          description: string;
          drive: string | null;
          engine: number | null;
          exchange: boolean;
          fuel: string | null;
          id: string;
          mileage: number | null;
          model: string;
          negotiable: boolean;
          owners: number | null;
          phone: string;
          photos: string[];
          price: number;
          published: boolean;
          seller_id: string;
          sold_at: string | null;
          title: string;
          transmission: string | null;
          views: number;
          year: number | null;
        };
        Insert: {
          body?: string | null;
          brand?: string;
          city?: string;
          color?: string | null;
          condition?: string;
          created_at?: string;
          description?: string;
          drive?: string | null;
          engine?: number | null;
          exchange?: boolean;
          fuel?: string | null;
          id: string;
          mileage?: number | null;
          model?: string;
          negotiable?: boolean;
          owners?: number | null;
          phone?: string;
          photos?: string[];
          price?: number;
          published?: boolean;
          seller_id: string;
          sold_at?: string | null;
          title: string;
          transmission?: string | null;
          views?: number;
          year?: number | null;
        };
        Update: {
          body?: string | null;
          brand?: string;
          city?: string;
          color?: string | null;
          condition?: string;
          created_at?: string;
          description?: string;
          drive?: string | null;
          engine?: number | null;
          exchange?: boolean;
          fuel?: string | null;
          id?: string;
          mileage?: number | null;
          model?: string;
          negotiable?: boolean;
          owners?: number | null;
          phone?: string;
          photos?: string[];
          price?: number;
          published?: boolean;
          seller_id?: string;
          sold_at?: string | null;
          title?: string;
          transmission?: string | null;
          views?: number;
          year?: number | null;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

export type Tables<
  TableName extends keyof Database["public"]["Tables"],
> = Database["public"]["Tables"][TableName]["Row"];

export type TablesInsert<
  TableName extends keyof Database["public"]["Tables"],
> = Database["public"]["Tables"][TableName]["Insert"];

export type TablesUpdate<
  TableName extends keyof Database["public"]["Tables"],
> = Database["public"]["Tables"][TableName]["Update"];

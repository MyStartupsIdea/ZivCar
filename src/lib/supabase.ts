// Supabase client factory for Car Marketplace.
// Uses the publishable key (safe for the browser); the server-side helpers are
// kept for the upcoming auth work.
import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "";

/** True when the build has a Supabase project configured. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

let browserClient: SupabaseClient<Database> | null = null;

/**
 * Shared browser client. Returns null when the app is built without Supabase
 * credentials, so the local (localStorage) store stays the only source of truth.
 */
export function getSupabaseBrowserClient(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured || typeof window === "undefined") return null;
  if (!browserClient) {
    browserClient = createBrowserClient<Database>(supabaseUrl, supabaseKey);
  }
  return browserClient;
}

export function createClientComponentClient<D = Database>(): SupabaseClient<D> | null {
  if (!isSupabaseConfigured) return null;
  return createBrowserClient<D>(supabaseUrl, supabaseKey);
}

export function createServerClientForAuth(cookies: {
  getAll: () => Array<{ name: string; value: string }>;
  setAll: (cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) => void;
}) {
  return createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => cookies.getAll(),
      setAll: (cookiesToSet) => cookies.setAll(cookiesToSet),
    },
  });
}

export function createServerComponentClient(requestEvent: {
  cookies: {
    getAll: () => Array<{ name: string; value: string }>;
    setAll: (cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) => void;
  };
}) {
  return createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return requestEvent.cookies.getAll();
      },
      setAll(cookiesToSet) {
        requestEvent.cookies.setAll(cookiesToSet);
      },
    },
  });
}

export function createServerAdminClient() {
  return createClient<Database>(supabaseUrl, supabaseKey);
}

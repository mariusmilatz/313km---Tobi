import { createClient } from "@supabase/supabase-js";

// Safe to use in both Server Components and "use client" components/browser
// code: this key only ever grants what the `track_points` RLS policy allows,
// which is read-only SELECT access (see the Supabase migration for details).
// Never import serviceClient.ts into anything that reaches the browser.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function createPublicClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });
}

// A single shared instance is fine here: this client holds no session state
// and every call is a stateless, RLS-scoped read.
export const supabasePublic = createPublicClient();

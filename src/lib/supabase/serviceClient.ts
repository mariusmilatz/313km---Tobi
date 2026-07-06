import "server-only";
import { createClient } from "@supabase/supabase-js";

// SERVER-ONLY. This client uses the Supabase service_role key, which
// bypasses Row Level Security entirely. It must never be imported by a
// "use client" component or anything else that ends up in the browser
// bundle — the `server-only` import above makes Next.js throw a build error
// if that ever happens by accident.
//
// Currently used by: src/app/api/ingest/traccar/route.ts
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function createServiceClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

export const supabaseService = createServiceClient();

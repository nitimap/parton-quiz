import { createClient } from "@supabase/supabase-js";
export function publicClient() { const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; return url && key ? createClient(url, key, { auth: { persistSession: false } }) : null; }
export function adminClient() { const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY; return url && key ? createClient(url, key, { auth: { persistSession: false } }) : null; }

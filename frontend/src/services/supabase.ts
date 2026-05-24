import { createClient } from "@supabase/supabase-js";

const supabaseUrl = __VITE_SUPABASE_URL__;
const supabaseKey = __VITE_SUPABASE_PUBLISHABLE_KEY__;

export const supabase = createClient(supabaseUrl, supabaseKey);

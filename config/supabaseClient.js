const { createClient } = require("@supabase/supabase-js");

// These values come from your Supabase Project Settings > API
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_PROJECT_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;

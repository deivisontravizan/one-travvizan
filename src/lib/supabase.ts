import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fbcgmuhvvqmrpmcqdcwr.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiY2dtdWh2dnFtcnBtY3FkY3dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NTU3NjEsImV4cCI6MjA2OTEzMTc2MX0.roXPpvKArvwIdkqnyR9yoQAASBN5pu4ZlBhXtZnxnn4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
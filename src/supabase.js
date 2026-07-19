import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://kqjzlamewifkajqqkuif.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxanpsYW1ld2lma2FqcXFrdWlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxNzg0ODQsImV4cCI6MjA5OTc1NDQ4NH0.GRMvSpBbckEINs3zFtdhctRIyM_q6OqKOGlG6rTpBpg'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)


import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qilfcrxzyisxtvaqkjdi.supabase.co'

const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpbGZjcnh6eWlzeHR2YXFramRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNzUwMzgsImV4cCI6MjA3Nzc1MTAzOH0.5zl4eePgDE_y3mS4BFjBLW1juYh0bkIflLni3h3e5t0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false 
  }
})
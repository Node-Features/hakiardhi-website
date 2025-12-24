
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL as string
const supabaseKey = process.env.SUPABASE_KEY as string
const serviceRoleKey = process.env.SERVICE_ROLE || process.env.SUPABASE_KEY as string

// Configure with proper timeout and connection settings
const clientOptions = {
  db: {
    schema: 'public'
  },
  auth: {
    persistSession: false,
    autoRefreshToken: false
  },
  global: {
    headers: {
      'x-request-timeout': '20000' // 20 second timeout
    }
  }
}

export const supabase = (bypass_rls = false) => bypass_rls ?
 createClient(supabaseUrl, serviceRoleKey, clientOptions) :
 createClient(supabaseUrl, supabaseKey, clientOptions)
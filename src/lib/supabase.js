import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qtkxgmjkuqvfqiubsith.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0a3hnbWprdXF2ZnFpdWJzaXRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNjAzMDEsImV4cCI6MjA5MTczNjMwMX0.JevVFsLWsALs6jdXnlAgIqwTx36Zt8IwZS6EV3dbNZg'

    export const supabase = createClient(supabaseUrl, supabaseKey)
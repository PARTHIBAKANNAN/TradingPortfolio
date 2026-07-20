import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uuuqfihtquirgjhynoem.supabase.co'
const supabaseKey = 'sb_publishable_IiuxYcQ8XH3FAxUOZy9F5A_Ydq4QC24'

export const supabase = createClient(supabaseUrl, supabaseKey)

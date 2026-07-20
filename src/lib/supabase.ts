import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://euhmeoquktkljpwfcbfl.supabase.co'
const supabaseKey = 'sb_publishable_qEyO55r32cp8fNjtWVfa1w_-xCE5BU0'

export const supabase = createClient(supabaseUrl, supabaseKey)

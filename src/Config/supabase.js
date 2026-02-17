const projectUrl = "https://ufxrfqhqvabdpwtnwtkh.supabase.co"
const projectKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmeHJmcWhxdmFiZHB3dG53dGtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MDgzOTksImV4cCI6MjA3MzE4NDM5OX0.EHbeCZmpyJ9Olz_-Ytmjs6g6oJhfAkTPFVDyBH67zNo"

import { createClient } from '@supabase/supabase-js'
export const client = createClient(projectUrl, projectKey)


import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

const SUPABASE_URL = 'https://cxksmzyxdpqqtmkaosvt.supabase.co'
const SERVICE_KEY = process.argv[2]

if (!SERVICE_KEY) {
  console.error('Usage: node upload.mjs YOUR_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

const htmlDir = '/home/claude/atoc-html'
const files = readdirSync(htmlDir).filter(f => f.endsWith('.html'))
console.log(`Found ${files.length} HTML files`)

let ok = 0, err = 0
for (const file of files) {
  const content = readFileSync(join(htmlDir, file))
  const { error } = await supabase.storage
    .from('lessons')
    .upload(`html/${file}`, content, { contentType: 'text/html; charset=utf-8', upsert: true })
  
  if (error) { console.error(`✗ ${file}: ${error.message}`); err++ }
  else { console.log(`✓ ${file}`); ok++ }
}
console.log(`\nDone: ${ok} uploaded, ${err} errors`)

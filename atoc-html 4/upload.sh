#!/bin/bash
# Загрузка HTML файлов в Supabase Storage
# Запусти: SERVICE_KEY=your_key bash upload.sh

SUPABASE_URL="https://cxksmzyxdpqqtmkaosvt.supabase.co"
BUCKET="lessons"

for file in /home/claude/atoc-html/*.html; do
  filename=$(basename "$file")
  echo -n "Uploading $filename... "
  
  response=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST \
    -H "Authorization: Bearer $SERVICE_KEY" \
    -H "Content-Type: text/html" \
    --data-binary "@$file" \
    "$SUPABASE_URL/storage/v1/object/$BUCKET/html/$filename")
  
  echo "HTTP $response"
done

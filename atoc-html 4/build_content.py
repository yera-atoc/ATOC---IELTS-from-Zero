import os, json

content = {}
files = []

for level in ['A', 'B', 'C']:
    if level == 'A':
        nums = range(1, 21)
    elif level == 'B':
        nums = range(1, 21)
    else:
        nums = range(1, 20)
    
    for n in nums:
        fname = f"/home/claude/atoc-html/{level}{n}.html"
        if os.path.exists(fname):
            with open(fname, 'r') as f:
                html = f.read()
            key = f"{level}{n}"
            content[key] = html
            files.append(key)

print(f"Total lessons: {len(files)}")

# Save as JSON
with open('/home/claude/atoc-html/all_content.json', 'w') as f:
    json.dump(content, f, ensure_ascii=False)

size = os.path.getsize('/home/claude/atoc-html/all_content.json')
print(f"Total size: {size/1024/1024:.1f} MB")

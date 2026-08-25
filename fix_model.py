import sys

with open('services/itemAnalysis.ts', 'r', encoding='utf-8') as f:
    content = f.read()

old = '`':  - ``;'
new = '`${modelId}: ${r.status} - ${errText}`;'

# Use raw byte approach
old_bytes = b'`:  - `'
new_bytes = b'`${modelId}: ${r.status} - ${errText}`'

bdata = content.encode('utf-8')
bdata = bdata.replace(old_bytes, new_bytes)

with open('services/itemAnalysis.ts', 'wb') as f:
    f.write(bdata)

print('Done')

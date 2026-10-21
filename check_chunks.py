import json
chunks = json.load(open('chunks.json'))['chunks']
for c in chunks:
    print('Chunk', c['num'], ':', len(c['files']), 'files')
print('Total chunks:', len(chunks))
import json
spec = open(r'C:\Users\emerson\.config\opencode\skills\graphify\references\extraction-spec.md').read()
chunks = json.load(open('chunks.json'))['chunks']
for c in chunks:
    files_str = '\n'.join(c['files'])
    prompt = spec.replace('FILE_LIST', files_str)
    prompt = prompt.replace('CHUNK_NUM', str(c['num']))
    prompt = prompt.replace('TOTAL_CHUNKS', '12')
    prompt = prompt.replace('DEEP_MODE', 'false')
    prompt = prompt.replace('CHUNK_PATH', 'graphify-out/.graphify_chunk_{:02d}.json'.format(c['num']))
    print('CHUNK', c['num'], 'prompt preview:', prompt[:200])
    print()
import json
from pathlib import Path

uncached = Path('graphify-out/.graphify_uncached.txt').read_text(encoding="utf-8").splitlines()
uncached = [f for f in uncached if f]

# Read line counts for each file
file_info = []
for f in uncached:
    p = Path(f)
    if p.is_file():
        try:
            with p.open(encoding='utf-8', errors='replace') as fp:
                lines = sum(1 for _ in fp)
        except:
            lines = 0
    else:
        lines = 0
    file_info.append((f, lines))

# Sort by directory to group related files
file_info.sort(key=lambda x: str(Path(x[0]).parent))

# Create chunks (max 25 files, max 6000 lines)
chunks = []
current_chunk = []
current_lines = 0
for f, lines in file_info:
    if len(current_chunk) >= 25 or current_lines + lines > 6000:
        if current_chunk:
            chunks.append(current_chunk)
        current_chunk = [(f, lines)]
        current_lines = lines
    else:
        current_chunk.append((f, lines))
        current_lines += lines
if current_chunk:
    chunks.append(current_chunk)

print(f'Total files: {len(uncached)}')
print(f'Number of chunks: {len(chunks)}')
for i, chunk in enumerate(chunks):
    total_lines = sum(l for _, l in chunk)
    print(f'  Chunk {i+1}: {len(chunk)} files, {total_lines} lines')
    for f, l in chunk:
        print(f'    {f} ({l} lines)')

# Write chunk files
for i, chunk in enumerate(chunks):
    chunk_data = {
        'files': [f for f, _ in chunk],
        'chunk_num': i + 1,
        'total_chunks': len(chunks),
        'deep_mode': False
    }
    Path(f'graphify-out/.graphify_chunk_{i+1:02d}_input.json').write_text(json.dumps(chunk_data, indent=2), encoding='utf-8')
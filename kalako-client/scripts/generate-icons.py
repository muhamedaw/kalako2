"""Generate PWA icons + apple-touch-icon + OG image for Kalako."""
import struct, zlib, os

def make_png(size, r, g, b):
    """Create a minimal valid PNG with a solid color and a simple circle."""
    def chunk(ctype, data):
        c = ctype + data
        return struct.pack('>I', len(data)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)

    raw = b''
    cx = cy = size // 2
    r2 = (size // 2 - 2) ** 2
    for y in range(size):
        row = b'\x00'  # filter byte
        for x in range(size):
            dx, dy = x - cx, y - cy
            dist = dx*dx + dy*dy
            if dist < r2:
                row += bytes([r, g, b, 255])
            else:
                row += bytes([0, 0, 0, 0])
        raw += row

    ihdr = struct.pack('>IIBBBBB', size, size, 8, 6, 0, 0, 0)
    return (b'\x89PNG\r\n\x1a\n'
            + chunk(b'IHDR', ihdr)
            + chunk(b'IDAT', zlib.compress(raw))
            + chunk(b'IEND', b''))

# Brand colors
colors = {
    'icon-512x512.png': (255, 93, 162),
    'icon-192x192.png': (255, 93, 162),
    'maskable-512x512.png': (123, 92, 250),
    'apple-touch-icon.png': (255, 93, 162),
    'og-image.png': (18, 7, 31),
}

os.makedirs('public', exist_ok=True)
for name, (r, g, b) in colors.items():
    s = 512 if '512' in name else 192 if '192' in name else 180 if 'apple' in name else 1200
    data = make_png(s, r, g, b)
    path = f'public/{name}'
    with open(path, 'wb') as f:
        f.write(data)
    print(f'Created {path} ({s}x{s})')

print('Done - all icons generated')

#!/usr/bin/env python3
"""
Generate PNG icon files for the ReadMeter Chrome extension.
Uses only Python standard library - no PIL/Pillow required.
Creates a green rounded square with a white book/page shape and a progress bar.
"""

import struct
import zlib
import math
import os

def create_png(width, height, pixels):
    """
    Create a valid PNG file from raw RGBA pixel data.
    pixels: list of rows, each row is a list of (R, G, B, A) tuples.
    """
    def make_chunk(chunk_type, data):
        chunk = chunk_type + data
        crc = struct.pack('>I', zlib.crc32(chunk) & 0xFFFFFFFF)
        return struct.pack('>I', len(data)) + chunk + crc

    # PNG signature
    signature = b'\x89PNG\r\n\x1a\n'

    # IHDR chunk
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    # bit depth=8, color type=6 (RGBA), compression=0, filter=0, interlace=0
    ihdr = make_chunk(b'IHDR', ihdr_data)

    # IDAT chunk - image data
    raw_data = b''
    for row in pixels:
        raw_data += b'\x00'  # filter type: None
        for r, g, b, a in row:
            raw_data += struct.pack('BBBB', r, g, b, a)

    compressed = zlib.compress(raw_data, 9)
    idat = make_chunk(b'IDAT', compressed)

    # IEND chunk
    iend = make_chunk(b'IEND', b'')

    return signature + ihdr + idat + iend


def lerp(a, b, t):
    """Linear interpolation between a and b by factor t (0..1)."""
    return a + (b - a) * t


def blend_over(bg, fg):
    """Alpha-composite fg over bg. Both are (R,G,B,A) with 0-255 values."""
    br, bg_, bb, ba = bg
    fr, fg_, fb, fa = fg
    fa_f = fa / 255.0
    ba_f = ba / 255.0
    out_a = fa_f + ba_f * (1 - fa_f)
    if out_a == 0:
        return (0, 0, 0, 0)
    out_r = int((fr * fa_f + br * ba_f * (1 - fa_f)) / out_a)
    out_g = int((fg_ * fa_f + bg_ * ba_f * (1 - fa_f)) / out_a)
    out_b = int((fb * fa_f + bb * ba_f * (1 - fa_f)) / out_a)
    out_alpha = int(out_a * 255)
    return (
        max(0, min(255, out_r)),
        max(0, min(255, out_g)),
        max(0, min(255, out_b)),
        max(0, min(255, out_alpha)),
    )


def distance(x1, y1, x2, y2):
    return math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)


def rounded_rect_alpha(x, y, cx, cy, half_w, half_h, radius):
    """
    Return alpha (0.0 to 1.0) for a pixel at (x,y) for a rounded rectangle
    centered at (cx, cy) with half-width half_w, half-height half_h, corner radius.
    Uses anti-aliasing (smooth edge over ~1.2 pixels).
    """
    # Map to the corner region
    dx = abs(x - cx)
    dy = abs(y - cy)

    # Inside the non-corner region
    if dx <= half_w - radius and dy <= half_h:
        return 1.0
    if dy <= half_h - radius and dx <= half_w:
        return 1.0

    # In the corner region
    if dx > half_w - radius and dy > half_h - radius:
        corner_cx = half_w - radius
        corner_cy = half_h - radius
        dist = math.sqrt((dx - corner_cx) ** 2 + (dy - corner_cy) ** 2)
        # Anti-alias: smooth over ~1.2 pixel
        edge = radius
        aa = 1.2
        if dist <= edge - aa / 2:
            return 1.0
        elif dist >= edge + aa / 2:
            return 0.0
        else:
            return 1.0 - (dist - (edge - aa / 2)) / aa

    # Outside bounds
    if dx > half_w or dy > half_h:
        return 0.0

    return 1.0


def draw_filled_rounded_rect(pixels, cx, cy, w, h, radius, color):
    """Draw a filled rounded rectangle onto the pixel buffer."""
    r, g, b = color
    half_w = w / 2.0
    half_h = h / 2.0
    height = len(pixels)
    width = len(pixels[0])
    y_start = max(0, int(cy - half_h - 2))
    y_end = min(height, int(cy + half_h + 2))
    x_start = max(0, int(cx - half_w - 2))
    x_end = min(width, int(cx + half_w + 2))

    for py in range(y_start, y_end):
        for px in range(x_start, x_end):
            alpha = rounded_rect_alpha(px + 0.5, py + 0.5, cx, cy, half_w, half_h, radius)
            if alpha > 0:
                a = int(alpha * 255)
                fg = (r, g, b, a)
                pixels[py][px] = blend_over(pixels[py][px], fg)


def draw_rect(pixels, x1, y1, x2, y2, color):
    """Draw a simple filled rectangle (no rounding)."""
    r, g, b, a = color
    height = len(pixels)
    width = len(pixels[0])
    for py in range(max(0, int(y1)), min(height, int(y2))):
        for px in range(max(0, int(x1)), min(width, int(x2))):
            fg = (r, g, b, a)
            pixels[py][px] = blend_over(pixels[py][px], fg)


def draw_book_icon(pixels, size):
    """
    Draw the ReadMeter icon at the given size:
    - Green rounded square background
    - White book/page shape
    - Small progress bar at the bottom
    """
    cx = size / 2.0
    cy = size / 2.0
    s = size  # shorthand

    # --- 1. Green rounded-square background ---
    bg_margin = s * 0.06
    bg_w = s - 2 * bg_margin
    bg_h = s - 2 * bg_margin
    bg_radius = s * 0.18
    draw_filled_rounded_rect(pixels, cx, cy, bg_w, bg_h, bg_radius, (76, 175, 80))

    # --- 2. Subtle darker green shadow/depth at bottom ---
    shadow_h = s * 0.06
    shadow_top = cy + bg_h / 2 - shadow_h - bg_margin * 0.5
    draw_rect(pixels,
              cx - bg_w / 2 + bg_radius * 0.5, shadow_top,
              cx + bg_w / 2 - bg_radius * 0.5, shadow_top + shadow_h,
              (56, 142, 60, 40))

    # --- 3. White book/page shape ---
    # The book: a slightly open book seen from the front
    # Two pages side by side with a spine in the middle
    book_w = s * 0.52
    book_h = s * 0.48
    book_top = cy - s * 0.10
    book_cx = cx

    # Left page
    page_w = book_w * 0.47
    page_h = book_h
    left_page_x1 = book_cx - book_w / 2
    left_page_y1 = book_top - book_h / 2
    left_page_x2 = book_cx - s * 0.015
    left_page_y2 = book_top + book_h / 2
    draw_rect(pixels, left_page_x1, left_page_y1, left_page_x2, left_page_y2,
              (255, 255, 255, 230))

    # Right page
    right_page_x1 = book_cx + s * 0.015
    right_page_y1 = book_top - book_h / 2
    right_page_x2 = book_cx + book_w / 2
    right_page_y2 = book_top + book_h / 2
    draw_rect(pixels, right_page_x1, right_page_y1, right_page_x2, right_page_y2,
              (255, 255, 255, 230))

    # Spine line (thin dark green line in the center)
    spine_w = max(1, s * 0.025)
    draw_rect(pixels,
              book_cx - spine_w / 2, left_page_y1,
              book_cx + spine_w / 2, left_page_y2,
              (46, 125, 50, 180))

    # --- 4. Text lines on the left page (tiny gray lines) ---
    if s >= 32:
        line_color = (76, 175, 80, 120)
        num_lines = max(2, int(s * 0.06))
        line_h = max(1, s * 0.018)
        line_margin_x = s * 0.04
        line_spacing = (page_h * 0.7) / max(1, num_lines)
        line_start_y = left_page_y1 + page_h * 0.15
        for i in range(num_lines):
            ly = line_start_y + i * line_spacing
            # Vary line width slightly
            lw_factor = 0.85 if i % 3 == 2 else 1.0
            lx1 = left_page_x1 + line_margin_x
            lx2 = left_page_x2 - line_margin_x * 0.5
            lx2 = lx1 + (lx2 - lx1) * lw_factor
            draw_rect(pixels, lx1, ly, lx2, ly + line_h, line_color)

    # --- 5. Text lines on the right page ---
    if s >= 32:
        for i in range(num_lines):
            ly = line_start_y + i * line_spacing
            lw_factor = 0.75 if i % 3 == 1 else 0.95
            lx1 = right_page_x1 + line_margin_x * 0.5
            lx2 = right_page_x2 - line_margin_x
            lx2 = lx1 + (lx2 - lx1) * lw_factor
            draw_rect(pixels, lx1, ly, lx2, ly + line_h, line_color)

    # --- 6. Progress bar at the bottom ---
    bar_h = max(2, s * 0.065)
    bar_w = s * 0.55
    bar_y = cy + s * 0.28
    bar_x = cx - bar_w / 2

    # Bar background (white, semi-transparent)
    draw_rect(pixels, bar_x, bar_y, bar_x + bar_w, bar_y + bar_h,
              (255, 255, 255, 160))

    # Bar fill (~65% progress, brighter/lighter green)
    fill_ratio = 0.65
    draw_rect(pixels, bar_x, bar_y, bar_x + bar_w * fill_ratio, bar_y + bar_h,
              (200, 230, 201, 255))

    # Bar fill accent (slightly more vivid inner part)
    accent_h = max(1, bar_h * 0.5)
    accent_y = bar_y + (bar_h - accent_h) / 2
    draw_rect(pixels, bar_x, accent_y,
              bar_x + bar_w * fill_ratio, accent_y + accent_h,
              (255, 255, 255, 100))


def generate_icon(size, filepath):
    """Generate a single icon PNG of the given size."""
    # Initialize transparent pixel buffer
    pixels = [[(0, 0, 0, 0) for _ in range(size)] for _ in range(size)]

    draw_book_icon(pixels, size)

    png_data = create_png(size, size, pixels)
    with open(filepath, 'wb') as f:
        f.write(png_data)
    file_size = os.path.getsize(filepath)
    print(f"  Created {filepath} ({size}x{size}, {file_size} bytes)")


def main():
    icons_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'icons')
    os.makedirs(icons_dir, exist_ok=True)

    print("Generating ReadMeter icons...")
    for size in [16, 48, 128]:
        filepath = os.path.join(icons_dir, f'icon-{size}.png')
        generate_icon(size, filepath)

    print("Done! All icons generated successfully.")


if __name__ == '__main__':
    main()

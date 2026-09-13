"""
Generates the complete Veritas favicon suite:
- favicon.svg (Modern vector tab icon)
- favicon-16x16.png (Sharp 16x16 PNG with alpha transparency)
- favicon-32x32.png (Retina 32x32 PNG with alpha transparency)
- apple-touch-icon.png (180x180 iOS/mobile home-screen icon)
- favicon.png (512x512 Master PWA app icon)
- favicon.ico (Multi-resolution Windows/Chrome ICO: 16, 32, 48)
- site.webmanifest (PWA manifest)
"""
import os
import math
from PIL import Image, ImageDraw, ImageFilter

def create_master_icon(size=1024):
    """
    Renders a bold, ultra-high-contrast Veritas 'V' icon on a dark obsidian squircle
    with rounded corners and smooth alpha transparency.
    """
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 1. Background Squircle with smooth rounded corners
    padding = int(size * 0.04) # 4% padding so edges don't clip
    sq_size = size - (2 * padding)
    radius = int(size * 0.22) # Modern squircle curvature

    # Outer border glow layer
    glow_img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_img)
    glow_draw.rounded_rectangle(
        [padding - 4, padding - 4, size - padding + 4, size - padding + 4],
        radius=radius + 4,
        outline=(139, 92, 246, 120),
        width=int(size * 0.02)
    )
    glow_img = glow_img.filter(ImageFilter.GaussianBlur(radius=int(size * 0.02)))
    img.alpha_composite(glow_img)

    # Dark Obsidian Container
    # Vertical gradient simulation for squircle
    sq_mask = Image.new('L', (size, size), 0)
    mask_draw = ImageDraw.Draw(sq_mask)
    mask_draw.rounded_rectangle(
        [padding, padding, size - padding, size - padding],
        radius=radius,
        fill=255
    )

    sq_bg = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    sq_draw = ImageDraw.Draw(sq_bg)
    for y in range(padding, size - padding):
        factor = (y - padding) / float(sq_size)
        # Gradient from rich deep obsidian #121626 to #090C16
        r = int(18 * (1 - factor) + 9 * factor)
        g = int(22 * (1 - factor) + 12 * factor)
        b = int(38 * (1 - factor) + 22 * factor)
        sq_draw.line([(padding, y), (size - padding, y)], fill=(r, g, b, 255))

    img.paste(sq_bg, (0, 0), sq_mask)

    # Beveled rim stroke
    rim_img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    rim_draw = ImageDraw.Draw(rim_img)
    rim_draw.rounded_rectangle(
        [padding, padding, size - padding, size - padding],
        radius=radius,
        outline=(255, 255, 255, 70),
        width=int(size * 0.015)
    )
    img.alpha_composite(rim_img)

    # Inner ambient core radial glow
    core_glow = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    cg_draw = ImageDraw.Draw(core_glow)
    cx, cy = size // 2, int(size * 0.58)
    cg_radius = int(size * 0.35)
    cg_draw.ellipse(
        [cx - cg_radius, cy - cg_radius, cx + cg_radius, cy + cg_radius],
        fill=(124, 93, 250, 90)
    )
    core_glow = core_glow.filter(ImageFilter.GaussianBlur(radius=int(size * 0.08)))
    img.alpha_composite(core_glow)

    # 2. Draw the Veritas 'V' Symbol (Large, Bold, High-Contrast)
    # Coordinates normalized to size
    top_y = int(size * 0.20)
    bottom_y = int(size * 0.78)
    mid_x = size // 2
    left_outer_x = int(size * 0.16)
    left_inner_x = int(size * 0.32)
    right_inner_x = int(size * 0.68)
    right_outer_x = int(size * 0.84)
    apex_stem_y = int(size * 0.56)

    # Left Wing (Electric Violet Gradient)
    left_wing = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    lw_draw = ImageDraw.Draw(left_wing)
    lw_points = [
        (left_outer_x, top_y),
        (left_inner_x + int(size * 0.03), top_y),
        (mid_x, bottom_y),
        (mid_x - int(size * 0.07), bottom_y),
        (left_outer_x, top_y + int(size * 0.08))
    ]
    lw_draw.polygon(lw_points, fill=(139, 92, 246, 255)) # #8B5CF6
    # Left highlight facet
    lw_highlight = [
        (left_outer_x, top_y),
        (left_inner_x + int(size * 0.03), top_y),
        (left_inner_x - int(size * 0.02), top_y + int(size * 0.04)),
        (left_outer_x + int(size * 0.02), top_y + int(size * 0.04))
    ]
    lw_draw.polygon(lw_highlight, fill=(255, 255, 255, 180))
    img.alpha_composite(left_wing)

    # Right Wing (Vivid Cyan/Sky-Blue Gradient)
    right_wing = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    rw_draw = ImageDraw.Draw(right_wing)
    rw_points = [
        (right_inner_x - int(size * 0.03), top_y),
        (right_outer_x, top_y),
        (right_outer_x, top_y + int(size * 0.08)),
        (mid_x + int(size * 0.07), bottom_y),
        (mid_x, bottom_y)
    ]
    rw_draw.polygon(rw_points, fill=(56, 189, 248, 255)) # #38BDF8
    # Right highlight facet
    rw_highlight = [
        (right_inner_x - int(size * 0.03), top_y),
        (right_outer_x, top_y),
        (right_outer_x - int(size * 0.02), top_y + int(size * 0.04)),
        (right_inner_x, top_y + int(size * 0.04))
    ]
    rw_draw.polygon(rw_highlight, fill=(255, 255, 255, 200))
    img.alpha_composite(right_wing)

    # Center Radiant Seam
    seam_img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    seam_draw = ImageDraw.Draw(seam_img)
    seam_draw.line(
        [(mid_x, top_y + int(size * 0.28)), (mid_x, bottom_y - int(size * 0.02))],
        fill=(255, 255, 255, 230),
        width=int(size * 0.018)
    )
    img.alpha_composite(seam_img)

    # Apex Golden Diamond Accent (The Socratic Insight Beacon)
    beacon_img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    beacon_draw = ImageDraw.Draw(beacon_img)
    b_cx = mid_x
    b_cy = int(size * 0.40)
    b_size = int(size * 0.065)
    beacon_points = [
        (b_cx, b_cy - b_size),
        (b_cx + int(b_size * 0.7), b_cy),
        (b_cx, b_cy + b_size),
        (b_cx - int(b_size * 0.7), b_cy)
    ]
    beacon_draw.polygon(beacon_points, fill=(251, 191, 36, 255)) # #FBBF24
    # Center white sparkle point
    core_pts = [
        (b_cx, b_cy - int(b_size * 0.45)),
        (b_cx + int(b_size * 0.35), b_cy),
        (b_cx, b_cy + int(b_size * 0.45)),
        (b_cx - int(b_size * 0.35), b_cy)
    ]
    beacon_draw.polygon(core_pts, fill=(255, 255, 255, 255))
    img.alpha_composite(beacon_img)

    return img


def generate_favicon_svg():
    """Generates a crisp, bold, scalable SVG for modern browser tabs."""
    return """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <defs>
    <!-- Background Squircle Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#14192B" />
      <stop offset="50%" stop-color="#0E1220" />
      <stop offset="100%" stop-color="#080A12" />
    </linearGradient>

    <!-- Bevel Border Gradient -->
    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(255, 255, 255, 0.45)" />
      <stop offset="40%" stop-color="rgba(139, 92, 246, 0.35)" />
      <stop offset="100%" stop-color="rgba(56, 189, 248, 0.4)" />
    </linearGradient>

    <!-- Left Wing Electric Violet -->
    <linearGradient id="violetWing" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#C084FC" />
      <stop offset="60%" stop-color="#8B5CF6" />
      <stop offset="100%" stop-color="#6366F1" />
    </linearGradient>

    <!-- Right Wing Vivid Cyan -->
    <linearGradient id="cyanWing" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#7DD3FC" />
      <stop offset="60%" stop-color="#38BDF8" />
      <stop offset="100%" stop-color="#0284C7" />
    </linearGradient>

    <!-- Core Ambient Glow -->
    <radialGradient id="apexGlow" cx="50%" cy="58%" r="42%">
      <stop offset="0%" stop-color="#8B5CF6" stop-opacity="0.5" />
      <stop offset="100%" stop-color="#8B5CF6" stop-opacity="0" />
    </radialGradient>
  </defs>

  <!-- Obsidian Rounded Squircle -->
  <rect x="3" y="3" width="58" height="58" rx="14" fill="url(#bgGrad)" />
  <rect x="3" y="3" width="58" height="58" rx="14" fill="none" stroke="url(#borderGrad)" stroke-width="1.8" />

  <!-- Ambient Glow -->
  <circle cx="32" cy="38" r="20" fill="url(#apexGlow)" />

  <!-- Bold High-Contrast Veritas 'V' Symbol -->
  <!-- Left Violet Wing -->
  <path d="M11 14H21L32 49L27.5 49L11 19Z" fill="url(#violetWing)" />
  <!-- Left Specular Top Bevel -->
  <path d="M11 14H21L19.5 16.5H12Z" fill="#FFFFFF" opacity="0.65" />

  <!-- Right Cyan Wing -->
  <path d="M43 14H53L53 19L36.5 49L32 49Z" fill="url(#cyanWing)" />
  <!-- Right Specular Top Bevel -->
  <path d="M43 14H53L52 16.5H44.5Z" fill="#FFFFFF" opacity="0.75" />

  <!-- Center Radiant Seam -->
  <line x1="32" y1="32" x2="32" y2="48" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round" opacity="0.85" />

  <!-- Golden Socratic Diamond Beacon -->
  <polygon points="32,22 35.5,27 32,32 28.5,27" fill="#FBBF24" />
  <polygon points="32,24 33.8,27 32,30 30.2,27" fill="#FFFFFF" />
</svg>"""


def main():
    print("[*] Generating Veritas Master Favicon Suite...")
    master = create_master_icon(1024)

    # Define targets
    public_dir = os.path.join("frontend", "public")
    dist_dir = os.path.join("frontend", "dist")

    os.makedirs(public_dir, exist_ok=True)
    if os.path.exists(dist_dir):
        os.makedirs(dist_dir, exist_ok=True)

    # 1. Generate PNGs at all required resolutions
    png_specs = [
        ("favicon.png", 512),
        ("apple-touch-icon.png", 180),
        ("favicon-32x32.png", 32),
        ("favicon-16x16.png", 16),
    ]

    for filename, sz in png_specs:
        resized = master.resize((sz, sz), Image.Resampling.LANCZOS)
        out_public = os.path.join(public_dir, filename)
        resized.save(out_public, "PNG")
        print(f"   [+] Generated {out_public} ({sz}x{sz})")

        if os.path.exists(dist_dir):
            out_dist = os.path.join(dist_dir, filename)
            resized.save(out_dist, "PNG")

    # 2. Generate Multi-Resolution favicon.ico (16, 32, 48)
    ico_img_16 = master.resize((16, 16), Image.Resampling.LANCZOS)
    ico_img_32 = master.resize((32, 32), Image.Resampling.LANCZOS)
    ico_img_48 = master.resize((48, 48), Image.Resampling.LANCZOS)

    ico_public = os.path.join(public_dir, "favicon.ico")
    ico_img_48.save(
        ico_public,
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
        append_images=[ico_img_16, ico_img_32]
    )
    print(f"   [+] Generated {ico_public} (Multi-res ICO: 16, 32, 48)")

    if os.path.exists(dist_dir):
        ico_dist = os.path.join(dist_dir, "favicon.ico")
        ico_img_48.save(
            ico_dist,
            format="ICO",
            sizes=[(16, 16), (32, 32), (48, 48)],
            append_images=[ico_img_16, ico_img_32]
        )

    # 3. Generate favicon.svg
    svg_content = generate_favicon_svg()
    svg_public = os.path.join(public_dir, "favicon.svg")
    with open(svg_public, "w", encoding="utf-8") as f:
        f.write(svg_content)
    print(f"   [+] Generated {svg_public} (Scalable SVG)")

    if os.path.exists(dist_dir):
        svg_dist = os.path.join(dist_dir, "favicon.svg")
        with open(svg_dist, "w", encoding="utf-8") as f:
            f.write(svg_content)

    # 4. Generate site.webmanifest
    manifest_content = """{
  "name": "Veritas — Socratic Math Tutor",
  "short_name": "Veritas",
  "icons": [
    {
      "src": "/favicon-16x16.png",
      "sizes": "16x16",
      "type": "image/png"
    },
    {
      "src": "/favicon-32x32.png",
      "sizes": "32x32",
      "type": "image/png"
    },
    {
      "src": "/favicon.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "/apple-touch-icon.png",
      "sizes": "180x180",
      "type": "image/png"
    }
  ],
  "theme_color": "#0F172A",
  "background_color": "#0F172A",
  "display": "standalone"
}"""
    manifest_public = os.path.join(public_dir, "site.webmanifest")
    with open(manifest_public, "w", encoding="utf-8") as f:
        f.write(manifest_content)
    print(f"   [+] Generated {manifest_public} (Web Manifest)")

    if os.path.exists(dist_dir):
        manifest_dist = os.path.join(dist_dir, "site.webmanifest")
        with open(manifest_dist, "w", encoding="utf-8") as f:
            f.write(manifest_content)

    print("[SUCCESS] Veritas Favicon Suite Successfully Created & Installed!")

if __name__ == "__main__":
    main()


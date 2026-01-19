#!/usr/bin/env python3
"""
Generate an Ultrathink banner PNG with 4:1 aspect ratio matching the website header branding.
"""

from PIL import Image, ImageDraw, ImageFont
import os
import sys
import urllib.request

def download_space_grotesk():
    """Download Space Grotesk SemiBold (600 weight) TTF from Google Fonts."""
    font_urls = [
        "https://github.com/google/fonts/raw/main/ofl/spacegrotesk/static/SpaceGrotesk-SemiBold.ttf",
        "https://fonts.gstatic.com/s/spacegrotesk/v16/V8mQoQDjQSkFtoMM3T6r8E7mPbF4Cw.woff2",
        "https://github.com/googlefonts/space-grotesk/raw/main/fonts/ttf/SpaceGrotesk-SemiBold.ttf",
    ]
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    font_cache_dir = os.path.join(script_dir, '.font_cache')
    os.makedirs(font_cache_dir, exist_ok=True)
    
    font_path = os.path.join(font_cache_dir, 'SpaceGrotesk-SemiBold.ttf')
    
    if not os.path.exists(font_path):
        for font_url in font_urls:
            try:
                print(f"Attempting to download Space Grotesk font...")
                urllib.request.urlretrieve(font_url, font_path)
                if os.path.exists(font_path) and os.path.getsize(font_path) > 0:
                    print(f"Font downloaded to {font_path}")
                    return font_path
            except Exception as e:
                print(f"Warning: Could not download from {font_url}: {e}")
                if os.path.exists(font_path):
                    os.remove(font_path)
                continue
        return None
    
    return font_path if os.path.exists(font_path) else None

def find_font():
    """Find monospace font to match the website header (u-text-mono class)."""
    # The website header uses: ui-monospace, sfmono-regular, menlo, monaco, monospace
    # Priority order matching CSS fallback chain
    monospace_fonts = [
        # macOS SF Mono
        '/System/Library/Fonts/SFMono-Bold.otf',
        '/System/Library/Fonts/SFMono-Semibold.otf',
        '/System/Library/Fonts/SFMono-Regular.otf',
        '/Library/Fonts/SF-Mono-Bold.otf',
        '/Library/Fonts/SF-Mono-Semibold.otf',
        # macOS Menlo
        '/System/Library/Fonts/Menlo.ttc',
        # macOS Monaco
        '/System/Library/Fonts/Monaco.ttf',
        '/System/Library/Fonts/Supplemental/Monaco.ttf',
        # Courier New (common fallback)
        '/System/Library/Fonts/Supplemental/Courier New Bold.ttf',
        '/System/Library/Fonts/Supplemental/Courier New.ttf',
        '/Library/Fonts/Courier New Bold.ttf',
        # Linux monospace fonts
        '/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf',
        '/usr/share/fonts/truetype/liberation/LiberationMono-Bold.ttf',
        # Windows
        'C:/Windows/Fonts/consola.ttf',
        'C:/Windows/Fonts/cour.ttf',
    ]
    
    for path in monospace_fonts:
        if os.path.exists(path):
            return path
    
    return None

def generate_4x1_banner(output_path='ultrathink-banner-4x1.png', width=1200, scale=2):
    """
    Generate the Ultrathink banner PNG with 4:1 aspect ratio.
    
    Args:
        output_path: Path to save the PNG file
        width: Width of the banner in pixels (height = width/4)
        scale: Scale factor for higher resolution
    """
    # Paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    logo_path = os.path.join(project_root, 'assets', 'icons', 'ultrathink-mobius.png')
    
    if not os.path.exists(logo_path):
        print(f"Error: Logo not found at {logo_path}")
        sys.exit(1)
    
    # Canvas dimensions (4:1 aspect ratio)
    canvas_width = width * scale
    canvas_height = (width // 4) * scale
    
    # Create white background canvas
    canvas = Image.new('RGB', (canvas_width, canvas_height), (255, 255, 255))
    draw = ImageDraw.Draw(canvas)
    
    # Load and resize logo
    logo = Image.open(logo_path)
    logo_size = int(canvas_height * 0.55)  # Logo is 55% of height
    logo = logo.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
    
    # Font settings
    font_size = int(canvas_height * 0.22)
    letter_spacing = 0.08
    
    font_path = find_font()
    try:
        if font_path:
            font = ImageFont.truetype(font_path, font_size)
        else:
            font = ImageFont.load_default()
            print("Warning: Using default font. Install Space Grotesk for best results.")
    except Exception as e:
        print(f"Warning: Could not load font from {font_path}: {e}")
        font = ImageFont.load_default()
    
    # Text to render
    text = "ULTRATHINK"
    text_color = (51, 51, 51)  # Dark grey (#333333) matching the header
    
    # Calculate text dimensions with letter spacing
    char_widths = []
    char_heights = []
    for char in text:
        bbox = font.getbbox(char)
        char_widths.append(bbox[2] - bbox[0])
        char_heights.append(bbox[3] - bbox[1])
    
    total_text_width = sum(char_widths) + (len(text) - 1) * (font_size * letter_spacing)
    max_char_height = max(char_heights) if char_heights else font_size
    
    # Gap between logo and text
    gap = int(canvas_height * 0.08)
    
    # Calculate total content width to center everything
    total_content_width = logo_size + gap + int(total_text_width)
    
    # Starting X position to center content
    start_x = (canvas_width - total_content_width) // 2
    
    # Draw logo (centered vertically)
    logo_x = start_x
    logo_y = (canvas_height - logo_size) // 2
    
    # Apply filter to darken logo for light background (similar to CSS filter)
    # brightness(0.7) contrast(1.2)
    if logo.mode == 'RGBA':
        logo_array = logo.copy()
        # Darken the logo
        from PIL import ImageEnhance
        enhancer = ImageEnhance.Brightness(logo_array)
        logo_array = enhancer.enhance(0.7)
        enhancer = ImageEnhance.Contrast(logo_array)
        logo_array = enhancer.enhance(1.2)
        canvas.paste(logo_array, (logo_x, logo_y), logo_array)
    else:
        canvas.paste(logo, (logo_x, logo_y))
    
    # Draw text with letter spacing (centered vertically)
    text_x = logo_x + logo_size + gap
    text_y = (canvas_height - max_char_height) // 2
    
    current_x = text_x
    for i, char in enumerate(text):
        bbox = font.getbbox(char)
        char_height = bbox[3] - bbox[1]
        char_y = text_y + (max_char_height - char_height) // 2
        
        draw.text((current_x, char_y), char, fill=text_color, font=font)
        current_x += char_widths[i] + (font_size * letter_spacing)
    
    # Save PNG
    canvas.save(output_path, 'PNG', optimize=False, compress_level=1)
    print(f"Generated 4:1 banner: {output_path}")
    print(f"Dimensions: {canvas_width}x{canvas_height} pixels")
    return output_path

if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Generate Ultrathink 4:1 aspect ratio banner PNG')
    parser.add_argument('--output', type=str, default='ultrathink-banner-4x1.png',
                       help='Output file path (default: ultrathink-banner-4x1.png)')
    parser.add_argument('--width', type=int, default=1200,
                       help='Banner width in pixels, height = width/4 (default: 1200)')
    parser.add_argument('--scale', type=int, default=2,
                       help='Scale factor for resolution (default: 2 for 2x)')
    
    args = parser.parse_args()
    
    generate_4x1_banner(args.output, args.width, args.scale)

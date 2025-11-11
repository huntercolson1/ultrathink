#!/usr/bin/env python3
"""
Generate an Ultrathink banner PNG matching the website header branding.
"""

from PIL import Image, ImageDraw, ImageFont
import os
import sys
import urllib.request

def download_space_grotesk():
    """Download Space Grotesk SemiBold (600 weight) TTF from Google Fonts."""
    # Try multiple possible URLs for Space Grotesk
    font_urls = [
        "https://github.com/google/fonts/raw/main/ofl/spacegrotesk/static/SpaceGrotesk-SemiBold.ttf",
        "https://fonts.gstatic.com/s/spacegrotesk/v16/V8mQoQDjQSkFtoMM3T6r8E7mPbF4Cw.woff2",
        "https://github.com/googlefonts/space-grotesk/raw/main/fonts/ttf/SpaceGrotesk-SemiBold.ttf",
    ]
    
    # Create temp directory for fonts
    script_dir = os.path.dirname(os.path.abspath(__file__))
    font_cache_dir = os.path.join(script_dir, '.font_cache')
    os.makedirs(font_cache_dir, exist_ok=True)
    
    font_path = os.path.join(font_cache_dir, 'SpaceGrotesk-SemiBold.ttf')
    
    # Download if not cached
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
    """Try to find Space Grotesk font, fallback to system fonts."""
    # Common system font paths
    system_fonts = [
        # macOS
        '/System/Library/Fonts/Supplemental/Arial.ttf',
        '/Library/Fonts/Arial.ttf',
        # Linux
        '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
        '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
        # Windows (if running on Windows)
        'C:/Windows/Fonts/arial.ttf',
    ]
    
    # Try Space Grotesk from Google Fonts if installed locally
    space_grotesk_paths = [
        os.path.expanduser('~/Library/Fonts/SpaceGrotesk-SemiBold.ttf'),
        os.path.expanduser('~/Library/Fonts/SpaceGrotesk-Bold.ttf'),
        '/System/Library/Fonts/Supplemental/SpaceGrotesk-SemiBold.ttf',
    ]
    
    # Try Space Grotesk first (local installs)
    for path in space_grotesk_paths:
        if os.path.exists(path):
            return path
    
    # Try downloading from Google Fonts
    downloaded_font = download_space_grotesk()
    if downloaded_font:
        return downloaded_font
    
    # Fallback to system fonts
    for path in system_fonts:
        if os.path.exists(path):
            return path
    
    # Last resort: use default font
    return None

def generate_banner(output_path='ultrathink-banner.png', logo_size=48, scale=4):
    """
    Generate the Ultrathink banner PNG.
    
    Args:
        output_path: Path to save the PNG file
        logo_size: Size of the logo in pixels (default: 48)
        scale: Scale factor for higher resolution (default: 4 for 4x resolution)
    """
    # Paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    logo_path = os.path.join(project_root, 'assets', 'icons', 'ultrathink-mobius.png')
    
    if not os.path.exists(logo_path):
        print(f"Error: Logo not found at {logo_path}")
        sys.exit(1)
    
    # Load logo
    logo = Image.open(logo_path)
    
    # Resize logo to desired size (accounting for scale)
    logo_scaled_size = logo_size * scale
    logo = logo.resize((logo_scaled_size, logo_scaled_size), Image.Resampling.LANCZOS)
    
    # Font settings (matching CSS)
    # Font size: 1.1rem = 17.6px at base 16px, scaled
    font_size = int(17.6 * scale)
    letter_spacing = 0.08  # 0.08em
    font_weight = 600  # Semi-bold
    
    # Load font
    font_path = find_font()
    try:
        if font_path:
            font = ImageFont.truetype(font_path, font_size)
        else:
            # Use default font
            font = ImageFont.load_default()
            print("Warning: Using default font. Install Space Grotesk for best results.")
    except Exception as e:
        print(f"Warning: Could not load font from {font_path}: {e}")
        font = ImageFont.load_default()
    
    # Text to render
    text = "ULTRATHINK"
    # Medium-dark grey color matching the webpage appearance
    # Based on the image: medium-dark grey (around RGB 140-150 range)
    text_color = (145, 145, 145)  # Medium-dark grey matching webpage
    
    # Calculate text dimensions with letter spacing
    # We'll render each character separately to apply letter spacing
    char_widths = []
    char_heights = []
    for char in text:
        bbox = font.getbbox(char)
        char_widths.append(bbox[2] - bbox[0])
        char_heights.append(bbox[3] - bbox[1])
    
    # Calculate total width: sum of char widths + letter spacing between chars
    total_text_width = sum(char_widths) + (len(text) - 1) * (font_size * letter_spacing)
    max_char_height = max(char_heights) if char_heights else font_size
    
    # Gap between logo and text: 0.5rem = 8px, scaled
    gap = int(8 * scale)
    
    # Canvas dimensions
    padding_vertical = int(16 * scale)  # Vertical padding
    padding_horizontal = int(80 * scale)  # Horizontal padding (much wider banner)
    canvas_width = logo_scaled_size + gap + int(total_text_width) + (padding_horizontal * 2)
    canvas_height = max(logo_scaled_size, max_char_height) + (padding_vertical * 2)
    
    # Create black background canvas (matching webpage)
    canvas = Image.new('RGB', (canvas_width, canvas_height), (0, 0, 0))
    draw = ImageDraw.Draw(canvas)
    
    # Draw logo
    logo_x = padding_horizontal
    logo_y = padding_vertical + (canvas_height - padding_vertical * 2 - logo_scaled_size) // 2
    canvas.paste(logo, (logo_x, logo_y), logo if logo.mode == 'RGBA' else None)
    
    # Draw text with letter spacing
    text_x = logo_x + logo_scaled_size + gap
    text_y = padding_vertical + (canvas_height - padding_vertical * 2 - max_char_height) // 2
    
    # Draw text with letter spacing
    current_x = text_x
    for i, char in enumerate(text):
        # Get character bbox for proper vertical alignment
        bbox = font.getbbox(char)
        char_height = bbox[3] - bbox[1]
        char_y = text_y + (max_char_height - char_height) // 2
        
        # Draw character with the medium-dark grey color
        draw.text((current_x, char_y), char, fill=text_color, font=font)
        
        # Move to next character position with letter spacing
        current_x += char_widths[i] + (font_size * letter_spacing)
    
    # Save PNG with high quality settings
    canvas.save(output_path, 'PNG', optimize=False, compress_level=1)
    print(f"Generated banner: {output_path}")
    print(f"Dimensions: {canvas_width}x{canvas_height} pixels")
    return output_path

if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Generate Ultrathink banner PNG')
    parser.add_argument('--output', type=str, default='ultrathink-banner.png',
                       help='Output file path (default: ultrathink-banner.png)')
    parser.add_argument('--logo-size', type=int, default=48,
                       help='Logo size in pixels (default: 48)')
    parser.add_argument('--scale', type=int, default=4,
                       help='Scale factor for resolution (default: 4 for 4x)')
    
    args = parser.parse_args()
    
    generate_banner(args.output, args.logo_size, args.scale)


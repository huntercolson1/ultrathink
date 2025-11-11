#!/usr/bin/env python3
"""
Generate favicon PNG with black background matching the banner appearance.
"""

from PIL import Image
import os
import sys

def generate_favicon(output_path='assets/icons/favicon.png', logo_size=1024):
    """
    Generate favicon PNG from the Möbius strip logo with black background.
    """
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    
    # Try to use the existing PNG logo, or fall back to SVG conversion
    logo_png_path = os.path.join(project_root, 'assets', 'icons', 'ultrathink-mobius.png')
    logo_svg_path = os.path.join(project_root, 'assets', 'icons', 'ultrathink-mobius.svg')
    
    # Create black background canvas
    canvas_size = logo_size
    canvas = Image.new('RGB', (canvas_size, canvas_size), (0, 0, 0))
    
    # Try to load PNG logo first
    if os.path.exists(logo_png_path):
        try:
            logo = Image.open(logo_png_path)
            
            # If logo has transparency, paste it on black background
            if logo.mode == 'RGBA':
                # Create black background
                bg = Image.new('RGB', logo.size, (0, 0, 0))
                # Paste logo on black background
                bg.paste(logo, mask=logo.split()[3])
                logo = bg
            elif logo.mode != 'RGB':
                logo = logo.convert('RGB')
            
            # Resize to fit canvas
            logo = logo.resize((canvas_size, canvas_size), Image.Resampling.LANCZOS)
            
            # Paste centered on black canvas
            canvas.paste(logo, (0, 0))
            
        except Exception as e:
            print(f"Warning: Could not load PNG logo: {e}")
            print("Falling back to extracting from banner...")
            # Fall back to banner extraction
            banner_path = os.path.join(project_root, 'ultrathink-banner.png')
            if os.path.exists(banner_path):
                banner = Image.open(banner_path)
                # Extract logo area (assuming logo is on the left side)
                # Logo is typically 48px * scale, and banner has padding
                # For 4x scale banner: logo is ~192px, padding is ~320px
                # So logo starts around x=320, y varies
                banner_width, banner_height = banner.size
                
                # Estimate logo size (assuming it's square and on the left)
                # Look for the logo area - it should be roughly square
                # In the banner, logo is scaled 4x, so 48*4 = 192px
                logo_size_estimate = 192
                padding_estimate = 320  # 80*4 scale
                
                # Extract logo region
                logo_region = banner.crop((
                    padding_estimate,  # left
                    (banner_height - logo_size_estimate) // 2,  # top
                    padding_estimate + logo_size_estimate,  # right
                    (banner_height + logo_size_estimate) // 2  # bottom
                ))
                
                # Resize to desired size
                logo_region = logo_region.resize((canvas_size, canvas_size), Image.Resampling.LANCZOS)
                
                # Create black background and paste logo
                canvas = Image.new('RGB', (canvas_size, canvas_size), (0, 0, 0))
                canvas.paste(logo_region, (0, 0))
            else:
                print("Error: Could not find logo source files")
                sys.exit(1)
    else:
        print(f"Error: Logo PNG not found at {logo_png_path}")
        print("Please ensure ultrathink-mobius.png exists")
        sys.exit(1)
    
    # Save favicon
    output_full = os.path.join(project_root, output_path)
    os.makedirs(os.path.dirname(output_full), exist_ok=True)
    canvas.save(output_full, 'PNG', optimize=False)
    print(f"Generated favicon: {output_path}")
    print(f"Dimensions: {canvas_size}x{canvas_size} pixels")
    print(f"Background: Black (#000000)")
    return output_path

if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Generate favicon PNG with black background')
    parser.add_argument('--output', type=str, default='assets/icons/favicon.png',
                       help='Output file path (default: assets/icons/favicon.png)')
    parser.add_argument('--size', type=int, default=1024,
                       help='Favicon size in pixels (default: 1024)')
    
    args = parser.parse_args()
    
    generate_favicon(args.output, args.size)


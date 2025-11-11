#!/usr/bin/env python3
"""
Convert SVG logo to PNG with black background to match banner appearance.
"""

import os
import sys
from PIL import Image
import subprocess

def svg_to_png(svg_path, png_path, size=1024, background='black'):
    """
    Convert SVG to PNG using system tools or fallback methods.
    """
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    
    svg_full = os.path.join(project_root, svg_path)
    png_full = os.path.join(project_root, png_path)
    
    if not os.path.exists(svg_full):
        print(f"Error: SVG file not found at {svg_full}")
        sys.exit(1)
    
    # Try using rsvg-convert (librsvg) - best quality
    try:
        bg_color = '000000' if background == 'black' else 'FFFFFF'
        cmd = ['rsvg-convert', '-w', str(size), '-h', str(size), 
               '--background-color', f'#{bg_color}', svg_full]
        result = subprocess.run(cmd, capture_output=True, check=True)
        with open(png_full, 'wb') as f:
            f.write(result.stdout)
        print(f"Converted {svg_path} to {png_path} using rsvg-convert")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        pass
    
    # Try using Inkscape
    try:
        bg_color = 'black' if background == 'black' else 'white'
        cmd = ['inkscape', svg_full, '--export-type=png', 
               f'--export-filename={png_full}',
               f'--export-width={size}',
               f'--export-height={size}',
               f'--export-background={bg_color}']
        subprocess.run(cmd, check=True, capture_output=True)
        print(f"Converted {svg_path} to {png_path} using Inkscape")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        pass
    
    # Try using ImageMagick
    try:
        bg_color = 'black' if background == 'black' else 'white'
        cmd = ['convert', '-background', bg_color, '-resize', 
               f'{size}x{size}', svg_full, png_full]
        subprocess.run(cmd, check=True, capture_output=True)
        print(f"Converted {svg_path} to {png_path} using ImageMagick")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        pass
    
    # Fallback: Use qlmanage (macOS) or suggest installation
    if sys.platform == 'darwin':
        try:
            # Use qlmanage as a last resort (lower quality)
            cmd = ['qlmanage', '-t', '-s', str(size), '-o', 
                   os.path.dirname(png_full), svg_full]
            subprocess.run(cmd, check=True, capture_output=True)
            # qlmanage creates file with .png extension in the directory
            temp_png = svg_full.replace('.svg', '.png')
            if os.path.exists(temp_png):
                os.rename(temp_png, png_full)
                # Add black background using PIL
                img = Image.open(png_full)
                if img.mode == 'RGBA':
                    bg = Image.new('RGB', img.size, (0, 0, 0))
                    bg.paste(img, mask=img.split()[3])
                    bg.save(png_full, 'PNG')
                print(f"Converted {svg_path} to {png_path} using qlmanage")
                return True
        except Exception as e:
            pass
    
    print("Error: No SVG conversion tool found. Please install one of:")
    print("  - librsvg (brew install librsvg)")
    print("  - Inkscape (brew install inkscape)")
    print("  - ImageMagick (brew install imagemagick)")
    return False

if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Convert SVG logo to PNG')
    parser.add_argument('--svg', type=str, default='assets/icons/ultrathink-mobius.svg',
                       help='Input SVG file path')
    parser.add_argument('--png', type=str, default='assets/icons/ultrathink-mobius.png',
                       help='Output PNG file path')
    parser.add_argument('--size', type=int, default=1024,
                       help='Output size in pixels (default: 1024)')
    parser.add_argument('--background', type=str, default='black', choices=['black', 'white', 'transparent'],
                       help='Background color (default: black)')
    
    args = parser.parse_args()
    
    svg_to_png(args.svg, args.png, args.size, args.background)


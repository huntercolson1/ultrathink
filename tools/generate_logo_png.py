#!/usr/bin/env python3
"""
Generate PNG logo from SVG, ensuring it matches the banner's silver-grey metallic appearance.
"""

import os
import sys
from PIL import Image, ImageDraw
import subprocess

def generate_logo_png(output_path='assets/icons/ultrathink-mobius.png', size=1024):
    """
    Generate PNG logo from SVG with black background to match banner.
    """
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    svg_path = os.path.join(project_root, 'assets', 'icons', 'ultrathink-mobius.svg')
    png_path = os.path.join(project_root, output_path)
    
    if not os.path.exists(svg_path):
        print(f"Error: SVG file not found at {svg_path}")
        sys.exit(1)
    
    # Try using rsvg-convert (librsvg) - best quality
    try:
        cmd = ['rsvg-convert', '-w', str(size), '-h', str(size), 
               '--background-color', '#000000', svg_path]
        result = subprocess.run(cmd, capture_output=True, check=True, text=False)
        with open(png_path, 'wb') as f:
            f.write(result.stdout)
        print(f"Generated {output_path} from SVG (size: {size}x{size})")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("rsvg-convert not found, trying alternative methods...")
    
    # Try using Inkscape
    try:
        cmd = ['inkscape', svg_path, '--export-type=png', 
               f'--export-filename={png_path}',
               f'--export-width={size}',
               f'--export-height={size}',
               '--export-background=black']
        subprocess.run(cmd, check=True, capture_output=True)
        print(f"Generated {output_path} using Inkscape")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        pass
    
    # Fallback: Create a note that manual conversion is needed
    print("\n" + "="*60)
    print("SVG to PNG conversion tools not found.")
    print("Please install one of the following:")
    print("  brew install librsvg    (recommended)")
    print("  brew install inkscape")
    print("\nOr manually convert the SVG to PNG:")
    print(f"  Input:  {svg_path}")
    print(f"  Output: {png_path}")
    print(f"  Size:   {size}x{size}")
    print(f"  Background: Black (#000000)")
    print("="*60)
    return False

if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Generate PNG logo from SVG')
    parser.add_argument('--output', type=str, default='assets/icons/ultrathink-mobius.png',
                       help='Output PNG file path')
    parser.add_argument('--size', type=int, default=1024,
                       help='Output size in pixels (default: 1024)')
    
    args = parser.parse_args()
    
    generate_logo_png(args.output, args.size)


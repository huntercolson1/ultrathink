#!/usr/bin/env python3
"""
Generate PNG logo from SVG, ensuring it matches the banner's silver-grey metallic appearance.
"""

import os
import sys
from PIL import Image, ImageDraw
import subprocess

def generate_logo_png(output_path='assets/icons/ultrathink-mobius.png', size=1024, transparent=True):
    """
    Generate PNG logo from SVG with transparent background.
    
    Args:
        output_path: Path to save the PNG file
        size: Size in pixels (default: 1024)
        transparent: If True, use transparent background (default: True)
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
        if transparent:
            # For transparent background, don't specify background-color
            cmd = ['rsvg-convert', '-w', str(size), '-h', str(size), svg_path]
        else:
            cmd = ['rsvg-convert', '-w', str(size), '-h', str(size), 
                   '--background-color', '#000000', svg_path]
        result = subprocess.run(cmd, capture_output=True, check=True, text=False)
        with open(png_path, 'wb') as f:
            f.write(result.stdout)
        
        # If we got a PNG but it's not transparent and we want transparency, process it
        if transparent:
            try:
                img = Image.open(png_path)
                if img.mode != 'RGBA':
                    img = img.convert('RGBA')
                # Remove black background by making it transparent
                data = img.getdata()
                new_data = []
                for item in data:
                    # If pixel is black or very dark, make it transparent
                    if item[0] < 10 and item[1] < 10 and item[2] < 10:
                        new_data.append((255, 255, 255, 0))
                    else:
                        new_data.append(item)
                img.putdata(new_data)
                img.save(png_path, 'PNG')
            except Exception as e:
                print(f"Warning: Could not process transparency: {e}")
        
        print(f"Generated {output_path} from SVG (size: {size}x{size}, transparent: {transparent})")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("rsvg-convert not found, trying alternative methods...")
    
    # Try using Inkscape
    try:
        if transparent:
            cmd = ['inkscape', svg_path, '--export-type=png', 
                   f'--export-filename={png_path}',
                   f'--export-width={size}',
                   f'--export-height={size}']
        else:
            cmd = ['inkscape', svg_path, '--export-type=png', 
                   f'--export-filename={png_path}',
                   f'--export-width={size}',
                   f'--export-height={size}',
                   '--export-background=black']
        subprocess.run(cmd, check=True, capture_output=True)
        print(f"Generated {output_path} using Inkscape (transparent: {transparent})")
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
    print(f"  Background: {'Transparent' if transparent else 'Black (#000000)'}")
    print("="*60)
    return False

if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Generate PNG logo from SVG')
    parser.add_argument('--output', type=str, default='assets/icons/ultrathink-mobius.png',
                       help='Output PNG file path')
    parser.add_argument('--size', type=int, default=1024,
                       help='Output size in pixels (default: 1024)')
    parser.add_argument('--no-transparent', action='store_true',
                       help='Use black background instead of transparent')
    
    args = parser.parse_args()
    
    generate_logo_png(args.output, args.size, transparent=not args.no_transparent)


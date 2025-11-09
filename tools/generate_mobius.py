#!/usr/bin/env python3
"""
Generate a professional 3D Möbius strip visualization and export to SVG.
"""

import numpy as np
import xml.etree.ElementTree as ET
from xml.dom import minidom
import argparse
import sys

def mobius_strip(u, v, R=1.0, w=0.3):
    """
    Parametric equation for a Möbius strip.
    u: parameter along the strip (0 to 2π)
    v: parameter across the width (-w to w)
    R: radius of the strip
    w: half-width of the strip
    """
    x = (R + v * np.cos(u/2)) * np.cos(u)
    y = (R + v * np.cos(u/2)) * np.sin(u)
    z = v * np.sin(u/2)
    return x, y, z

def calculate_normal(x, y, z, u, v):
    """Calculate surface normal for shading."""
    # Approximate normals using finite differences
    eps = 0.01
    u1, v1 = u + eps, v
    x1, y1, z1 = mobius_strip(u1, v1)
    
    u2, v2 = u, v + eps
    x2, y2, z2 = mobius_strip(u2, v2)
    
    # Tangent vectors
    du = np.array([x1 - x, y1 - y, z1 - z])
    dv = np.array([x2 - x, y2 - y, z2 - z])
    
    # Normal (cross product)
    normal = np.cross(du, dv)
    norm = np.linalg.norm(normal)
    if norm > 0:
        normal = normal / norm
    return normal

def rotate_point(x, y, z, rot_x, rot_y, rot_z):
    """Apply rotations around X, Y, Z axes in order."""
    # Convert to radians
    rx = np.deg2rad(rot_x)
    ry = np.deg2rad(rot_y)
    rz = np.deg2rad(rot_z)
    
    # Rotate around X axis
    y1 = y * np.cos(rx) - z * np.sin(rx)
    z1 = y * np.sin(rx) + z * np.cos(rx)
    x1 = x
    
    # Rotate around Y axis
    x2 = x1 * np.cos(ry) + z1 * np.sin(ry)
    z2 = -x1 * np.sin(ry) + z1 * np.cos(ry)
    y2 = y1
    
    # Rotate around Z axis
    x3 = x2 * np.cos(rz) - y2 * np.sin(rz)
    y3 = x2 * np.sin(rz) + y2 * np.cos(rz)
    z3 = z2
    
    return x3, y3, z3

def generate_mobius_svg(rot_x=25, rot_y=50, rot_z=5, distance=4.5, theme='dark'):
    """
    Generate SVG paths from 3D Möbius strip projection.
    
    Args:
        rot_x: Rotation around X axis in degrees (default: 25)
        rot_y: Rotation around Y axis in degrees (default: 50)
        rot_z: Rotation around Z axis in degrees (default: 5)
        distance: Camera distance for scaling (default: 4.5)
        theme: 'dark' or 'light' - determines color scheme (default: 'dark')
    """
    # Create dense parameter grid for smooth surface
    u = np.linspace(0, 2*np.pi, 80)
    v = np.linspace(-0.3, 0.3, 12)
    
    # Scale and center for SVG viewBox (0 0 160 160)
    # Adjust scale based on distance
    scale = 45 / distance
    center_x, center_y = 80, 80
    
    # Generate 3D coordinates
    U, V = np.meshgrid(u, v)
    X, Y, Z = mobius_strip(U, V, R=1.0, w=0.3)
    
    # Apply rotations
    X_rot, Y_rot, Z_rot = rotate_point(X, Y, Z, rot_x, rot_y, rot_z)
    
    # Project to 2D (orthographic projection)
    X_final = X_rot
    Y_final = Y_rot
    
    # Calculate normals for shading
    # Light from above and slightly to the left (soft, diffuse)
    light_dir = np.array([0.2, 0.6, 0.8])
    light_dir = light_dir / np.linalg.norm(light_dir)
    
    # Scale and center
    x_svg = X_final * scale + center_x
    y_svg = Y_final * scale + center_y
    
    # Create SVG
    svg = ET.Element('svg', {
        'xmlns': 'http://www.w3.org/2000/svg',
        'width': '256',
        'height': '256',
        'viewBox': '0 0 160 160',
        'role': 'img',
        'aria-labelledby': 'title desc'
    })
    
    # Add title and description
    title = ET.SubElement(svg, 'title', {'id': 'title'})
    title.text = 'Ultrathink Möbius Strip Icon'
    
    desc = ET.SubElement(svg, 'desc', {'id': 'desc'})
    desc.text = 'Professional 3D Möbius strip icon for the Ultrathink blog.'
    
    defs = ET.SubElement(svg, 'defs')
    
    # Theme-aware colors matching reference images and site theme
    if theme == 'dark':
        # Light gray/off-white Möbius strip (like reference image)
        # Light gray base with white highlights and darker gray shadows
        base_dark = 200  # ~#c8c8c8 (light gray base)
        highlight_light = 245  # ~#f5f5f5 (near white highlights)
        shadow_dark = 160  # ~#a0a0a0 (darker gray shadows)
    else:
        # Light theme: Slightly darker for contrast on white
        base_dark = 180  # ~#b4b4b4
        highlight_light = 220  # ~#dcdcdc
        shadow_dark = 140  # ~#8c8c8c
    
    # Create gradients for different lighting intensities (dark theme)
    # Intensity values represent how much lighter than base_dark
    intensity_levels = [0.35, 0.25, 0.15, 0.08, 0.02]  # Subtle variations
    for i, intensity_factor in enumerate(intensity_levels):
        # Calculate color: base_dark + (highlight_light - base_dark) * intensity_factor
        mid_gray = int(base_dark + (highlight_light - base_dark) * intensity_factor)
        highlight_gray = int(base_dark + (highlight_light - base_dark) * intensity_factor * 1.2)
        shadow_gray = int(base_dark - (base_dark - shadow_dark) * intensity_factor)
        
        # Clamp values
        mid_gray = max(shadow_dark, min(highlight_light, mid_gray))
        highlight_gray = max(shadow_dark, min(highlight_light, highlight_gray))
        shadow_gray = max(shadow_dark, min(base_dark, shadow_gray))
        
        grad = ET.SubElement(defs, 'linearGradient', {
            'id': f'grad-{i}',
            'x1': '80', 'y1': '20', 'x2': '80', 'y2': '140',
            'gradientUnits': 'userSpaceOnUse'
        })
        ET.SubElement(grad, 'stop', {'offset': '0', 'stop-color': f'#{highlight_gray:02x}{highlight_gray:02x}{highlight_gray:02x}'})
        ET.SubElement(grad, 'stop', {'offset': '0.5', 'stop-color': f'#{mid_gray:02x}{mid_gray:02x}{mid_gray:02x}'})
        ET.SubElement(grad, 'stop', {'offset': '1', 'stop-color': f'#{shadow_gray:02x}{shadow_gray:02x}{shadow_gray:02x}'})
    
    # Subtle highlight gradient (very soft, matte finish)
    highlight = ET.SubElement(defs, 'radialGradient', {
        'id': 'highlight',
        'cx': '75', 'cy': '40', 'r': '50',
        'gradientUnits': 'userSpaceOnUse'
    })
    highlight_color = int(base_dark + (highlight_light - base_dark) * 0.4)
    ET.SubElement(highlight, 'stop', {'offset': '0', 'stop-color': f'#{highlight_color:02x}{highlight_color:02x}{highlight_color:02x}', 'stop-opacity': '0.4'})
    ET.SubElement(highlight, 'stop', {'offset': '0.5', 'stop-color': f'#{highlight_color:02x}{highlight_color:02x}{highlight_color:02x}', 'stop-opacity': '0.15'})
    ET.SubElement(highlight, 'stop', {'offset': '1', 'stop-color': f'#{base_dark:02x}{base_dark:02x}{base_dark:02x}', 'stop-opacity': '0'})
    
    # Soft, subtle drop shadow filter
    shadow_filter = ET.SubElement(defs, 'filter', {
        'id': 'shadow',
        'x': '-50%', 'y': '-50%', 'width': '200%', 'height': '200%'
    })
    blur = ET.SubElement(shadow_filter, 'feGaussianBlur', {
        'in': 'SourceAlpha',
        'stdDeviation': '4'
    })
    offset = ET.SubElement(shadow_filter, 'feOffset', {
        'dx': '0', 'dy': '5', 'result': 'offsetblur'
    })
    comp = ET.SubElement(shadow_filter, 'feComponentTransfer')
    ET.SubElement(comp, 'feFuncA', {'type': 'linear', 'slope': '0.08', 'intercept': '0'})
    merge = ET.SubElement(shadow_filter, 'feMerge')
    ET.SubElement(merge, 'feMergeNode')
    ET.SubElement(merge, 'feMergeNode', {'in': 'SourceGraphic'})
    
    # Additional soft shadow ellipse for grounding
    shadow_gradient = ET.SubElement(defs, 'radialGradient', {
        'id': 'shadow-gradient',
        'cx': '80', 'cy': '125', 'r': '50',
        'gradientUnits': 'userSpaceOnUse'
    })
    ET.SubElement(shadow_gradient, 'stop', {'offset': '0', 'stop-color': '#000000', 'stop-opacity': '0.12'})
    ET.SubElement(shadow_gradient, 'stop', {'offset': '0.5', 'stop-color': '#000000', 'stop-opacity': '0.06'})
    ET.SubElement(shadow_gradient, 'stop', {'offset': '1', 'stop-color': '#000000', 'stop-opacity': '0'})
    
    # Add soft shadow ellipse first (behind the strip)
    shadow_ellipse = ET.SubElement(svg, 'ellipse', {
        'cx': '80',
        'cy': '125',
        'rx': '45',
        'ry': '12',
        'fill': 'url(#shadow-gradient)'
    })
    
    g = ET.SubElement(svg, 'g', {'filter': 'url(#shadow)'})
    
    # Create surface patches with proper shading
    patches = []
    for i in range(len(v) - 1):
        for j in range(len(u) - 1):
            # Get four corners of quad
            p1 = (x_svg[i, j], y_svg[i, j], Z_rot[i, j])
            p2 = (x_svg[i, j+1], y_svg[i, j+1], Z_rot[i, j+1])
            p3 = (x_svg[i+1, j+1], y_svg[i+1, j+1], Z_rot[i+1, j+1])
            p4 = (x_svg[i+1, j], y_svg[i+1, j], Z_rot[i+1, j])
            
            # Calculate average normal
            u_avg = (u[j] + u[j+1]) / 2
            v_avg = (v[i] + v[i+1]) / 2
            x_avg, y_avg, z_avg = mobius_strip(u_avg, v_avg)
            
            # Approximate normal
            normal = calculate_normal(x_avg, y_avg, z_avg, u_avg, v_avg)
            
            # Rotate normal to match the rotated geometry
            normal_rot = rotate_point(normal[0], normal[1], normal[2], rot_x, rot_y, rot_z)
            normal_rot = np.array(normal_rot)
            normal_rot = normal_rot / np.linalg.norm(normal_rot)
            
            # Calculate lighting intensity (subtle, matte finish like reference)
            dot = np.clip(np.dot(normal_rot, light_dir), 0, 1)
            # Very subtle ambient + gentle diffuse for professional matte look
            # Matches reference images - smooth, gradual shading
            intensity = 0.2 + 0.3 * dot  # Subtle ambient + gentle diffuse
            
            # Average depth for sorting
            z_avg_depth = np.mean([p1[2], p2[2], p3[2], p4[2]])
            
            patches.append({
                'points': [p1, p2, p3, p4],
                'intensity': intensity,
                'depth': z_avg_depth,
                'v_pos': v_avg
            })
    
    # Sort by depth (back to front)
    patches.sort(key=lambda p: p['depth'])
    
    # Draw patches
    for patch in patches:
        points = patch['points']
        intensity = patch['intensity']
        v_pos = patch['v_pos']
        
        # Choose gradient based on intensity (map 0.2-0.5 range to 0-4 indices)
        # Higher intensity = brighter = lower gradient index
        intensity_normalized = (intensity - 0.2) / (0.5 - 0.2)  # Normalize to 0-1
        grad_idx = min(4, max(0, int((1 - intensity_normalized) * 5)))
        
        # Create path
        path_data = f"M {points[0][0]:.2f} {points[0][1]:.2f} "
        path_data += f"L {points[1][0]:.2f} {points[1][1]:.2f} "
        path_data += f"L {points[2][0]:.2f} {points[2][1]:.2f} "
        path_data += f"L {points[3][0]:.2f} {points[3][1]:.2f} Z"
        
        # Adjust opacity based on v position (underside darker)
        opacity = 0.9 if v_pos < 0 else 1.0
        
        path = ET.SubElement(g, 'path', {
            'd': path_data,
            'fill': f'url(#grad-{grad_idx})',
            'stroke': 'none',
            'opacity': str(opacity)
        })
    
    # Add subtle highlight on brightest areas (adjusted for subtle matte material)
    highlight_patches = [p for p in patches if p['intensity'] > 0.42 and p['v_pos'] >= 0]
    # Sort by intensity and take top patches
    highlight_patches.sort(key=lambda p: p['intensity'], reverse=True)
    for patch in highlight_patches[:25]:  # More patches for smoother highlight
        points = patch['points']
        path_data = f"M {points[0][0]:.2f} {points[0][1]:.2f} "
        path_data += f"L {points[1][0]:.2f} {points[1][1]:.2f} "
        path_data += f"L {points[2][0]:.2f} {points[2][1]:.2f} "
        path_data += f"L {points[3][0]:.2f} {points[3][1]:.2f} Z"
        
        # Very subtle highlight for matte finish
        highlight_path = ET.SubElement(g, 'path', {
            'd': path_data,
            'fill': 'url(#highlight)',
            'opacity': '0.25'
        })
    
    # Convert to string
    rough_string = ET.tostring(svg, encoding='unicode')
    reparsed = minidom.parseString(rough_string)
    pretty = reparsed.toprettyxml(indent='  ')
    
    # Remove XML declaration
    lines = pretty.split('\n')
    if lines[0].startswith('<?xml'):
        lines = lines[1:]
    
    return '\n'.join(lines)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Generate a 3D Möbius strip SVG icon')
    parser.add_argument('--rot-x', type=float, default=25, help='Rotation around X axis in degrees (default: 25)')
    parser.add_argument('--rot-y', type=float, default=50, help='Rotation around Y axis in degrees (default: 50)')
    parser.add_argument('--rot-z', type=float, default=5, help='Rotation around Z axis in degrees (default: 5)')
    parser.add_argument('--distance', type=float, default=4.5, help='Camera distance for scaling (default: 4.5)')
    parser.add_argument('--theme', type=str, default='dark', choices=['dark', 'light'],
                       help='Color theme: dark (default) or light')
    parser.add_argument('--output', type=str, default='../assets/icons/ultrathink-mobius.svg', 
                       help='Output file path (default: ../assets/icons/ultrathink-mobius.svg)')
    
    args = parser.parse_args()
    
    print(f"Generating Möbius strip with angles: X={args.rot_x}°, Y={args.rot_y}°, Z={args.rot_z}°, distance={args.distance}, theme={args.theme}")
    
    svg_content = generate_mobius_svg(
        rot_x=args.rot_x,
        rot_y=args.rot_y,
        rot_z=args.rot_z,
        distance=args.distance,
        theme=args.theme
    )
    
    # Write to file
    with open(args.output, 'w') as f:
        f.write(svg_content)
    
    print(f"Generated professional SVG: {args.output}")

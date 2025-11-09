#!/bin/bash
# Helper script to generate Möbius strip logo with different themes

cd "$(dirname "$0")"

echo "Generating Ultrathink logo..."
echo ""
echo "Usage examples:"
echo "  ./generate_logo.sh dark    - Generate dark theme logo (default)"
echo "  ./generate_logo.sh light   - Generate light theme logo"
echo "  ./generate_logo.sh both    - Generate both versions"
echo ""

THEME=${1:-dark}

if [ "$THEME" = "both" ]; then
    echo "Generating dark theme logo..."
    python3 generate_mobius.py --rot-x 20 --rot-y 45 --rot-z 0 --distance 4.8 --theme dark --output ../assets/icons/ultrathink-mobius-dark.svg
    
    echo "Generating light theme logo..."
    python3 generate_mobius.py --rot-x 20 --rot-y 45 --rot-z 0 --distance 4.8 --theme light --output ../assets/icons/ultrathink-mobius-light.svg
    
    echo "Done! Generated both versions."
elif [ "$THEME" = "light" ]; then
    python3 generate_mobius.py --rot-x 20 --rot-y 45 --rot-z 0 --distance 4.8 --theme light
    echo "Generated light theme logo."
else
    python3 generate_mobius.py --rot-x 20 --rot-y 45 --rot-z 0 --distance 4.8 --theme dark
    echo "Generated dark theme logo (default)."
fi


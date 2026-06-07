#!/bin/sh

set -euo pipefail

echo "Running site validation..."
npm test

echo "Building Jekyll site..."
bundle exec jekyll build

echo "Validation complete."

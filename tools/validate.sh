#!/bin/sh

set -euo pipefail

echo "Linting CSS..."
npm run lint:css

echo "Linting JS..."
npm run lint:js

echo "Linting HTML..."
npm run lint:html

echo "Validation complete ✔"

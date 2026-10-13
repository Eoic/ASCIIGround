#!/usr/bin/env bash
set -euo pipefail

echo "Setting up ASCIIGround with Node $(node --version)..."
npm ci
npm run check
echo 'Setup complete. Run npm run dev to open the demo.'

#!/usr/bin/env bash
# Build Chrome Web Store zip from extension/ only → releases/{name}_v{version}.zip
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
EXT_DIR="$ROOT/extension"
OUT_DIR="$ROOT/releases"
PKG_JSON="$ROOT/package.json"
MANIFEST="$EXT_DIR/manifest.json"

if [[ ! -f "$MANIFEST" ]]; then
  echo "error: missing $MANIFEST" >&2
  exit 1
fi

if [[ ! -f "$PKG_JSON" ]]; then
  echo "error: missing $PKG_JSON" >&2
  exit 1
fi

# Prefer package.json (same as Pornhub releases); require manifest version to match.
NAME="$(node -p "require('$PKG_JSON').name")"
VERSION="$(node -p "require('$PKG_JSON').version")"
MANIFEST_VERSION="$(node -p "require('$MANIFEST').version")"

if [[ "$VERSION" != "$MANIFEST_VERSION" ]]; then
  echo "error: package.json version ($VERSION) != extension/manifest.json version ($MANIFEST_VERSION)" >&2
  echo "Bump both to the same value before packing." >&2
  exit 1
fi

ZIP_NAME="${NAME}_v${VERSION}.zip"

mkdir -p "$OUT_DIR"
# Replace prior zip for this version if present
rm -f "$OUT_DIR/$ZIP_NAME"

cd "$EXT_DIR"
zip -r "$OUT_DIR/$ZIP_NAME" . \
  -x "*.DS_Store" \
  -x "*__MACOSX*" \
  -x "*.map"

echo "created: $OUT_DIR/$ZIP_NAME"
echo "Upload this zip to the Chrome Web Store Developer Dashboard (do not include analysis/docs)."

#!/usr/bin/env bash
# Zip dist/chrome or dist/firefox → releases/{name}_v{version}.zip (.firefox.zip)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="$ROOT/releases"
PKG_JSON="$ROOT/package.json"
FIREFOX=false

if [[ "${1:-}" == "--firefox" ]]; then
  FIREFOX=true
fi

if $FIREFOX; then
  DIST_DIR="$ROOT/dist/firefox"
else
  DIST_DIR="$ROOT/dist/chrome"
fi

if [[ ! -f "$DIST_DIR/manifest.json" ]]; then
  echo "error: missing $DIST_DIR/manifest.json — run pnpm build or pnpm build:firefox first" >&2
  exit 1
fi

if [[ ! -f "$PKG_JSON" ]]; then
  echo "error: missing $PKG_JSON" >&2
  exit 1
fi

if [[ ! -f "$DIST_DIR/unlock.js" ]]; then
  echo "error: missing $DIST_DIR/unlock.js — IIFE build did not run" >&2
  exit 1
fi

NAME="$(node -p "require('$PKG_JSON').name")"
VERSION="$(node -p "require('$PKG_JSON').version")"
MANIFEST_VERSION="$(node -p "require('$DIST_DIR/manifest.json').version")"

if [[ "$VERSION" != "$MANIFEST_VERSION" ]]; then
  echo "error: package.json version $VERSION != $DIST_DIR/manifest.json version $MANIFEST_VERSION" >&2
  exit 1
fi

if $FIREFOX; then
  ZIP_NAME="${NAME}_v${VERSION}.firefox.zip"
else
  ZIP_NAME="${NAME}_v${VERSION}.zip"
fi

mkdir -p "$OUT_DIR"
rm -f "$OUT_DIR/$ZIP_NAME"

(
  cd "$DIST_DIR"
  zip -r "$OUT_DIR/$ZIP_NAME" . \
    -x "*.DS_Store" \
    -x "*__MACOSX*" \
    -x "*.map"
)

echo "created: $OUT_DIR/$ZIP_NAME"
if $FIREFOX; then
  echo "Upload this zip to addons.mozilla.org (Firefox 128+, Gecko id in manifest)."
else
  echo "Upload this zip to the Chrome Web Store Developer Dashboard (do not include analysis/docs)."
fi

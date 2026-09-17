#!/usr/bin/env bash
# Zip repo source for AMO review (no node_modules / dist / releases).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="$ROOT/releases"
PKG_JSON="$ROOT/package.json"

if [[ ! -f "$PKG_JSON" ]]; then
  echo "error: missing $PKG_JSON" >&2
  exit 1
fi

NAME="$(node -p "require('$PKG_JSON').name")"
VERSION="$(node -p "require('$PKG_JSON').version")"
ZIP_NAME="${NAME}_v${VERSION}.firefox-sources.zip"
ZIP_PATH="$OUT_DIR/$ZIP_NAME"

if [[ ! -f "$ROOT/SOURCE.md" ]]; then
  echo "error: missing $ROOT/SOURCE.md (AMO rebuild instructions)" >&2
  exit 1
fi

STAGE="$(mktemp -d)"
cleanup() {
  rm -rf "$STAGE"
}
trap cleanup EXIT

DEST="$STAGE/$NAME"
mkdir -p "$DEST"

# Working tree minus install/build output. analysis/ is third-party samples, not the add-on.
rsync -a \
  --exclude '.git/' \
  --exclude '.DS_Store' \
  --exclude '.idea/' \
  --exclude '.cursor/' \
  --exclude 'node_modules/' \
  --exclude 'dist/' \
  --exclude 'releases/' \
  --exclude 'coverage/' \
  --exclude 'analysis/' \
  --exclude '*.pem' \
  --exclude 'utils/reload/*.js' \
  --exclude 'utils/reload/injections/*.js' \
  --exclude 'public/manifest.json' \
  "$ROOT/" "$DEST/"

if [[ -d "$DEST/node_modules" ]]; then
  echo "error: node_modules leaked into staging dir" >&2
  exit 1
fi

mkdir -p "$OUT_DIR"
rm -f "$ZIP_PATH"

(
  cd "$STAGE"
  zip -r "$ZIP_PATH" "$NAME" \
    -x "*.DS_Store" \
    -x "*__MACOSX*"
)

echo "created: $ZIP_PATH"
echo "Upload this zip as AMO source code (reviewers: pnpm install && pnpm build:firefox)."

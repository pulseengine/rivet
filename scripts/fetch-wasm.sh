#!/usr/bin/env bash
set -euo pipefail

# Fetch pre-built WASM components from GitHub releases.
# Usage: ./scripts/fetch-wasm.sh [version]

VERSION="${1:-latest}"
REPO="pulseengine/spar"
ASSET="spar_wasm.wasm"
OUT_DIR="rivet-cli/assets/wasm"

mkdir -p "$OUT_DIR"

if [ "$VERSION" = "latest" ]; then
    echo "Fetching latest release from $REPO..."
    URL=$(gh release view --repo "$REPO" --json assets -q ".assets[] | select(.name==\"$ASSET\") | .url" 2>/dev/null || true)
    if [ -z "$URL" ]; then
        echo "No release found with asset $ASSET. Build from source instead:"
        echo "  cd /path/to/spar && cargo build --target wasm32-wasip2 -p spar-wasm --release"
        echo "  cp target/wasm32-wasip2/release/spar_wasm.wasm $OUT_DIR/"
        exit 1
    fi
else
    echo "Fetching release $VERSION from $REPO..."
    URL=$(gh release view "$VERSION" --repo "$REPO" --json assets -q ".assets[] | select(.name==\"$ASSET\") | .url" 2>/dev/null || true)
    if [ -z "$URL" ]; then
        echo "Release $VERSION not found or does not contain $ASSET"
        exit 1
    fi
fi

echo "Downloading $ASSET..."
gh release download ${VERSION:+$VERSION} --repo "$REPO" --pattern "$ASSET" --dir "$OUT_DIR" --clobber
echo "Saved to $OUT_DIR/$ASSET"

# Check size
ls -lh "$OUT_DIR/$ASSET"

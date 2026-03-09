#!/usr/bin/env bash
set -euo pipefail

# Build spar-wasm component and transpile for browser use.
# Usage: ./scripts/build-wasm.sh [spar-repo-path]

SPAR_DIR="${1:-../spar}"
OUT_DIR="rivet-cli/assets/wasm"

if [ ! -d "$SPAR_DIR/crates/spar-wasm" ]; then
    echo "Error: spar repo not found at $SPAR_DIR"
    echo "Usage: $0 /path/to/spar"
    exit 1
fi

echo "Building spar-wasm (wasm32-wasip2, release)..."
(cd "$SPAR_DIR" && cargo build --target wasm32-wasip2 -p spar-wasm --release)

mkdir -p "$OUT_DIR"
cp "$SPAR_DIR/target/wasm32-wasip2/release/spar_wasm.wasm" "$OUT_DIR/"
echo "Copied WASM component to $OUT_DIR/spar_wasm.wasm"
ls -lh "$OUT_DIR/spar_wasm.wasm"

echo ""
echo "Transpiling for browser with jco (--instantiation async)..."
npx @bytecodealliance/jco transpile --instantiation async "$OUT_DIR/spar_wasm.wasm" -o "$OUT_DIR/js/" 2>&1
echo "Browser JS module written to $OUT_DIR/js/"
ls -lh "$OUT_DIR/js/spar_wasm.js" "$OUT_DIR/js/spar_wasm.core.wasm" 2>/dev/null || true

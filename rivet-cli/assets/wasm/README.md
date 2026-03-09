# WASM Components

This directory holds pre-built WASM components for rivet adapters.

## spar-wasm

The `spar_wasm.wasm` component provides AADL parsing, analysis, and SVG rendering.

### Building from source

```bash
cd /path/to/spar
cargo build --target wasm32-wasip2 -p spar-wasm --release
cp target/wasm32-wasip2/release/spar_wasm.wasm /path/to/sdlc/rivet-cli/assets/wasm/
```

### Downloading from GitHub releases

```bash
./scripts/fetch-wasm.sh
```

### jco transpilation (for browser use)

```bash
npx @bytecodealliance/jco transpile rivet-cli/assets/wasm/spar_wasm.wasm \
  -o rivet-cli/assets/wasm/js/
```

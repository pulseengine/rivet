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

The dashboard uses `--instantiation async` mode so the browser JS can provide
a virtual WASI filesystem with pre-fetched `.aadl` files:

```bash
npx @bytecodealliance/jco transpile --instantiation async \
  rivet-cli/assets/wasm/spar_wasm.wasm -o rivet-cli/assets/wasm/js/
```

Or use the build script which handles both compilation and transpilation:

```bash
./scripts/build-wasm.sh /path/to/spar
```

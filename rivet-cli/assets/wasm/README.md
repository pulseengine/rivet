# WASM Components

This directory holds the pre-built `spar-wasm` component used to render AADL
diagrams in the `rivet serve` dashboard. The component is **not committed** to
git (`.gitignore` excludes `*.wasm` and `js/`); `rivet-cli/build.rs` falls back
to writing empty **stub** assets when none are present, so the build always
succeeds but AADL diagrams render a "not available" fallback.

> **Status (see pulseengine/rivet#468, pulseengine/spar#259):** spar does **not
> yet publish** a WASM release asset, so there is currently no turnkey way to
> obtain the real component — the options below require a local spar checkout
> and toolchain. Once spar publishes a browser bundle, `fetch-wasm.sh` will pull
> it and no local build will be needed.

## spar-wasm

The `spar_wasm.wasm` component provides AADL parsing, analysis, and SVG
rendering. The browser loads the jco-transpiled bundle (`js/spar_wasm.js` +
`js/spar_wasm.core*.wasm`), which `serve` embeds via `include_bytes!`.

### Building from source (requires a local spar checkout + toolchain)

Needs the `spar` repo checked out, the `wasm32-wasip2` Rust target, and Node
(`npx @bytecodealliance/jco`):

```bash
rustup target add wasm32-wasip2
./scripts/build-wasm.sh /path/to/spar     # compiles + jco-transpiles into js/
```

Or the two steps manually:

```bash
cd /path/to/spar
cargo build --target wasm32-wasip2 -p spar-wasm --release
cp target/wasm32-wasip2/release/spar_wasm.wasm /path/to/rivet/rivet-cli/assets/wasm/
npx @bytecodealliance/jco transpile --instantiation async \
  rivet-cli/assets/wasm/spar_wasm.wasm -o rivet-cli/assets/wasm/js/
```

### Downloading from GitHub releases

`./scripts/fetch-wasm.sh` is intended to download a prebuilt component from the
`pulseengine/spar` releases — **but spar does not publish a WASM asset yet**
(pulseengine/spar#259), so this currently fails. It will work once that asset is
published; the script will then be updated to fetch the browser bundle.

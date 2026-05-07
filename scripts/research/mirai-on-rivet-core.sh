#!/usr/bin/env bash
# Run MIRAI (abstract interpretation for Rust MIR) against rivet-core.
#
# This is the Phase-5 / DO-333 abstract-interpretation prototype runner
# tracked in pulseengine/rivet#191. It pins MIRAI to a specific tag,
# resolves the upstream-archive / Endor-Labs-fork situation (see
# docs/research/mirai-prototype-report.md §"Repo state"), and emits
# first-pass diagnostics into `results/mirai/`.
#
# Usage:
#   scripts/research/mirai-on-rivet-core.sh [--install-only] [--target store|proofs|all]
#
# The script is idempotent: it only re-installs MIRAI when the binary is
# missing or its version does not match the pin below. Output of each
# analysis run is captured to `results/mirai/<target>.txt` so the report
# can be regenerated from committed artefacts.
#
# Hard requirements:
#   - rustup (any version; the script installs the pinned nightly itself)
#   - network access at first run (to clone MIRAI and fetch the toolchain)
#   - ~30 GB free disk for the nightly + MIRAI's `target/` directory
#
# Honest disclaimer: this is research / evaluation only. MIRAI is an
# abstract interpreter, not a verified compiler; its findings are
# inputs to human review, not a CI gate (yet — see #191 acceptance).

set -euo pipefail

# ── Pins (single source of truth) ────────────────────────────────────────
MIRAI_REPO="https://github.com/endorlabs/MIRAI.git"
MIRAI_TAG="v1.1.12"
MIRAI_TOOLCHAIN="nightly-2025-01-10"

# ── Layout ───────────────────────────────────────────────────────────────
RIVET_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SCRATCH_DIR="${MIRAI_SCRATCH:-/tmp/mirai-spike}"
MIRAI_SRC="$SCRATCH_DIR/mirai-src"
RESULTS_DIR="$RIVET_ROOT/results/mirai"

INSTALL_ONLY=0
TARGET="all"
while [[ $# -gt 0 ]]; do
    case "$1" in
        --install-only) INSTALL_ONLY=1; shift ;;
        --target) TARGET="$2"; shift 2 ;;
        --target=*) TARGET="${1#--target=}"; shift ;;
        -h|--help)
            grep '^#' "$0" | sed 's/^# \{0,1\}//' | sed -n '1,/^Honest disclaimer/p'
            exit 0
            ;;
        *) echo "unknown arg: $1" >&2; exit 2 ;;
    esac
done

mkdir -p "$SCRATCH_DIR" "$RESULTS_DIR"

# ── Step 1 — pin the nightly toolchain ───────────────────────────────────
if ! rustup toolchain list | grep -q "^${MIRAI_TOOLCHAIN}"; then
    echo "[mirai] installing $MIRAI_TOOLCHAIN with rustc-dev components" >&2
    rustup toolchain install "$MIRAI_TOOLCHAIN" \
        --component rustc-dev --component rust-src \
        --component llvm-tools-preview --component clippy --component rustfmt \
        --profile minimal
fi

# ── Step 2 — clone MIRAI (Endor Labs fork; original Facebook repo archived) ─
if [[ ! -d "$MIRAI_SRC/.git" ]]; then
    echo "[mirai] cloning $MIRAI_REPO @ $MIRAI_TAG" >&2
    git clone --depth 1 --branch "$MIRAI_TAG" "$MIRAI_REPO" "$MIRAI_SRC"
fi

# ── Step 3 — build / install the checker ────────────────────────────────
NEED_INSTALL=0
if ! command -v mirai >/dev/null 2>&1; then
    NEED_INSTALL=1
elif ! mirai --version 2>/dev/null | grep -q "$MIRAI_TAG"; then
    # Version drift: re-install to the pinned tag.
    NEED_INSTALL=1
fi

if (( NEED_INSTALL == 1 )); then
    echo "[mirai] cargo install --locked --path ./checker (this takes 5-15 min)" >&2
    (cd "$MIRAI_SRC" && cargo install --locked --path ./checker)
fi

if (( INSTALL_ONLY == 1 )); then
    echo "[mirai] install-only run complete" >&2
    exit 0
fi

# ── Step 4 — run MIRAI on selected rivet-core targets ───────────────────
run_target() {
    local name="$1"
    local out="$RESULTS_DIR/$name.txt"
    echo "[mirai] analysing rivet-core::$name" >&2

    # Use cargo-mirai (installed alongside mirai) so MIRAI sees the full
    # build graph. The wrapper handles the toolchain selection internally.
    (
        cd "$RIVET_ROOT/rivet-core"
        # MIRAI calls rustc with its own driver; force the pinned nightly.
        RUSTUP_TOOLCHAIN="$MIRAI_TOOLCHAIN" \
        cargo mirai --no-default-features --lib 2>&1 \
          | tee "$out"
    ) || true

    echo "[mirai] $name diagnostics → $out" >&2
}

case "$TARGET" in
    store)  run_target store ;;
    proofs) run_target proofs ;;
    all)    run_target all ;;
    *) echo "unknown --target: $TARGET" >&2; exit 2 ;;
esac

echo "[mirai] done. See docs/research/mirai-prototype-report.md for analysis." >&2

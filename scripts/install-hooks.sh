#!/usr/bin/env bash
# Install git hooks for rivet project.
#
# Hooks installed:
#   commit-msg  — validates commit trailers reference artifact IDs
#   pre-commit  — runs rivet validate, blocks on errors
#
# Usage:
#   ./scripts/install-hooks.sh

set -euo pipefail

HOOKS_DIR="$(git rev-parse --git-dir)/hooks"
RIVET_BIN="${RIVET_BIN:-rivet}"

echo "Installing git hooks to $HOOKS_DIR..."

# ── commit-msg hook ──────────────────────────────────────────────────
cat > "$HOOKS_DIR/commit-msg" << 'HOOK'
#!/usr/bin/env bash
# Validate commit message trailers reference valid artifact IDs.
# Installed by scripts/install-hooks.sh
RIVET_BIN="${RIVET_BIN:-rivet}"
if command -v "$RIVET_BIN" &>/dev/null; then
    "$RIVET_BIN" commit-msg-check "$1"
fi
HOOK
chmod +x "$HOOKS_DIR/commit-msg"
echo "  commit-msg hook installed"

# ── pre-commit hook ──────────────────────────────────────────────────
cat > "$HOOKS_DIR/pre-commit" << 'HOOK'
#!/usr/bin/env bash
# Pre-commit: cargo fmt check (staged Rust) + rivet validate. Blocks on errors.
# Installed by scripts/install-hooks.sh

# Formatting is the single most common first-push CI failure and is cheap
# (~1s), so guard it here when the commit touches Rust. Clippy/test are too
# slow for every commit — they stay in CI (and an optional pre-push hook).
# This hook is convenience only; CI is the real gate (see REQ-051).
if command -v cargo &>/dev/null \
    && git diff --cached --name-only --diff-filter=ACM | grep -q '\.rs$'; then
    if ! cargo fmt --all -- --check; then
        echo "cargo fmt: formatting issues. Run 'cargo fmt --all', then re-stage."
        exit 1
    fi
fi

RIVET_BIN="${RIVET_BIN:-rivet}"
if command -v "$RIVET_BIN" &>/dev/null; then
    output=$("$RIVET_BIN" validate --format json 2>/dev/null)
    errors=$(echo "$output" | python3 -c "import json,sys; print(json.load(sys.stdin).get('errors',0))" 2>/dev/null || echo "0")
    if [ "$errors" -gt 0 ]; then
        echo "rivet validate: $errors error(s) found. Fix before committing."
        echo "Run 'rivet validate' for details."
        exit 1
    fi
fi
HOOK
chmod +x "$HOOKS_DIR/pre-commit"
echo "  pre-commit hook installed (cargo fmt check + rivet validate)"

echo "Done. Hooks will use '$RIVET_BIN' binary."

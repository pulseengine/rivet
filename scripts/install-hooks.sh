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
# Run rivet validate before commit. Blocks on errors.
# Installed by scripts/install-hooks.sh
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
echo "  pre-commit hook installed"

echo "Done. Hooks will use '$RIVET_BIN' binary."

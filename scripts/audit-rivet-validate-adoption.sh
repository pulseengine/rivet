#!/usr/bin/env bash
# Audit rivet-validate hook adoption across a workspace of repository clones.
#
# Surveys every directory under WORKSPACE that contains a rivet.yaml and
# checks whether its .pre-commit-config.yaml registers the rivet-validate
# hook. Emits a markdown gap report to stdout suitable for pasting into
# docs/adoption-status.md or an issue body.
#
# Tracking: pulseengine/rivet#187 (V&V coverage initiative — Phase 4).
#
# Usage:
#   scripts/audit-rivet-validate-adoption.sh [WORKSPACE]
#
# WORKSPACE defaults to the parent of the rivet checkout. Set RIVET_AUDIT_QUIET=1
# to suppress per-repo progress output on stderr.

set -euo pipefail

WORKSPACE="${1:-$(cd "$(dirname "$0")/../.." && pwd)}"
QUIET="${RIVET_AUDIT_QUIET:-0}"

if [[ ! -d "$WORKSPACE" ]]; then
    echo "error: workspace '$WORKSPACE' is not a directory" >&2
    exit 2
fi

log() { [[ "$QUIET" -eq 1 ]] || echo "$@" >&2; }

declare -a HOOKED_REPOS=()
declare -a GAP_REPOS=()
declare -a NO_HOOK_CONFIG_REPOS=()

while IFS= read -r -d '' rivet_yaml; do
    repo_dir="$(dirname "$rivet_yaml")"
    repo_name="$(basename "$repo_dir")"
    log "scanning $repo_name"

    config="$repo_dir/.pre-commit-config.yaml"
    if [[ ! -f "$config" ]]; then
        NO_HOOK_CONFIG_REPOS+=("$repo_name")
        continue
    fi

    # Match either a `- id: rivet-validate` line or a `name: rivet validate ...`
    # line; either form indicates the hook is wired up.
    if grep -Eq '^[[:space:]]*-[[:space:]]+id:[[:space:]]*rivet-validate[[:space:]]*$' "$config" \
       || grep -Eq '^[[:space:]]*name:[[:space:]]+rivet validate' "$config"; then
        HOOKED_REPOS+=("$repo_name")
    else
        GAP_REPOS+=("$repo_name")
    fi
done < <(find "$WORKSPACE" -mindepth 2 -maxdepth 3 -name rivet.yaml -not -path '*/.git/*' -print0)

total=$(( ${#HOOKED_REPOS[@]} + ${#GAP_REPOS[@]} + ${#NO_HOOK_CONFIG_REPOS[@]} ))

cat <<EOF
# rivet-validate hook adoption audit

Workspace: \`$WORKSPACE\`
Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)

| Status | Count |
|---|---|
| Hook installed | ${#HOOKED_REPOS[@]} |
| Hook missing (gap) | ${#GAP_REPOS[@]} |
| No \`.pre-commit-config.yaml\` | ${#NO_HOOK_CONFIG_REPOS[@]} |
| **Total \`rivet.yaml\` repos** | $total |

EOF

if (( ${#HOOKED_REPOS[@]} > 0 )); then
    echo "## Adopted"
    echo
    for r in "${HOOKED_REPOS[@]}"; do echo "- $r"; done
    echo
fi

if (( ${#GAP_REPOS[@]} > 0 )); then
    echo "## Gap (has \`.pre-commit-config.yaml\` but no \`rivet-validate\` hook)"
    echo
    for r in "${GAP_REPOS[@]}"; do echo "- $r"; done
    echo
fi

if (( ${#NO_HOOK_CONFIG_REPOS[@]} > 0 )); then
    echo "## No pre-commit framework"
    echo
    for r in "${NO_HOOK_CONFIG_REPOS[@]}"; do echo "- $r"; done
    echo
fi

# Exit 1 if any gap is present so this script can be wired into CI as a gate.
if (( ${#GAP_REPOS[@]} > 0 )); then
    exit 1
fi

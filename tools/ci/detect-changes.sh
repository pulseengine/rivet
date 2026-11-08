#!/usr/bin/env bash
# Changed-area detector for ci.yml's `changes` job and benchmarks.yml (REQ-412).
#
# Extracted from the inline step in ci.yml (REQ-291 / #771) so the logic is
# exercised by tools/ci/detect-changes_test.sh instead of only by the PRs that
# happen to hit each branch, and so benchmarks.yml shares it instead of
# carrying a second copy that drifts.
#
# Inputs (environment):
#   EVENT_NAME  github.event_name
#   BASE_SHA    the commit to diff against: pull_request.base.sha on a pull
#               request, merge_group.base_sha in a merge-queue run
#   REALPATH    optional, defaults to `realpath` (GNU coreutils: -m and
#               --relative-to); the macOS test run passes `grealpath`
#   GITHUB_OUTPUT  where `key=value` lines go; stdout when unset
#
# Outputs, each "true" or "false":
#   rust    compile-heavy Rust jobs (fmt, clippy, msrv, deny, mutation, ...)
#   tests   Test and cargo-vet: code changes, plus data the tests read
#   wasm    the wasm-seam build gate (REQ-268)
#   proofs  Verus and Rocq (Bazel builds over rivet-core/src, verus/, proofs/)
#   e2e     Playwright, which serves this repository's own artifacts
#   vscode  the VS Code extension job (vscode-rivet/, and the rivet binary it drives)
#
# Fail CLOSED (REQ-291): a non-PR, non-queue event, an empty base, a failed
# diff or an empty diff all set every output to true. On GitHub a skipped job
# reads as a pass, so doubt must run the jobs, never skip them.
set -uo pipefail

REALPATH="${REALPATH:-realpath}"
out="${GITHUB_OUTPUT:-/dev/stdout}"

emit() { echo "$1=$2" >> "$out"; }
all_true() {
  emit rust true; emit tests true; emit wasm true; emit proofs true; emit e2e true; emit vscode true
  echo "→ $1; running every job"
  exit 0
}

case "${EVENT_NAME:-}" in
  pull_request|merge_group) ;;
  *) all_true "non-PR, non-queue event (${EVENT_NAME:-unset})" ;;
esac

base="${BASE_SHA:-}"
[ -n "$base" ] || all_true "no base sha for ${EVENT_NAME}; failing closed"

if ! changed="$(git diff --name-only "$base"...HEAD)"; then
  all_true "git diff failed against base=$base; failing closed"
fi
[ -n "$changed" ] || all_true "git diff returned no paths; failing closed"

echo "event: ${EVENT_NAME}, base: $base"
echo "changed files:"; echo "$changed"

# Anything a Rust file embeds via include_str!/include_bytes!/include_dir! is
# compiled INTO the binary, so a change to it must run the compile matrix even
# when the diff has no .rs / Cargo / workflow file. Derive the set from the
# source rather than retyping it: extract each include_*!("<path>") argument,
# resolve it against the containing file, dedupe to repo-root-relative paths.
embedded=$(
  grep -rEHn --include='*.rs' 'include_(str|bytes|dir)!\("[^"]+"\)' \
    rivet-core rivet-cli etch 2>/dev/null \
    | while IFS= read -r match; do
        file="${match%%:*}"
        arg=$(printf '%s' "${match#*:}" \
          | sed -nE 's/.*include_(str|bytes|dir)!\("([^"]+)"\).*/\2/p')
        [ -z "$arg" ] && continue
        resolved=$("$REALPATH" -m --relative-to=. "$(dirname "$file")/$arg" 2>/dev/null) || continue
        echo "$resolved"
      done | sort -u
)
echo "derived embedded assets:"; printf '  %s\n' $embedded

# Classify every changed path. The lists below name what is NOT code; any
# path on neither list is code. A filter that lists code fails OPEN: a new
# kind of input (supply-chain/ before #1204, a data file a test reads) is
# silently ungated, because CI Gate passes a skipped job. Listing the
# exceptions instead fails CLOSED: an unknown path runs the full matrix.
#
#   code    the compile-heavy matrix (rust=true, tests=true)
#   data    files rivet's own tests and cargo-vet read but nothing compiles:
#           cli_commands alone runs ~70 tests against artifacts/, safety/,
#           docs/ and schemas/ of this repository (tests=true, rust=false)
#   other   read by no Rust build or test; each has its own job or none
#
# Checked in this order: a Rust/Cargo file is code wherever it sits (a .rs
# under docs/ is code), then workflows, actions and this detector, then
# embedded assets (compiled INTO the binary), then the two lists.
code_re='(\.rs$)|((^|/)Cargo\.(toml|lock)$)|(^\.github/workflows/)|(^\.github/actions/)|(^tools/ci/detect-changes)'
data_re='^(artifacts|safety|docs|schemas|arch|examples|results|templates|supply-chain|\.rivet)/|^rivet\.yaml$|^[^/]+\.md$'
other_re='^(vscode-rivet|tests/playwright|npm|platform-packages|proofs|verus|\.claude)/|((^|/)BUILD(\.bazel)?$)|((^|/)MODULE\.bazel(\.lock)?$)|(\.bzl$)|^\.bazelrc$|^\.bazelversion$|^LICENSE[^/]*$|^\.gitignore$|^\.gitattributes$'

rust=false
tests=false
while IFS= read -r path; do
  [ -n "$path" ] || continue
  if echo "$path" | grep -qE "$code_re" \
     || { [ -n "$embedded" ] && printf '%s\n' "$embedded" | grep -Fxq -- "$path"; }; then
    kind=code
  elif echo "$path" | grep -qE "$data_re"; then
    kind=data
  elif echo "$path" | grep -qE "$other_re"; then
    kind=other
  else
    kind=code   # unknown: fail closed
  fi
  echo "  $kind  $path"
  case "$kind" in
    code) rust=true; tests=true ;;
    data) tests=true ;;
  esac
done <<< "$changed"

if [ "$rust" = true ]; then
  echo "→ code changes present (or unclassified paths); running the compile matrix"
elif [ "$tests" = true ]; then
  echo "→ data changes only; running Test and cargo-vet, skipping the rest of the matrix"
else
  echo "→ no code or data changes; skipping compile-heavy jobs"
fi
emit rust "$rust"
emit tests "$tests"

# REQ-268: the wasm seam (compose-witness component + WIT, the host `wasm`
# feature / wasm_runtime, the composition core it wraps, the spar-wasm build
# assets) is consumed downstream, so a change that rots it is a downstream
# break. Workflows and composite actions included on the same fail-closed
# reasoning as the rust filter.
if echo "$changed" | grep -qE '(^compose-witness/)|(wasm_runtime\.rs$)|(^Cargo\.lock$)|(feature_model\.rs$)|(\.wit$)|(scripts/build-wasm\.sh$)|(serve/js\.rs$)|(assets/wasm/)|(^\.github/workflows/)|(^\.github/actions/)|(^tools/ci/detect-changes)'; then
  emit wasm true
  echo "→ wasm-seam paths changed; running the wasm-seam build gate"
else
  emit wasm false
  echo "→ no wasm-seam changes; skipping the wasm-seam gate"
fi

# Verus and Rocq run through Bazel: Verus over rivet-core/src (a rust change)
# plus verus/, Rocq over proofs/. Any Bazel input can break either build.
proofs_re='(^proofs/)|(^verus/)|((^|/)BUILD(\.bazel)?$)|((^|/)MODULE\.bazel(\.lock)?$)|(\.bzl$)|(^\.bazelrc$)|(^\.bazelversion$)'
if [ "$rust" = true ] || echo "$changed" | grep -qE "$proofs_re"; then
  emit proofs true
  echo "→ proof inputs changed; running Verus and Rocq"
else
  emit proofs false
  echo "→ no proof inputs changed; skipping Verus and Rocq"
fi

# Playwright runs `rivet serve` over this repository, and its specs address
# artifacts by id (REQ-001, ARCH-SYS-001, ...), so an artifact or project
# config change can break it. Documentation prose (docs/**) is not in this
# set: the document specs are generic, and push to main runs Playwright on
# every merge regardless.
e2e_re='(^tests/playwright/)|(^artifacts/)|(^safety/)|(^arch/)|(^rivet\.yaml$)'
if [ "$rust" = true ] || echo "$changed" | grep -qE "$e2e_re"; then
  emit e2e true
  echo "→ binary, spec or served-corpus changes; running Playwright"
else
  emit e2e false
  echo "→ no binary, spec or served-corpus changes; skipping Playwright"
fi

# The extension job builds rivet and drives its LSP, so a Rust change can break
# it as well as a change under vscode-rivet/. Before this output the job hung off
# `needs: test`, which the rust filter skips on a vscode-only PR, so a dependency
# bump of the extension never ran its tests anywhere (rivet#1175-#1183).
if [ "$rust" = true ] || echo "$changed" | grep -qE '^vscode-rivet/'; then
  emit vscode true
  echo "→ extension or binary changes; running the VS Code extension job"
else
  emit vscode false
  echo "→ no extension or binary changes; skipping the VS Code extension job"
fi

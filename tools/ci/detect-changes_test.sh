#!/usr/bin/env bash
# Oracle for tools/ci/detect-changes.sh (REQ-412, REQ-291).
# rivet: verifies REQ-412
#
# The defects guarded against: a detector that skips jobs it must run (fails
# open), and a merge-queue run that ignores its own base. A synthetic
# repository has a Rust file that embeds a schema, a proof file, an artifact,
# and docs. Each case diffs one change against a base and asserts all four
# outputs. Negative controls: a missing base, a bad base and an empty diff
# must run everything; a non-PR event must run everything; a merge_group run
# given an older base must see the Rust change that base..HEAD contains.
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
DETECT="$HERE/detect-changes.sh"

if [ -z "${REALPATH:-}" ]; then
  if realpath -m --relative-to=. . >/dev/null 2>&1; then REALPATH=realpath
  elif command -v grealpath >/dev/null 2>&1; then REALPATH=grealpath
  else echo "FAIL: needs GNU realpath (-m, --relative-to); on macOS install coreutils"; exit 1
  fi
fi
export REALPATH

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

fails=0
export GIT_AUTHOR_NAME=t GIT_AUTHOR_EMAIL=t@example.invalid
export GIT_COMMITTER_NAME=t GIT_COMMITTER_EMAIL=t@example.invalid
repo="$tmp/repo"
git init -q -b main "$repo"
g() { git -C "$repo" -c commit.gpgsign=false "$@"; }

mkdir -p "$repo/rivet-core/src" "$repo/schemas" "$repo/docs" "$repo/proofs/rocq" \
  "$repo/artifacts" "$repo/verus" "$repo/tools/ci"
echo 'pub const S: &str = include_str!("../../schemas/dev.yaml");' > "$repo/rivet-core/src/embedded.rs"
echo 'schema: dev' > "$repo/schemas/dev.yaml"
echo 'schema: unused' > "$repo/schemas/unused.yaml"
echo '# guide' > "$repo/docs/guide.md"
echo 'Theorem t : True. Proof. exact I. Qed.' > "$repo/proofs/rocq/Schema.v"
echo 'artifacts: []' > "$repo/artifacts/requirements.yaml"
echo '' > "$repo/verus/BUILD.bazel"
echo '# detector' > "$repo/tools/ci/detect-changes.sh"
g add -A && g commit -q -m root
root="$(g rev-parse HEAD)"

# run <event> <base> → prints "rust=.. tests=.. wasm=.. proofs=.. e2e=.. vscode=.."
run() {
  : > "$tmp/out"
  (cd "$repo" && EVENT_NAME="$1" BASE_SHA="$2" GITHUB_OUTPUT="$tmp/out" bash "$DETECT") > "$tmp/last.log" 2>&1
  for k in rust tests wasm proofs e2e vscode; do
    printf '%s=%s ' "$k" "$(sed -n "s/^$k=//p" "$tmp/out" | tail -1)"
  done
}
check() { # check <name> <expected> <actual>
  if [ "$2" = "$3" ]; then echo "  ok   $1"
  else
    echo "  FAIL $1"; echo "       expected: $2"; echo "       got:      $3"
    sed 's/^/       | /' "$tmp/last.log"
    fails=$((fails + 1))
  fi
}
# change <file> <content> → commits on a fresh branch off root, prints nothing
change() {
  g checkout -q -B "case-$RANDOM" "$root"
  mkdir -p "$(dirname "$repo/$1")"
  echo "$2" >> "$repo/$1"
  g add -A && g commit -q -m "change $1"
}
ALL="rust=true tests=true wasm=true proofs=true e2e=true vscode=true "
NONE="rust=false tests=false wasm=false proofs=false e2e=false vscode=false "
# data: what rivet's own tests read (artifacts/, docs/, schemas/, supply-chain/ ...)
DATA="rust=false tests=true wasm=false proofs=false e2e=false vscode=false "
# supply-chain/ is data, but wasm-relevant: it vets the dependency set the seam builds against
SUPPLY="rust=false tests=true wasm=true proofs=false e2e=false vscode=false "

echo "detect-changes.sh:"
change docs/guide.md more
check "docs-only pull request runs the tests only" "$DATA" "$(run pull_request "$root")"
check "docs-only merge_group run runs the tests only" "$DATA" "$(run merge_group "$root")"
check "push runs everything" "$ALL" "$(run push "$root")"
check "schedule runs everything" "$ALL" "$(run schedule "$root")"
check "pull request with no base fails closed" "$ALL" "$(run pull_request "")"
check "merge_group with no base fails closed" "$ALL" "$(run merge_group "")"
check "bad base fails closed" "$ALL" "$(run merge_group 0123456789abcdef0123456789abcdef01234567)"
check "empty diff fails closed" "$ALL" "$(run pull_request HEAD)"

change rivet-core/src/lib.rs 'pub fn f() {}'
check ".rs change runs rust, proofs, e2e" "rust=true tests=true wasm=true proofs=true e2e=true vscode=true " "$(run pull_request "$root")"

change schemas/dev.yaml 'more: 1'
check "embedded schema runs rust" "rust=true tests=true wasm=true proofs=true e2e=true vscode=true " "$(run pull_request "$root")"
change schemas/unused.yaml 'more: 1'
check "non-embedded schema runs the tests only" "$DATA" "$(run pull_request "$root")"

change proofs/rocq/Schema.v '(* more *)'
check "proof-only change runs proofs only" "rust=false tests=false wasm=false proofs=true e2e=false vscode=false " "$(run pull_request "$root")"
change BUILD.bazel '# more'
check "Bazel BUILD change runs proofs only" "rust=false tests=false wasm=false proofs=true e2e=false vscode=false " "$(run merge_group "$root")"

change artifacts/requirements.yaml '# more'
check "artifact change runs the tests and e2e" "rust=false tests=true wasm=false proofs=false e2e=true vscode=false " "$(run pull_request "$root")"

change vscode-rivet/package.json '{}'
check "extension-only change runs the extension job only" "rust=false tests=false wasm=false proofs=false e2e=false vscode=true " "$(run pull_request "$root")"
check "extension-only merge_group run runs the extension job only" "rust=false tests=false wasm=false proofs=false e2e=false vscode=true " "$(run merge_group "$root")"

# Fail CLOSED on classification (#1204): the lists name what is NOT code, so
# an input nobody listed runs the full matrix, and a code file inside a data
# tree is still code. Negative control: a path that IS listed as other skips.
change docs/example.rs 'fn main() {}'
check ".rs under docs/ is code" "rust=true tests=true wasm=true proofs=true e2e=true vscode=true " "$(run pull_request "$root")"
change supply-chain/audits.toml '# more'
check "supply-chain change runs the tests (cargo-vet) and wasm-seam" "$SUPPLY" "$(run pull_request "$root")"
change config/new-input.cfg 'x = 1'
check "unclassified path fails closed to code" "rust=true tests=true wasm=true proofs=true e2e=true vscode=true " "$(run pull_request "$root")"
change README.md 'more'
check "root markdown is data" "$DATA" "$(run pull_request "$root")"
change LICENSE-MIT 'more'
check "listed non-code path skips everything" "$NONE" "$(run pull_request "$root")"

# wasm-seam no longer hangs off a positive list of seam paths (#1211): a
# seam input the list did not name skipped a CI Gate need. A Rust file the
# old list never named (the composition core the seam wraps lives in plain
# rivet-core/src) runs it; docs and artifacts do not.
change rivet-core/src/composition.rs 'pub fn c() {}'
check "an unlisted Rust file runs wasm-seam" "rust=true tests=true wasm=true proofs=true e2e=true vscode=true " "$(run pull_request "$root")"
change docs/guide.md 'wasm-irrelevant prose'
check "docs do not run wasm-seam" "$DATA" "$(run pull_request "$root")"

change tools/ci/detect-changes.sh '# more'
check "detector change runs everything" "$ALL" "$(run pull_request "$root")"

change .github/workflows/ci.yml 'x: 1'
check "workflow change runs everything" "$ALL" "$(run pull_request "$root")"

# The queue base is used, not ignored: HEAD = root → .rs commit → docs commit.
# Diffed from the .rs commit only docs changed; diffed from root the .rs
# change is in range. Same HEAD, different base, different answer.
change rivet-core/src/lib.rs 'pub fn g() {}'
mid="$(g rev-parse HEAD)"
echo '# more' >> "$repo/docs/guide.md"; g add -A; g commit -q -m docs
check "merge_group base after the Rust commit skips rust" "$DATA" "$(run merge_group "$mid")"
check "merge_group base before the Rust commit runs rust" "rust=true tests=true wasm=true proofs=true e2e=true vscode=true " "$(run merge_group "$root")"

# temper's gate probe (.github/gate-probe.json) runs the detector with no
# event, no base and no git range, only GATE_PROBE_FILES. Classification must
# run on the listed paths: a listed non-code path must come back all false,
# or the probe could not tell a real classifier from one that says true to
# everything. An empty or unreadable list fails closed.
probe() { # probe <file listing paths> → same output format as run
  : > "$tmp/out"
  (cd "$repo" && env -i PATH="$PATH" REALPATH="$REALPATH" GATE_PROBE_FILES="$1" \
    GITHUB_OUTPUT="$tmp/out" bash "$DETECT") > "$tmp/last.log" 2>&1
  for k in rust tests wasm proofs e2e vscode; do
    printf '%s=%s ' "$k" "$(sed -n "s/^$k=//p" "$tmp/out" | tail -1)"
  done
}
g checkout -q "$root"
printf 'docs/gate-probe-control.rs\n' > "$tmp/p1"
check "probe: .rs under docs/ is code" "rust=true tests=true wasm=true proofs=true e2e=true vscode=true " "$(probe "$tmp/p1")"
printf 'supply-chain/gate-probe-control.toml\n' > "$tmp/p2"
check "probe: supply-chain/ is data, and wasm-relevant" "$SUPPLY" "$(probe "$tmp/p2")"
printf 'gate-probe-new-dir/control.bin\n' > "$tmp/p3"
check "probe: a new top-level directory is code" "rust=true tests=true wasm=true proofs=true e2e=true vscode=true " "$(probe "$tmp/p3")"
printf 'LICENSE-MIT\n' > "$tmp/p4"
check "probe: a listed non-code path skips everything (classifier ran)" "$NONE" "$(probe "$tmp/p4")"
: > "$tmp/p5"
check "probe: an empty list fails closed" "$ALL" "$(probe "$tmp/p5")"
check "probe: an unreadable list fails closed" "$ALL" "$(probe "$tmp/does-not-exist")"

if [ "$fails" -ne 0 ]; then
  echo "detect-changes_test: $fails failure(s)"
  exit 1
fi
echo "detect-changes_test: all passed"

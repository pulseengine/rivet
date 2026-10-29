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

# run <event> <base> → prints "rust=.. wasm=.. proofs=.. e2e=.."
run() {
  : > "$tmp/out"
  (cd "$repo" && EVENT_NAME="$1" BASE_SHA="$2" GITHUB_OUTPUT="$tmp/out" bash "$DETECT") > "$tmp/last.log" 2>&1
  for k in rust wasm proofs e2e; do
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
ALL="rust=true wasm=true proofs=true e2e=true "
NONE="rust=false wasm=false proofs=false e2e=false "

echo "detect-changes.sh:"
change docs/guide.md more
check "docs-only pull request skips everything" "$NONE" "$(run pull_request "$root")"
check "docs-only merge_group run skips everything" "$NONE" "$(run merge_group "$root")"
check "push runs everything" "$ALL" "$(run push "$root")"
check "schedule runs everything" "$ALL" "$(run schedule "$root")"
check "pull request with no base fails closed" "$ALL" "$(run pull_request "")"
check "merge_group with no base fails closed" "$ALL" "$(run merge_group "")"
check "bad base fails closed" "$ALL" "$(run merge_group 0123456789abcdef0123456789abcdef01234567)"
check "empty diff fails closed" "$ALL" "$(run pull_request HEAD)"

change rivet-core/src/lib.rs 'pub fn f() {}'
check ".rs change runs rust, proofs, e2e" "rust=true wasm=false proofs=true e2e=true " "$(run pull_request "$root")"

change schemas/dev.yaml 'more: 1'
check "embedded schema runs rust" "rust=true wasm=false proofs=true e2e=true " "$(run pull_request "$root")"
change schemas/unused.yaml 'more: 1'
check "non-embedded schema skips rust" "$NONE" "$(run pull_request "$root")"

change proofs/rocq/Schema.v '(* more *)'
check "proof-only change runs proofs only" "rust=false wasm=false proofs=true e2e=false " "$(run pull_request "$root")"
change BUILD.bazel '# more'
check "Bazel BUILD change runs proofs only" "rust=false wasm=false proofs=true e2e=false " "$(run merge_group "$root")"

change artifacts/requirements.yaml '# more'
check "artifact change runs e2e only" "rust=false wasm=false proofs=false e2e=true " "$(run pull_request "$root")"

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
check "merge_group base after the Rust commit skips rust" "$NONE" "$(run merge_group "$mid")"
check "merge_group base before the Rust commit runs rust" "rust=true wasm=false proofs=true e2e=true " "$(run merge_group "$root")"

if [ "$fails" -ne 0 ]; then
  echo "detect-changes_test: $fails failure(s)"
  exit 1
fi
echo "detect-changes_test: all passed"

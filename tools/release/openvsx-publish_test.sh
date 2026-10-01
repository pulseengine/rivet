#!/usr/bin/env bash
# Oracle for tools/release/openvsx-publish.sh (REQ-397).
# rivet: verifies REQ-397
#
# The job runs only on a tag, so its mode choice is exercised here. The
# defects guarded against: a configured trusted-publishing registration that
# silently skips (or warns) instead of failing, and a PAT that is ignored.
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=/dev/null
. "$HERE/openvsx-publish.sh"

fails=0
check() { # check <name> <expected> <actual>
  if [ "$2" = "$3" ]; then
    echo "  ok   $1"
  else
    echo "  FAIL $1: expected '$2', got '$3'"
    fails=$((fails + 1))
  fi
}

mode() { # mode <OVSX_PAT> <OPENVSX_TRUSTED_PUBLISHING> <ACTIONS_ID_TOKEN_REQUEST_URL>
  OVSX_PAT="$1" OPENVSX_TRUSTED_PUBLISHING="$2" ACTIONS_ID_TOKEN_REQUEST_URL="$3" \
    openvsx_mode
  echo "rc=$?"
}

URL=https://token.actions.example/oidc
echo "openvsx_mode"
check "nothing configured skips" "skip rc=0" "$(mode '' '' '' | tr '\n' ' ' | sed 's/ $//')"
check "a token request URL alone does not publish" "skip rc=0" \
  "$(mode '' '' "$URL" | tr '\n' ' ' | sed 's/ $//')"
check "a PAT publishes with the PAT" "pat rc=0" "$(mode secret '' '' | tr '\n' ' ' | sed 's/ $//')"
check "a PAT wins over trusted publishing" "pat rc=0" \
  "$(mode secret true "$URL" | tr '\n' ' ' | sed 's/ $//')"
check "a registration publishes trusted" "trusted rc=0" \
  "$(mode '' true "$URL" | tr '\n' ' ' | sed 's/ $//')"
got="$(mode '' true '')"
check "a registration without id-token permission fails" "rc=1" "${got##*$'\n'}"
case "$got" in
  "error: "*"id-token: write"*) echo "  ok   the failure names the missing permission" ;;
  *) echo "  FAIL the failure names the missing permission: got '$got'"; fails=$((fails + 1)) ;;
esac
check "only the exact value true enables trusted" "skip rc=0" \
  "$(mode '' TRUE "$URL" | tr '\n' ' ' | sed 's/ $//')"

echo "publish script, skip path"
T="$(mktemp -d)"
trap 'rm -rf "$T"' EXIT
out="$(env -u OVSX_PAT -u OPENVSX_TRUSTED_PUBLISHING GITHUB_OUTPUT="$T/out" \
  bash "$HERE/openvsx-publish.sh" x.vsix 2>&1)"
check "skip exits 0" "0" "$?"
check "skip records published=false" "published=false" "$(cat "$T/out")"
case "$out" in
  *"::warning::Open VSX is not configured"*) echo "  ok   skip is a visible warning" ;;
  *) echo "  FAIL skip is a visible warning: got '$out'"; fails=$((fails + 1)) ;;
esac
: > "$T/out"
out="$(env -u OVSX_PAT OPENVSX_TRUSTED_PUBLISHING=true ACTIONS_ID_TOKEN_REQUEST_URL= \
  GITHUB_OUTPUT="$T/out" bash "$HERE/openvsx-publish.sh" x.vsix 2>&1)"
check "a misconfigured registration exits 1" "1" "$?"
check "and records nothing" "" "$(cat "$T/out")"

if [ "$fails" -ne 0 ]; then
  echo "openvsx-publish: $fails check(s) failed"
  exit 1
fi
echo "openvsx-publish: all checks passed"

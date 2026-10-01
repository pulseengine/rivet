#!/usr/bin/env bash
# Publish the VS Code extension to Open VSX (REQ-397).
#
# Trusted publishing is the target: the job exchanges its GitHub OIDC token for
# a five-minute, single-extension token, so no long-lived secret exists. Open
# VSX accepts a trusted-publishing registration only for a namespace you own
# and an extension that already has an active version, so the FIRST version has
# to arrive another way: an OVSX_PAT secret, or a manual upload on open-vsx.org.
#
# The mode is chosen explicitly, never inferred from a failed attempt:
#   pat      OVSX_PAT is set (bootstrap; ovsx gives a PAT precedence anyway)
#   trusted  the repository variable OPENVSX_TRUSTED_PUBLISHING is `true`,
#            set by the maintainer after registering release.yml on open-vsx.org
#   skip     neither: warn, as for a missing Marketplace token
# A trusted-publishing failure is an error, not a skip: once the maintainer
# has said the registration exists, a failed exchange is a real fault.
#
# Usage: openvsx-publish.sh <vsix>       (sourcing defines openvsx_mode only)

OVSX_VERSION=1.2.0 # the first ovsx with --trusted-publishing

# openvsx_mode: print pat | trusted | skip, or `error: <reason>` and return 1.
openvsx_mode() {
  if [ -n "${OVSX_PAT:-}" ]; then
    echo pat
  elif [ "${OPENVSX_TRUSTED_PUBLISHING:-}" = true ]; then
    if [ -z "${ACTIONS_ID_TOKEN_REQUEST_URL:-}" ]; then
      echo "error: OPENVSX_TRUSTED_PUBLISHING is true but the job cannot request an OIDC token (it needs permissions: id-token: write)"
      return 1
    fi
    echo trusted
  else
    echo skip
  fi
}

if [ "${BASH_SOURCE[0]}" = "$0" ]; then
  set -euo pipefail
  vsix="${1:?usage: openvsx-publish.sh <vsix>}"
  out="${GITHUB_OUTPUT:-/dev/null}"
  if ! mode="$(openvsx_mode)"; then
    echo "::error::${mode#error: }"
    exit 1
  fi
  case "$mode" in
    skip)
      echo "::warning::Open VSX is not configured: neither the OVSX_PAT secret nor the OPENVSX_TRUSTED_PUBLISHING repository variable is set. The VSIX is attached to the GitHub Release but WILL NOT be published to Open VSX."
      echo "::warning::Setup: https://github.com/eclipse-openvsx/openvsx/wiki/Trusted-Publishing"
      echo "published=false" >> "$out"
      ;;
    pat)
      npx --yes "ovsx@${OVSX_VERSION}" publish "$vsix" -p "$OVSX_PAT"
      echo "published=true" >> "$out"
      ;;
    trusted)
      npx --yes "ovsx@${OVSX_VERSION}" publish "$vsix" --trusted-publishing
      echo "published=true" >> "$out"
      ;;
  esac
fi

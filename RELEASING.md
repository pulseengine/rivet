# Releasing rivet

This document covers the steps a maintainer takes to cut a new rivet
release. Most of the work happens in CI; the maintainer's job is to
land a release commit and push a signed tag.

## TL;DR

```bash
# 0. Generate the release note from the trace — do NOT hand-write the scope.
#    Implements ASPICE 11-03 (SPL.2.BP6 requires a note per release). The
#    output names what is delivered, what was committed but withheld, the
#    verification evidence per artifact, and the 11-03 elements rivet does
#    not yet compute. Paste the relevant sections into CHANGELOG.md.
rivet release notes vX.Y.Z --since v<PREV> > /tmp/release-note.md

# 1. Land a release-prep PR with the version bump + CHANGELOG update.
#    (Workspace version lives in Cargo.toml [workspace.package].)
gh pr merge <PR#> --squash

# 2. From the merge commit, create and push a GPG-signed tag.
git fetch origin main && git checkout main && git reset --hard origin/main
git tag -s vX.Y.Z -m "rivet vX.Y.Z"
git push origin vX.Y.Z

# 3. CI does the rest: cross-platform binaries, VSIX, compliance report,
#    cosign-signed SHA256SUMS, GitHub Release page, VS Code Marketplace.
```

## Version locations

- **Authoritative:** `Cargo.toml [workspace.package].version` — the
  release-prep PR bumps this (plus `Cargo.lock` and
  `vscode-rivet/package.json` for the Marketplace listing).
- **Workflow-managed, do NOT need a manual bump:** `npm/package.json` and
  `platform-packages/*/package.json`. `release-npm.yml` rewrites their
  `version` (and the root's `optionalDependencies`) to the tag at publish
  time via `jq`, then publishes — the committed values are never read by
  the published artifact. They are kept roughly in sync only so the repo
  doesn't *look* abandoned (a stale `0.4.x` here previously caused exactly
  that confusion); a drift between releases is harmless. The published
  channel is `npm view @pulseengine/rivet version`, not these files.

## The release note is generated, not written

`rivet release notes <version> --since <prev>` computes the note from the
artifact store and the commit trailers. The scope section is the same
release-readiness query `rivet release status` runs, which is the point: the
hand-written notes drifted from that query twice, and the drift was caught only
by diffing them by hand.

Two properties worth knowing before you paste it into `CHANGELOG.md`:

- **Verification evidence is the union of `verifies` links and
  `// rivet: verifies` source markers**, reported as separate counts. rivet
  verifies almost entirely by marker, so a link-only count would report every
  verified artifact as unverified (this is #788 / REQ-329).
- **`#N` tokens are reported as `refs`, never as `closes`.** Under squash-merge
  a subject's `#N` is usually the pull request rather than an issue, and the two
  cannot be told apart from the text. Asserting closure would fabricate a claim
  in a release record — if you want closure stated, verify it and write it.

The note ends with the 11-03 elements rivet does not compute (application
parameters, variants, licence information, delivery approval, and four others).
That section is deliberate: an omitted required element is worse than a declared
gap. Wiring the note into `release.yml` as a release asset is tracked separately.

## Why signed tags

The release workflow keys publication off the tag push. An attacker
with write access to the `main` ref (or someone tricking a maintainer
into running `git tag` without `-s`) can otherwise create a release on
behalf of the rivet project without leaving cryptographic evidence.

`git tag -s` binds the tag to a GPG key. Verification:

```bash
git tag -v vX.Y.Z
```

CI does **not** enforce that the tag is signed — branch protection on
the tag namespace would be the right place to add that gate, but that's
deployment-specific. Maintainers should sign tags as a matter of policy.

## What CI signs

Per the supply-chain finding in the v0.10.0 adversarial review, the
release workflow now signs `SHA256SUMS.txt` using **sigstore keyless
OIDC** (no long-lived keys, no rotation, no KMS provisioning needed):

- `SHA256SUMS.txt.cosign.bundle` — verifier-friendly bundle (single
  file containing signature + certificate + Rekor inclusion proof).
- `SHA256SUMS.txt.sig` — detached signature, useful for tools that
  don't speak the bundle format.
- `SHA256SUMS.txt.pem` — Fulcio-issued certificate (short-lived,
  expires within minutes — verification relies on Rekor's tamper-
  evident log, not on the cert validity window).

Trust anchor: the certificate's identity claim is the workflow's
GitHub-OIDC identity (issuer `https://token.actions.githubusercontent.com`,
subject pattern `https://github.com/pulseengine/rivet/.github/workflows/release.yml@refs/tags/vX.Y.Z`).
A signature that doesn't match this identity is not a rivet release.

## How a consumer verifies

```bash
# Download from the release page:
#   SHA256SUMS.txt
#   SHA256SUMS.txt.cosign.bundle
#   <the binary archive you want to verify>

# 1. Verify the signature on SHA256SUMS.txt.
cosign verify-blob \
  --bundle SHA256SUMS.txt.cosign.bundle \
  --certificate-identity-regexp 'https://github.com/pulseengine/rivet/.github/workflows/release.yml@.*' \
  --certificate-oidc-issuer 'https://token.actions.githubusercontent.com' \
  SHA256SUMS.txt

# 2. Verify your binary's checksum against the signed list.
sha256sum -c SHA256SUMS.txt --ignore-missing
```

If the first step fails the binary is not from this release pipeline —
do not run it. If the second step fails the binary has been modified
since the release was cut — do not run it.

## What is NOT signed (current scope)

Per the v0.10.0 dossier §0 honest scope statement, the following are
**not** signed and should not be treated as cryptographically attested:

- Individual binary archives (`rivet-vX.Y.Z-*.tar.gz`, `*.zip`). The
  signed `SHA256SUMS.txt` covers them transitively; verification
  requires the two-step flow above.
- The VSIX (`rivet-sdlc-X.Y.Z.vsix`). Tracked as a separate workstream.
- The git tag's signing status (rivet relies on the maintainer's GPG
  key for tag signatures; the rivet project does not currently
  distribute a maintainer keylist).
- The compliance report tarball (`*-compliance-report.tar.gz`). It is
  reproducible from source, but the tarball as shipped is unsigned.

This list reflects v0.10.0+ state. Future workstreams may close some
of these.

## Manual republish (when CI couldn't complete)

If `build-test-evidence` or another non-blocking job fails such that
the binaries built but the release page wasn't populated, the
maintainer can republish from the workflow artifacts:

```bash
# Download the artifacts from the failed workflow run.
RUN_ID=<the failed workflow run id>
gh run download "$RUN_ID" --dir /tmp/release-staging

# Collect into a staging dir.
cd /tmp/release-staging
mkdir -p out
find . -type f \( -name "*.tar.gz" -o -name "*.zip" -o -name "*.vsix" \) -exec cp {} out/ \;
cd out
sha256sum * > SHA256SUMS.txt

# Sign locally (you need cosign installed and a Sigstore identity).
# NB: a local cosign signature uses YOUR identity, not the CI identity.
# Consumers must verify against the maintainer's published identity,
# not the workflow's. Prefer re-running the workflow when possible.
cosign sign-blob --bundle SHA256SUMS.txt.cosign.bundle SHA256SUMS.txt

# Create the release.
gh release create vX.Y.Z --title "Rivet vX.Y.Z" --notes-file CHANGES.md ./*
```

This path was used for the v0.10.0 cold-republish; see the release
workflow patch in #294 for the structural fix that prevents future
hand-publishes.

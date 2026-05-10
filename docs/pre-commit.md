# Canonical pre-commit configuration

Rivet ships a 21-hook `.pre-commit-config.yaml` that is the reference for
PulseEngine Rust repositories. The canonical, copy-pasteable version lives
at [`templates/pre-commit/.pre-commit-config.yaml`](../templates/pre-commit/.pre-commit-config.yaml).

This document explains why each hook exists, which standard clause it helps
satisfy, and how an adopter repository picks the right tier.

> **Hook security model (REQ-051).** Pre-commit hooks are convenience for
> local development; `git commit --no-verify` trivially bypasses all of
> them. CI must independently run the same checks as required status
> checks for any traceability or safety claim to hold.

## Tiers (advisory)

The hook set is split into three advisory tiers. Repositories pick the
lowest tier that matches their assurance posture and may freely add hooks
from higher tiers. The tier is a recommendation; the only hard requirement
is that whatever ships in CI matches the safety claims the repository
makes in its `rivet.yaml`.

| Tier | Adds | When to use |
|---|---|---|
| **T1 — baseline** | File hygiene, yamllint, `cargo fmt`/`clippy`/`test`, `rivet validate`, `rivet commit-msg-check` | Every PulseEngine Rust repository |
| **T2 — safety-critical** | + `cargo audit`, `cargo deny`, `cargo bench --no-run` | Anything claiming an ASIL / DAL level or shipping signed binaries |
| **T3 — verification-heavy** | + `cargo mutants` (pre-push) | Repositories whose tests must meet a mutation-score target (rivet today; see #185) |

Each hook in the canonical template carries a `# T1 / T2 / T3` annotation
in a trailing comment so an adopter can grep-trim the file to their tier.

> The exact T1 / T2 / T3 partition is open for review — see issue
> [#186](https://github.com/pulseengine/rivet/issues/186) for the
> discussion. The annotations in the template reflect the proposal as
> filed and may be tightened during review.

## Per-hook rationale

| Hook | Tier | Standard mapping | Why it exists |
|---|---|---|---|
| `trailing-whitespace` | T1 | hygiene | Eliminates noisy diffs |
| `end-of-file-fixer` | T1 | hygiene | POSIX text-file convention |
| `check-yaml` | T1 | hygiene | YAML parses; required because rivet artifacts are YAML |
| `check-toml` | T1 | hygiene | `Cargo.toml` / `deny.toml` parse |
| `check-json` | T1 | hygiene | Settings + lockfile parse |
| `check-added-large-files` | T1 | hygiene | Prevents accidental binary check-in (>500 KB) |
| `check-merge-conflict` | T1 | hygiene | Catches stray `<<<<<<<` markers |
| `detect-private-key` | T1 | security hygiene | Catches PEM/SSH keys before they hit the remote |
| `check-case-conflict` | T1 | hygiene | Avoids cross-platform breakage |
| `check-symlinks` | T1 | hygiene | Avoids dangling symlinks |
| `mixed-line-ending` | T1 | hygiene | Forces LF |
| `yamllint` | T1 | hygiene | Enforces YAML style consistent with `.yamllint.yaml` |
| `cargo-fmt` | T1 | ISO 26262-6 §5.4.7 (style) | Style consistency, deterministic diffs |
| `cargo-clippy` | T1 | IEC 61508-3 §7.4.4 (defensive programming) | Lint-as-spec; `-D warnings` makes lints blocking |
| `cargo-test` | T1 | DO-178C §6.4 (verification) | Functional unit/integration tests |
| `rivet-validate` | T1 | DO-178C §A-7 (traceability), ISO 26262-8 §6 | Schema + link-graph integrity for the traceability artifacts |
| `rivet-commit-msg` | T1 | DO-178C §A-7 (traceability) | Commit-message trailers (`Implements:`, `Verifies:`, ...) — see CLAUDE.md "Commit Traceability" |
| `cargo-audit` | T2 | EU CRA Art. 13 (vulnerability handling) | Blocks known-CVE dependencies (RustSec advisory DB) |
| `cargo-deny` | T2 | EU CRA Art. 13, IEC 61508-3 §7.4.2.13 | License + dependency policy enforcement |
| `cargo-bench-check` | T2 | regression hygiene | Bench harness still compiles (full run is too slow for pre-push) |
| `cargo-mutants` | T3 | IEC 61508-3 Annex C.5.12, ISO 26262-6 Tab. 13 | Test-suite adequacy via mutation testing (the strongest answer to the open MC/DC-for-Rust question) |

## Adoption recipe

1. Copy `templates/pre-commit/.pre-commit-config.yaml` into the adopter
   repository root.
2. Trim hooks to the chosen tier; comment out (don't delete) lower-tier
   hooks you defer for later so the diff back to the canonical template
   stays readable.
3. Resolve every `CUSTOMIZE:` marker in the file:
   - `cargo +stable` — pin to whatever channel `rust-toolchain.toml`
     declares.
   - `rivet validate` `files:` glob — match the adopter's artifact /
     schema directory layout.
   - `cargo-mutants -p YOUR_CRATE` — pick the most safety-critical crate
     (full-workspace mutation runs are too slow for pre-push; CI shards
     are the right home for full coverage).
4. Run `pre-commit install` and `pre-commit install --hook-type pre-push
   --hook-type commit-msg` so all the configured stages are active.
5. Mirror the same set of hooks into CI as required status checks.
   Pre-commit hooks alone do not satisfy any traceability claim — see
   "Hook security model" at the top of this document.

## Installing `rivet` for hooks

Two tested install paths:

- **Cargo:** `cargo install --git https://github.com/pulseengine/rivet
  rivet-cli` (pin a tag/sha for reproducibility).
- **Pre-commit `additional_dependencies`** (preferred for adopters): once a
  binary release exists, the `rivet-validate` and `rivet-commit-msg`
  entries can be wrapped in a pre-commit `local` repo with
  `additional_dependencies: [rivet@<version>]`. Tracking issue:
  [#187](https://github.com/pulseengine/rivet/issues/187).

## Drift policy

Because adopter repositories will lag the canonical template, run a
quarterly diff:

```sh
diff -u templates/pre-commit/.pre-commit-config.yaml \
        ../<adopter>/.pre-commit-config.yaml
```

Justified divergences (a hook genuinely doesn't apply) belong in the
adopter's `docs/pre-commit.md` as an explicit opt-out with rationale.

## See also

- [`templates/pre-commit/.pre-commit-config.yaml`](../templates/pre-commit/.pre-commit-config.yaml) — the template itself
- [Issue #186](https://github.com/pulseengine/rivet/issues/186) — canonical-template tracking issue
- [Issue #187](https://github.com/pulseengine/rivet/issues/187) — `rivet-validate` enforcement across repos
- [Issue #185](https://github.com/pulseengine/rivet/issues/185) — `cargo-mutants` adoption (T3)
- `CLAUDE.md` — "Commit Traceability" and "Hook Security Model" sections

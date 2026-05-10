# cargo-mutants template

Reusable cargo-mutants configuration extracted from rivet's pre-push hook.

## Files

- `mutants.toml` — base config (timeouts, exclusions, skip calls).
- `mutants.yml` — nightly + manual-dispatch GitHub Actions workflow.

## Quickstart for adopters

```sh
# From the root of the adopting repo:
mkdir -p .github/workflows
cp .../rivet/templates/cargo-mutants/mutants.toml ./mutants.toml
cp .../rivet/templates/cargo-mutants/mutants.yml .github/workflows/mutants.yml

# Edit mutants.yml and replace the matrix `crate` list with your crates.
# Edit mutants.toml and tighten exclusions / skip_calls per crate.
```

## Three operating modes

| Mode | Where | Cost | When |
|---|---|---|---|
| Pre-commit (off) | Local | Too slow for `pre-commit` | Skip; mutation testing should not block local edits. |
| Pre-push smoke | Local `.pre-commit-config.yaml`, `stages: [pre-push]` | ~1–5 min | Optional, against a single crate's lib. |
| CI nightly | `mutants.yml` | 30–90 min per crate | Required gate for safety-critical crates. |

## Score targets

See [`docs/mutation-testing.md`](../../docs/mutation-testing.md) for
ASIL/DAL targets and the procedure for marking unreachable mutants.
The schema field `mutation-score` on `test-exec` (in
`schemas/score.yaml`) is the place to record measured scores so they
flow into rivet traceability.

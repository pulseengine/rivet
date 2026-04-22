# Feature Binding File Format

A binding file maps features from the feature model to the artifacts and
source code that implement them. This is a separate file from the feature
model and the variant configuration: the feature model describes *what*
can be chosen, the variant says *what was chosen*, the binding says
*where the implementation lives*.

See [feature-model-schema.md](feature-model-schema.md) for the feature
model reference.

## File shape

```yaml
# artifacts/bindings.yaml
bindings:
  <feature-name>:
    artifacts: [<ID>, <ID>, …]   # optional; artifact IDs from the project
    source:    [<glob>, …]       # optional; source globs, e.g. src/auth/**
```

| Field     | Type         | Required | Meaning                                                |
| --------- | ------------ | -------- | ------------------------------------------------------ |
| `bindings`| map          | yes      | Keyed by feature name; every key must appear in the   |
|           |              |          | feature model.                                         |

Each binding entry:

| Field       | Type         | Default | Meaning                                               |
| ----------- | ------------ | ------- | ----------------------------------------------------- |
| `artifacts` | list<string> | `[]`    | Artifact IDs (e.g. `REQ-042`) implemented by feature. |
| `source`    | list<string> | `[]`    | Glob patterns for the implementing source files.      |

Features not listed in `bindings` are treated as having no artifact or
source coverage — validation reports them as `unbound`.

## Worked example

```yaml
# examples/variant/bindings.yaml
bindings:
  pedestrian-detection:
    artifacts: [REQ-042, REQ-043]
    source: ["src/perception/pedestrian/**"]
  lane-keeping:
    artifacts: [REQ-050]
    source: ["src/control/lane_keep/**"]
  adaptive-cruise:
    artifacts: [REQ-051]
    source: ["src/control/cruise/**"]
  eu:
    artifacts: [REQ-200]
  asil-c:
    artifacts: [REQ-101]
```

## Optional: per-variant declarations

The binding file may also declare named variants that `rivet variant
check-all` will iterate:

```yaml
variants:
  - name: eu-adas-c
    selects: [eu, adas, asil-c]
  - name: us-autonomous-d
    selects: [us, autonomous, asil-d]

bindings:
  …
```

When present, `rivet variant check-all --model fm.yaml --binding b.yaml`
resolves every entry under `variants:` and exits non-zero if any fail.

If a binding file has no `variants` block, `check-all` reports an empty
result and exits successfully.

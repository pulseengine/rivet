# Rivet Compliance Report Action

Generate a self-contained HTML compliance report from [rivet](https://github.com/pulseengine/rivet)-managed artifacts.

## Quick start

```yaml
- uses: pulseengine/rivet/.github/actions/compliance@main
  with:
    report-label: v0.1.0
```

## What it produces

A directory of static HTML files (default: `compliance/`) plus an optional tar.gz archive:

| File | Contents |
|------|----------|
| `index.html` | Dashboard — artifact counts, validation status, coverage |
| `requirements.html` | All artifacts grouped by type, anchor-linked |
| `documents.html` | Document index with links to individual doc pages |
| `doc-{ID}.html` | Individual documents with resolved `[[ID]]` cross-references |
| `matrix.html` | Type-vs-type traceability matrix with coverage |
| `coverage.html` | Per-rule traceability coverage |
| `validation.html` | Diagnostics and rule check results |
| `README.html` | Self-describing guide for the archive |
| `config.js` | Runtime configuration — edit after deployment |

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `report-label` | no | git tag or `"dev"` | Display label in the report header and version switcher. Cosmetic only — does not select code. |
| `homepage` | no | `""` | URL for the "← project" back-link in navigation. |
| `other-versions` | no | `[]` | JSON array of `[{"label":"v1.0","path":"../v1.0/"}]` for the version dropdown. Paths are relative. |
| `theme` | no | `dark` | `"dark"` (PulseEngine style) or `"light"` (print-friendly). |
| `offline` | no | `false` | Use system fonts only (no Google Fonts). For air-gapped environments. |
| `rivet-version` | no | `source` | `"source"` builds from the repo, or a release tag like `"v0.1.0"` to download a pre-built binary. |
| `output` | no | `compliance` | Output directory for HTML files. |
| `archive` | no | `true` | Create a tar.gz archive. |
| `archive-name` | no | auto | Archive filename (without `.tar.gz`). Defaults to `{project}-{label}-compliance-report`. |
| `project-dir` | no | `.` | Path to the directory containing `rivet.yaml`. |

## Outputs

| Output | Description |
|--------|-------------|
| `report-dir` | Path to the HTML directory |
| `archive-path` | Path to the tar.gz archive |
| `artifact-count` | Number of artifacts in the project |
| `validation-result` | `"PASS"` or `"FAIL"` |

## Examples

### Release workflow

```yaml
on:
  push:
    tags: ["v*"]

jobs:
  compliance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: dtolnay/rust-toolchain@stable
      - uses: Swatinem/rust-cache@v2

      - uses: pulseengine/rivet/.github/actions/compliance@main
        id: report
        with:
          homepage: https://myproject.dev
          other-versions: '[{"label":"v0.1.0","path":"../v0.1.0/"}]'

      - uses: actions/upload-artifact@v4
        with:
          name: compliance-report
          path: ${{ steps.report.outputs.archive-path }}
```

### Multi-version deployment

```
/release/myproject/
  v0.1.0/compliance/   ← each version has its own report
  v0.2.0/compliance/   ← config.js links to siblings
  latest/compliance/   ← symlink to current
```

```yaml
- uses: pulseengine/rivet/.github/actions/compliance@main
  with:
    report-label: v0.2.0
    other-versions: '[{"label":"v0.1.0","path":"../v0.1.0/compliance/"}]'
```

### Using as a reusable workflow

```yaml
jobs:
  compliance:
    uses: pulseengine/rivet/.github/workflows/compliance.yml@main
    with:
      version: v0.1.0
      homepage: https://myproject.dev
```

## Customizing after deployment

Edit `config.js` in the output directory — no rebuild needed:

```javascript
var RIVET_EXPORT = {
  homepage: "https://myproject.dev",
  projectName: "My Project",
  versionLabel: "v0.2.0",
  versions: [
    { "label": "v0.1.0", "path": "../v0.1.0/compliance/" }
  ],
  // Use parent site's CSS instead of embedded styles:
  // externalCss: "/main.css",
};
```

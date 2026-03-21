# Rivet SDLC — VS Code Extension

SDLC artifact traceability with live validation, hover info, and embedded dashboard.

## Features

### Real-time Validation

Red squiggly lines appear on broken links, missing required fields, and cardinality violations as you edit YAML artifact files. Powered by salsa incremental computation — only changed files are re-validated.

### Hover Info

Hover over any artifact ID (e.g., `REQ-001`) to see its title, type, description, status, and link count.

### Go-to-Definition

Ctrl+click (or Cmd+click on macOS) on an artifact ID to jump to its definition in the source YAML file.

### Completions

- Type `target:` in a link block → suggests all artifact IDs with title and type
- Type `type:` → suggests artifact types from the loaded schema

### Embedded Dashboard

Open the Rivet dashboard as a side panel inside VS Code:

- **Rivet: Show Dashboard** — full dashboard with filter/sort/pagination
- **Rivet: Show Graph** — traceability graph
- **Rivet: Show STPA** — STPA + STPA-Sec hierarchy

The dashboard auto-refreshes when you save a file (`rivet serve --watch`).

### Commands

| Command | Description |
|---------|-------------|
| `Rivet: Show Dashboard` | Open dashboard in a WebView panel |
| `Rivet: Show Graph` | Open traceability graph |
| `Rivet: Show STPA` | Open STPA analysis view |
| `Rivet: Validate` | Run `rivet validate` and show results |
| `Rivet: Add Artifact` | Create a new artifact with quick-pick UI |

## Requirements

- **Rivet CLI** installed: `cargo install rivet-cli` (or download from [releases](https://github.com/pulseengine/rivet/releases))
- A workspace with `rivet.yaml` in the root

## Extension Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `rivet.binaryPath` | `""` (auto-detect) | Path to `rivet` binary |
| `rivet.serve.port` | `0` (auto-assign) | Port for the embedded dashboard |

## How It Works

1. **Activation**: When VS Code opens a folder with `rivet.yaml`, the extension activates
2. **LSP**: Starts `rivet lsp` via stdio for diagnostics, hover, goto-def, completions
3. **Dashboard**: Starts `rivet serve --watch` in the background on an auto-assigned port
4. **Live reload**: File saves trigger incremental re-validation (salsa) and dashboard refresh

## Development

```bash
cd vscode-rivet
npm install
npm run compile
# Press F5 in VS Code to launch Extension Development Host
```

## License

Apache-2.0

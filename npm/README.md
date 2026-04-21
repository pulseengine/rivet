# @pulseengine/rivet

SDLC traceability, validation, and MCP server for safety-critical systems.

Rivet links requirements, features, architecture, decisions, and verification
evidence across ISO 26262, DO-178C, ASPICE, and STPA. This npm package bundles
the `rivet` CLI binary (shipped per-platform via `optionalDependencies`) so it
can be invoked from any Node.js environment — including as a Claude Code MCP
server.

## Install

```bash
# One-shot (no install) — preferred for CI and MCP registration
npx @pulseengine/rivet --version

# Global install
npm install -g @pulseengine/rivet
rivet --version
```

## Claude Code MCP server

```bash
claude mcp add rivet npx -y @pulseengine/rivet mcp
```

## Supported platforms

- `darwin-arm64`, `darwin-x64`
- `linux-arm64`, `linux-x64`
- `win32-x64`

Binaries are pre-built and published alongside each GitHub release at
<https://github.com/pulseengine/rivet/releases>.

## License

Apache-2.0. See the [repository](https://github.com/pulseengine/rivet) for
source, documentation, and issues.

#!/usr/bin/env node
// diff-to-markdown.mjs — convert rivet diff + impact JSON into a PR-comment
// markdown body. Called by .github/workflows/rivet-delta.yml.
//
// Usage:
//   node scripts/diff-to-markdown.mjs \
//     --diff path/to/diff.json \
//     --impact path/to/impact.json \
//     --pr 123 --run 456 --repo owner/name
//
// Emits markdown on stdout. The first line is a hidden HTML comment
// marker (<!-- rivet-delta-bot -->) so the workflow can find-and-replace
// the same comment on subsequent pushes.
//
// Guarantees:
//   * Never throws on malformed input — emits a warning comment instead.
//   * Caps the mermaid graph at MERMAID_NODE_CAP nodes; overflow goes
//     into a collapsible <details> list.
//   * All inputs sanitised with `escapeMd` before rendering so artifact
//     IDs or titles containing markdown metacharacters cannot break out.

import { readFileSync } from "node:fs";
import { argv, stdout, stderr } from "node:process";

const MARKER = "<!-- rivet-delta-bot -->";
const MERMAID_NODE_CAP = 30;

// ── Argv parsing ────────────────────────────────────────────────────────
function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--diff") out.diff = argv[++i];
    else if (arg === "--impact") out.impact = argv[++i];
    else if (arg === "--pr") out.pr = argv[++i];
    else if (arg === "--run") out.run = argv[++i];
    else if (arg === "--repo") out.repo = argv[++i];
  }
  return out;
}

// ── Safe JSON load ──────────────────────────────────────────────────────
function loadJson(path, fallback) {
  if (!path) return fallback;
  try {
    const raw = readFileSync(path, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    stderr.write(`diff-to-markdown: failed to load ${path}: ${e.message}\n`);
    return fallback;
  }
}

// ── Sanitisation ────────────────────────────────────────────────────────
// Escape markdown metacharacters in user-controlled strings (artifact IDs,
// titles, link types) so a maliciously-titled artifact can't break out of
// the comment structure.
function escapeMd(s) {
  if (s === null || s === undefined) return "";
  return String(s)
    .replaceAll("\\", "\\\\")
    .replaceAll("|", "\\|")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("`", "\\`")
    .replaceAll("*", "\\*")
    .replaceAll("_", "\\_")
    .replaceAll("[", "\\[")
    .replaceAll("]", "\\]");
}

// Mermaid IDs must be alphanumeric + underscore. Replace everything else.
function mermaidId(id) {
  return String(id).replaceAll(/[^A-Za-z0-9_]/g, "_");
}

// ── Diff / impact extraction ────────────────────────────────────────────
function normalize(diff, impact) {
  const added = Array.isArray(diff?.added) ? diff.added : [];
  const removed = Array.isArray(diff?.removed) ? diff.removed : [];
  const modified = Array.isArray(diff?.modified) ? diff.modified : [];
  const impacted = Array.isArray(impact?.impacted) ? impact.impacted : [];
  return { added, removed, modified, impacted };
}

// ── Sections ────────────────────────────────────────────────────────────
function renderCountsTable({ added, removed, modified, impacted }) {
  const rows = [
    ["Added", added.length],
    ["Removed", removed.length],
    ["Modified", modified.length],
    ["Downstream impacted (depth ≤ 5)", impacted.length],
  ];
  let md = "| Change | Count |\n|---|---:|\n";
  for (const [label, n] of rows) {
    md += `| ${label} | ${n} |\n`;
  }
  return md;
}

function renderMermaid({ added, removed, modified }) {
  const nodes = new Map(); // id → class
  for (const id of added) nodes.set(String(id), "added");
  for (const id of removed) nodes.set(String(id), "removed");
  for (const m of modified) {
    if (m && m.id) nodes.set(String(m.id), "modified");
  }

  const total = nodes.size;
  if (total === 0) {
    return { md: "", truncated: false, total: 0 };
  }

  // Cap at MERMAID_NODE_CAP; overflow bucket rendered as a single summary
  // node with the remaining count so the diagram stays legible.
  const entries = [...nodes.entries()].slice(0, MERMAID_NODE_CAP);
  const truncated = total > MERMAID_NODE_CAP;

  // Edges: modified artifacts show added/removed links.
  const edges = [];
  for (const m of modified) {
    if (!m) continue;
    const src = mermaidId(m.id);
    if (!entries.some(([id]) => mermaidId(id) === src)) continue;
    for (const link of m.links_added ?? []) {
      const tgt = mermaidId(link.target);
      edges.push(`  ${src} -. "+ ${escapeMermaidLabel(link.link_type)}" .-> ${tgt}`);
    }
    for (const link of m.links_removed ?? []) {
      const tgt = mermaidId(link.target);
      edges.push(`  ${src} -. "- ${escapeMermaidLabel(link.link_type)}" .-> ${tgt}`);
    }
  }

  let md = "```mermaid\ngraph LR\n";
  for (const [id, kind] of entries) {
    const safeId = mermaidId(id);
    const label = String(id).replaceAll(`"`, "'");
    md += `  ${safeId}["${label}"]:::${kind}\n`;
  }
  if (truncated) {
    md += `  overflow["+${total - MERMAID_NODE_CAP} more"]:::overflow\n`;
  }
  for (const edge of edges) md += `${edge}\n`;
  md += "  classDef added fill:#d4edda,stroke:#28a745,color:#155724\n";
  md += "  classDef removed fill:#f8d7da,stroke:#dc3545,color:#721c24\n";
  md += "  classDef modified fill:#fff3cd,stroke:#ffc107,color:#856404\n";
  md +=
    "  classDef overflow fill:#e2e3e5,stroke:#6c757d,color:#495057,stroke-dasharray: 3 3\n";
  md += "```\n";
  return { md, truncated, total };
}

// Mermaid labels use double-quotes; we strip any that would break parsing.
function escapeMermaidLabel(s) {
  return String(s ?? "").replaceAll(`"`, "'");
}

function renderChangeList({ added, removed, modified }) {
  let md = "";
  if (added.length) {
    md += "<details><summary>Added</summary>\n\n";
    for (const id of added.slice(0, 200)) {
      md += `- \`${escapeMd(id)}\`\n`;
    }
    if (added.length > 200) md += `- … +${added.length - 200} more\n`;
    md += "\n</details>\n\n";
  }
  if (removed.length) {
    md += "<details><summary>Removed</summary>\n\n";
    for (const id of removed.slice(0, 200)) {
      md += `- \`${escapeMd(id)}\`\n`;
    }
    if (removed.length > 200) md += `- … +${removed.length - 200} more\n`;
    md += "\n</details>\n\n";
  }
  if (modified.length) {
    md += "<details><summary>Modified</summary>\n\n";
    md += "| ID | Changes |\n|---|---|\n";
    for (const m of modified.slice(0, 100)) {
      const parts = [];
      if (m.status_changed) {
        const [o, n] = m.status_changed;
        parts.push(`status: ${escapeMd(o ?? "—")} → ${escapeMd(n ?? "—")}`);
      }
      if (m.title_changed) parts.push("title changed");
      if (m.description_changed) parts.push("description changed");
      if (m.type_changed) {
        const [o, n] = m.type_changed;
        parts.push(`type: ${escapeMd(o)} → ${escapeMd(n)}`);
      }
      if (m.tags_added?.length) {
        parts.push(`+tags: ${m.tags_added.map(escapeMd).join(", ")}`);
      }
      if (m.tags_removed?.length) {
        parts.push(`−tags: ${m.tags_removed.map(escapeMd).join(", ")}`);
      }
      if (m.links_added?.length) parts.push(`+${m.links_added.length} link(s)`);
      if (m.links_removed?.length)
        parts.push(`−${m.links_removed.length} link(s)`);
      md += `| \`${escapeMd(m.id)}\` | ${parts.join("; ")} |\n`;
    }
    if (modified.length > 100) {
      md += `| … | +${modified.length - 100} more modified |\n`;
    }
    md += "\n</details>\n\n";
  }
  return md;
}

function renderImpact(impacted) {
  if (!impacted.length) return "";
  let md = "<details><summary>Downstream impact (depth ≤ 5)</summary>\n\n";
  md += "| ID | Depth | Path |\n|---|---:|---|\n";
  for (const i of impacted.slice(0, 100)) {
    const path = Array.isArray(i.reason) ? i.reason.join(" → ") : "";
    md += `| \`${escapeMd(i.id)}\` | ${Number(i.depth) || 0} | ${escapeMd(path)} |\n`;
  }
  if (impacted.length > 100) {
    md += `| … | | +${impacted.length - 100} more |\n`;
  }
  md += "\n</details>\n\n";
  return md;
}

function renderArtifactLink(args) {
  if (!args.repo || !args.run) return "";
  return (
    `> 📎 Full HTML dashboard attached as workflow artifact ` +
    `\`rivet-delta-pr-${args.pr}\` — ` +
    `[download from the workflow run](https://github.com/${args.repo}/actions/runs/${args.run}).\n\n`
  );
}

// ── Entry point ─────────────────────────────────────────────────────────
function main() {
  const args = parseArgs(argv);
  const diff = loadJson(args.diff, null);
  const impact = loadJson(args.impact, null);

  let md = `${MARKER}\n\n## 📐 Rivet artifact delta\n\n`;

  if (!diff) {
    md +=
      "> ⚠️ Diff could not be computed (base or head failed to parse). " +
      "See the workflow logs for details — this is informational and does " +
      "not block merge.\n";
    stdout.write(md);
    return;
  }

  const n = normalize(diff, impact);
  const total = n.added.length + n.removed.length + n.modified.length;

  if (total === 0) {
    md +=
      "_No artifact changes in this PR._ Code-only changes (renderer, " +
      "CLI wiring, tests) don't touch the artifact graph.\n";
    stdout.write(md);
    return;
  }

  md += renderCountsTable(n);
  md += "\n";

  const { md: graph, truncated, total: nodeCount } = renderMermaid(n);
  if (graph) {
    md += "### Graph\n\n";
    md += graph;
    if (truncated) {
      md += `\n_Showing first ${MERMAID_NODE_CAP} of ${nodeCount} changed artifacts; full list below._\n\n`;
    }
  }

  md += renderChangeList(n);
  md += renderImpact(n.impacted);
  md += renderArtifactLink(args);

  md +=
    "\n<sub>Posted by `rivet-delta` workflow. The graph shows only changed " +
    "artifacts; open the HTML dashboard (above) for full context.</sub>\n";

  stdout.write(md);
}

main();

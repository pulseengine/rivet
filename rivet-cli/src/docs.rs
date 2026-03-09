//! `rivet docs` — built-in searchable documentation.
//!
//! All documentation is embedded in the binary. Topics are searchable
//! via `rivet docs --grep <pattern>` (like a built-in rg).

use rivet_core::embedded;

// ── Topic registry ──────────────────────────────────────────────────────

struct DocTopic {
    slug: &'static str,
    title: &'static str,
    category: &'static str,
    content: &'static str,
}

const TOPICS: &[DocTopic] = &[
    DocTopic {
        slug: "artifact-format",
        title: "YAML artifact file format",
        category: "Reference",
        content: ARTIFACT_FORMAT_DOC,
    },
    DocTopic {
        slug: "rivet-yaml",
        title: "rivet.yaml configuration reference",
        category: "Reference",
        content: RIVET_YAML_DOC,
    },
    DocTopic {
        slug: "cli",
        title: "CLI command reference",
        category: "Reference",
        content: CLI_DOC,
    },
    DocTopic {
        slug: "json-output",
        title: "JSON output format and jq examples",
        category: "Reference",
        content: JSON_DOC,
    },
    DocTopic {
        slug: "schema/common",
        title: "Common base fields and link types",
        category: "Schemas",
        content: embedded::SCHEMA_COMMON,
    },
    DocTopic {
        slug: "schema/dev",
        title: "Development tracking schema (requirement, design-decision, feature)",
        category: "Schemas",
        content: embedded::SCHEMA_DEV,
    },
    DocTopic {
        slug: "schema/stpa",
        title: "STPA safety analysis schema (10 types)",
        category: "Schemas",
        content: embedded::SCHEMA_STPA,
    },
    DocTopic {
        slug: "schema/aspice",
        title: "Automotive SPICE schema (14 types, ASPICE 4.0)",
        category: "Schemas",
        content: embedded::SCHEMA_ASPICE,
    },
    DocTopic {
        slug: "schema/cybersecurity",
        title: "Cybersecurity schema (SEC.1-4, 10 types)",
        category: "Schemas",
        content: embedded::SCHEMA_CYBERSECURITY,
    },
    DocTopic {
        slug: "schema/aadl",
        title: "AADL architecture schema (spar integration)",
        category: "Schemas",
        content: embedded::SCHEMA_AADL,
    },
];

// ── Embedded documentation ──────────────────────────────────────────────

const ARTIFACT_FORMAT_DOC: &str = r#"# Artifact YAML Format

Artifacts are stored in YAML files under the `artifacts/` directory.
Each file contains an `artifacts:` key with a list of artifact objects.

## Structure

```yaml
artifacts:
  - id: REQ-001            # Unique identifier (required)
    type: requirement       # Artifact type from schema (required)
    title: Short title      # Human-readable title (required)
    status: draft           # Lifecycle status (optional)
    description: >          # Detailed description (optional, supports markdown)
      Multi-line description here.
    tags: [safety, core]    # Categorization tags (optional)
    links:                  # Traceability links (optional)
      - type: satisfies     # Link type from schema
        target: FEAT-001    # Target artifact ID
    fields:                 # Type-specific fields (defined by schema)
      priority: must
      category: functional
```

## ID Conventions

- Use uppercase prefix + number: `REQ-001`, `DD-002`, `FEAT-003`
- Prefix typically matches the artifact type abbreviation
- IDs must be unique across all artifact files in the project

## Multiple Files

Split artifacts across files by domain or lifecycle phase:
- `artifacts/requirements.yaml`
- `artifacts/architecture.yaml`
- `artifacts/verification.yaml`

All files under configured source paths are loaded and merged.

## Field Types

| Type       | Description                     | Example              |
|------------|---------------------------------|----------------------|
| string     | Single-line text                | `priority: must`     |
| text       | Multi-line text (use `>`)       | `description: >`     |
| number     | Numeric value                   | `latency-ms: 50`     |
| boolean    | True/false                      | `safety-relevant: true` |
| structured | Nested YAML object              | `properties: {}`     |
| enum       | One of allowed values           | `status: approved`   |
| list       | YAML list                       | `tags: [a, b]`       |

## Link Types

Links express traceability relationships between artifacts:

| Link Type      | Inverse        | Use Case                           |
|----------------|----------------|------------------------------------|
| satisfies      | satisfied-by   | Feature satisfies a requirement    |
| derives-from   | derived-into   | SW req derives from system req     |
| verifies       | verified-by    | Test verifies a requirement        |
| implements     | implemented-by | Decision implements a requirement  |
| allocated-to   | allocated-from | Req allocated to arch component    |
| traces-to      | traced-from    | General traceability               |
| mitigates      | mitigated-by   | Control mitigates a hazard         |
| constrained-by | constrains     | Action constrained by constraint   |
"#;

const RIVET_YAML_DOC: &str = r#"# rivet.yaml Configuration

The `rivet.yaml` file defines the project configuration.

## Structure

```yaml
project:
  name: my-project          # Project name
  version: "0.1.0"          # Version string
  schemas:                  # Schemas to load (merged in order)
    - common                # Always include — base fields, link types
    - dev                   # Development tracking types
    # - aspice              # ASPICE V-model types
    # - stpa                # STPA safety analysis types
    # - cybersecurity       # ISO 21434 types
    # - aadl                # AADL architecture types

sources:                    # Artifact sources
  - path: artifacts         # Directory or file path
    format: generic-yaml    # Adapter: generic-yaml, stpa-yaml, aadl, reqif
    # config:               # Adapter-specific config (optional)
    #   key: value

docs:                       # Documentation directories (for [[ID]] scanning)
  - docs

results: results            # Test results directory (JUnit XML, LCOV)
```

## Available Schemas

| Name           | Types | Description                        |
|----------------|-------|------------------------------------|
| common         | 0     | Base fields, 8 link types          |
| dev            | 3     | requirement, design-decision, feature |
| stpa           | 10    | STPA losses through scenarios      |
| aspice         | 14    | ASPICE 4.0 SYS.1-5, SWE.1-6       |
| cybersecurity  | 10    | SEC.1-4, TARA, ISO 21434           |
| aadl           | 3     | AADL components, analysis, flows   |

## Available Adapters

| Format       | Description                         |
|--------------|-------------------------------------|
| generic-yaml | Canonical YAML artifact files       |
| stpa-yaml    | Meld STPA safety analysis YAML      |
| aadl         | AADL files via spar (library)       |
| reqif        | ReqIF 1.2 XML import/export         |
"#;

const CLI_DOC: &str = r#"# CLI Command Reference

## Project Commands

```
rivet validate              Validate all artifacts against schemas
rivet list [-t TYPE]        List artifacts (filter by type/status)
rivet stats                 Summary statistics and orphan detection
rivet coverage              Traceability coverage report
rivet matrix --from X --to Y  Traceability matrix between types
rivet diff                  Compare artifact versions
rivet export -f FORMAT      Export to reqif or generic-yaml
rivet serve [-P PORT]       Start HTMX dashboard (default: 3000)
```

## Schema Commands

```
rivet schema list           List all artifact types
rivet schema show TYPE      Show type details with example YAML
rivet schema links          List all link types with inverses
rivet schema rules          List all traceability rules
```

## Documentation Commands

```
rivet docs                  List available documentation topics
rivet docs TOPIC            Show a specific topic
rivet docs --grep PATTERN   Search across all documentation
```

## Scaffolding

```
rivet init                  Initialize a new project (dev preset)
rivet init --preset aspice  Initialize with ASPICE schema + examples
rivet context               Generate .rivet/agent-context.md
```

## Global Flags

```
-p, --project PATH   Project directory (default: .)
    --schemas PATH   Schemas directory override
-v, --verbose        Increase verbosity (-v info, -vv debug)
```

## JSON Output

Most commands support `--format json` for machine-readable output:

```
rivet schema list --format json
rivet schema show sw-req --format json
rivet validate --format json
rivet list --format json
rivet stats --format json
rivet coverage --format json
rivet docs --grep PATTERN --format json
```
"#;

const JSON_DOC: &str = r#"# JSON Output Format & jq Examples

All `--format json` output follows a consistent envelope:

```json
{
  "command": "command-name",
  "data": { ... }
}
```

## jq Recipes

### List all artifact type names
```bash
rivet schema list --format json | jq -r '.artifact_types[].name'
```

### Show fields for a specific type
```bash
rivet schema show sw-req --format json | jq '.artifact_type.fields[]'
```

### Get required fields only
```bash
rivet schema show sw-req --format json | jq '[.artifact_type.fields[] | select(.required)]'
```

### List all link types and inverses
```bash
rivet schema links --format json | jq -r '.link_types[] | "\(.name) <-> \(.inverse // "none")"'
```

### Get validation errors only
```bash
rivet validate --format json | jq '[.diagnostics[] | select(.severity == "error")]'
```

### Count artifacts by type
```bash
rivet stats --format json | jq '.types'
```

### List artifacts of a specific type
```bash
rivet list -t requirement --format json | jq -r '.artifacts[].id'
```

### Get uncovered artifacts from coverage
```bash
rivet coverage --format json | jq '[.entries[] | select(.uncovered_ids | length > 0)]'
```

### Search docs and get matching lines
```bash
rivet docs --grep "verification" --format json | jq -r '.matches[] | "\(.topic):\(.line): \(.text)"'
```

### Generate a type reference table
```bash
rivet schema list --format json | jq -r '.artifact_types[] | [.name, .description] | @tsv'
```

### Check if validation passes
```bash
rivet validate --format json | jq -e '.errors == 0' > /dev/null && echo "PASS" || echo "FAIL"
```
"#;

// ── Public API ──────────────────────────────────────────────────────────

/// List all available documentation topics.
pub fn list_topics(format: &str) -> String {
    if format == "json" {
        let items: Vec<serde_json::Value> = TOPICS
            .iter()
            .map(|t| {
                serde_json::json!({
                    "slug": t.slug,
                    "title": t.title,
                    "category": t.category,
                })
            })
            .collect();
        return serde_json::to_string_pretty(&serde_json::json!({
            "command": "docs-list",
            "topics": items,
        }))
        .unwrap_or_default();
    }

    let mut out = String::new();
    out.push_str("Available documentation topics:\n\n");

    let mut current_cat = "";
    for t in TOPICS {
        if t.category != current_cat {
            if !current_cat.is_empty() {
                out.push('\n');
            }
            out.push_str(&format!("  {}\n", t.category));
            current_cat = t.category;
        }
        out.push_str(&format!("    {:<24} {}\n", t.slug, t.title));
    }

    out.push_str("\nUsage:\n");
    out.push_str("  rivet docs <topic>          Show a topic\n");
    out.push_str("  rivet docs --grep <pat>     Search across all docs\n");
    out.push_str("  rivet docs <topic> -f json  Machine-readable output\n");
    out
}

/// Show a specific topic.
pub fn show_topic(slug: &str, format: &str) -> String {
    let Some(topic) = TOPICS.iter().find(|t| t.slug == slug) else {
        let mut out = format!("Unknown topic: {slug}\n\nAvailable topics:\n");
        for t in TOPICS {
            out.push_str(&format!("  {:<24} {}\n", t.slug, t.title));
        }
        return out;
    };

    if format == "json" {
        return serde_json::to_string_pretty(&serde_json::json!({
            "command": "docs-show",
            "topic": topic.slug,
            "title": topic.title,
            "category": topic.category,
            "content": topic.content,
        }))
        .unwrap_or_default();
    }

    let mut out = String::new();
    out.push_str(&format!("# {} — {}\n\n", topic.slug, topic.title));
    out.push_str(topic.content);
    out
}

/// Search across all documentation for a pattern (like rg).
pub fn grep_docs(pattern: &str, format: &str, context: usize) -> String {
    let pattern_lower = pattern.to_lowercase();

    let mut all_matches: Vec<GrepMatch> = Vec::new();

    for topic in TOPICS {
        for (i, line) in topic.content.lines().enumerate() {
            if line.to_lowercase().contains(&pattern_lower) {
                let lines: Vec<&str> = topic.content.lines().collect();
                let start = i.saturating_sub(context);
                let end = (i + context + 1).min(lines.len());
                let context_before: Vec<String> =
                    lines[start..i].iter().map(|l| l.to_string()).collect();
                let context_after: Vec<String> =
                    lines[(i + 1)..end].iter().map(|l| l.to_string()).collect();

                all_matches.push(GrepMatch {
                    topic: topic.slug,
                    line_num: i + 1,
                    text: line.to_string(),
                    context_before,
                    context_after,
                });
            }
        }
    }

    if format == "json" {
        let items: Vec<serde_json::Value> = all_matches
            .iter()
            .map(|m| {
                serde_json::json!({
                    "topic": m.topic,
                    "line": m.line_num,
                    "text": m.text,
                    "context_before": m.context_before,
                    "context_after": m.context_after,
                })
            })
            .collect();
        return serde_json::to_string_pretty(&serde_json::json!({
            "command": "docs-grep",
            "pattern": pattern,
            "match_count": items.len(),
            "matches": items,
        }))
        .unwrap_or_default();
    }

    if all_matches.is_empty() {
        return format!("No matches for: {pattern}\n");
    }

    let mut out = String::new();
    let mut prev_topic = "";
    for m in &all_matches {
        if m.topic != prev_topic {
            if !prev_topic.is_empty() {
                out.push_str("--\n");
            }
            prev_topic = m.topic;
        }
        for (j, cl) in m.context_before.iter().enumerate() {
            let ln = m.line_num - m.context_before.len() + j;
            out.push_str(&format!("{}:{}: {}\n", m.topic, ln, cl));
        }
        out.push_str(&format!("{}:{}> {}\n", m.topic, m.line_num, m.text));
        for (j, cl) in m.context_after.iter().enumerate() {
            out.push_str(&format!("{}:{}: {}\n", m.topic, m.line_num + 1 + j, cl));
        }
    }
    out.push_str(&format!("\n{} matches across {} topics\n", all_matches.len(), {
        let mut topics: Vec<&str> = all_matches.iter().map(|m| m.topic).collect();
        topics.dedup();
        topics.len()
    }));
    out
}

struct GrepMatch {
    topic: &'static str,
    line_num: usize,
    text: String,
    context_before: Vec<String>,
    context_after: Vec<String>,
}

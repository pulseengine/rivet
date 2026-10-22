# rivet-yaml

rivet's own YAML stack: a lossless concrete syntax tree, a serde
deserializer over it, a `Value` model, and an emitter that follows libyaml's
scalar-style rules. It replaced `serde_yaml`, which was archived upstream
(RUSTSEC-2024-0449), and it reads every artifact file rivet loads.

## Depending on it

`rivet-yaml` is not on crates.io yet: publishing is blocked on the upstream
`rowan` crate being Miri-clean (#1099). Depend on it as a git dependency at a
release tag:

```toml
[dependencies]
rivet-yaml = { git = "https://github.com/pulseengine/rivet", tag = "v0.41.0" }
```

```rust
let value: rivet_yaml::Value = rivet_yaml::from_str("a: 1\nb: [x, y]\n")?;
let text = rivet_yaml::to_string(&value)?;
```

The API mirrors `serde_yaml` 0.9.34 (`from_str`, `to_string`, `Value`,
`Mapping`, `Number`), so moving a call site over is a path rename.

## Supported subset

`from_str` reads exactly one YAML document. What it does with the rest of
YAML 1.2:

| Construct | Behavior |
|---|---|
| Block and flow mappings and sequences | read |
| Plain, single-quoted and double-quoted scalars | read |
| Block scalars (`\|` and `>`, with chomping and indent indicators) | read |
| Anchors and aliases (`&a`, `*a`) | expanded in place, under a copy cap of 1,000,000 nodes; a document that would expand past it is an error |
| Tags (`!t`, `!!str`) | refused with a line and column |
| Complex keys (`? [a]`) | refused |
| Multi-document streams (`---` after content) | refused, not silently truncated |
| Merge keys (`<<: *base`) | not expanded: `<<` is read as an ordinary key. `Value::apply_merge` does the YAML 1.1 merge when a caller wants it |

Refusal is deliberate: an input the parser cannot represent faithfully is an
error, never a quietly different value.

The emitter (`to_string`) follows libyaml's scalar-style rules with
`serde_yaml`'s settings, so the files rivet writes are unchanged by the
migration.

## The oracle

The parser is checked against the official
[yaml-test-suite](https://github.com/yaml/yaml-test-suite), pinned at commit
`6e6c296ae9c9d2d5c4134b4b64d01b29ac19ff6f` (`data-2022-01-17`). CI checks it
out and `tests/yaml_test_suite.rs` runs it. Of its 402 cases (a case with no expected JSON is in none of the counts
below):

* 134 read exactly as the suite says;
* 122 valid cases are refused (the table above);
* 0 read silently wrong, which is the gate: a case the parser accepts must
  read as the suite says;
* of the cases that are invalid YAML, 53 are rejected and 41 are still
  accepted (a recorded ratchet that may only fall);
* 23 are multi-document (or empty) streams, none of which is ever read as one
  document.

## Non-Rust consumers

A Python or Node repo cannot link the crate. The `rivet` binary prints any
YAML file as JSON through this parser, in any directory, with no
`rivet.yaml` needed:

```sh
rivet yaml to-json config.yml            # pretty-printed
rivet yaml to-json --compact config.yml  # one line
some-generator | rivet yaml to-json -    # stdin
```

* Mapping order is the document's order.
* Integer, float and bool mapping keys become their YAML text (`1`, `true`).
  A null or collection key is an error, as are NaN and infinities.
* A parse error or refused construct exits 1 with `file:line:column: message`
  on stderr and nothing on stdout.

```python
import json, subprocess
def load_yaml(path):
    out = subprocess.run(["rivet", "yaml", "to-json", path],
                         capture_output=True, text=True, check=True)
    return json.loads(out.stdout)
```

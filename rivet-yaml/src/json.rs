//! Print a parsed [`Value`] as JSON (REQ-408, #1094).
//!
//! Non-Rust consumers (Python, Node) cannot link this crate, so the `rivet
//! yaml to-json` command parses with `rivet_yaml` and prints through this
//! module. The writer is hand-written because `serde_json::Map` only keeps
//! document order under the `preserve_order` feature, which is workspace-wide
//! and would reorder other crates' output. Mapping order is the document's.
//!
//! Policy, so no input is silently misread:
//! * a string key is emitted as is; an integer, float or bool key is emitted
//!   as its YAML text (`1`, `true`);
//! * a null, sequence, mapping or tagged key is an error;
//! * NaN and infinities are an error (JSON cannot represent them);
//! * a tagged value is an error.

use std::fmt::{self, Write as _};

use crate::{Number, Value};

/// Why a [`Value`] could not be printed as JSON.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct JsonError {
    /// Where in the document, e.g. `$.a.b[2]`; `$` is the root.
    pub path: String,
    /// What was refused.
    pub message: String,
}

impl fmt::Display for JsonError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{} (at {})", self.message, self.path)
    }
}

impl std::error::Error for JsonError {}

fn err<T>(path: &str, message: impl Into<String>) -> Result<T, JsonError> {
    Err(JsonError {
        path: path.to_string(),
        message: message.into(),
    })
}

/// Render `value` as JSON text. `pretty` indents two spaces per level.
pub fn to_json(value: &Value, pretty: bool) -> Result<String, JsonError> {
    let mut out = String::new();
    write_value(&mut out, value, pretty, 0, "$")?;
    Ok(out)
}

fn newline(out: &mut String, pretty: bool, depth: usize) {
    if pretty {
        out.push('\n');
        for _ in 0..depth {
            out.push_str("  ");
        }
    }
}

fn write_value(
    out: &mut String,
    value: &Value,
    pretty: bool,
    depth: usize,
    path: &str,
) -> Result<(), JsonError> {
    match value {
        Value::Null => out.push_str("null"),
        Value::Bool(b) => out.push_str(if *b { "true" } else { "false" }),
        Value::Number(n) => out.push_str(&number_text(n, path)?),
        Value::String(s) => write_string(out, s),
        Value::Sequence(seq) => {
            if seq.is_empty() {
                out.push_str("[]");
                return Ok(());
            }
            out.push('[');
            for (i, item) in seq.iter().enumerate() {
                if i > 0 {
                    out.push(',');
                }
                newline(out, pretty, depth.saturating_add(1));
                write_value(
                    out,
                    item,
                    pretty,
                    depth.saturating_add(1),
                    &format!("{path}[{i}]"),
                )?;
            }
            newline(out, pretty, depth);
            out.push(']');
        }
        Value::Mapping(map) => {
            if map.is_empty() {
                out.push_str("{}");
                return Ok(());
            }
            out.push('{');
            for (i, (k, v)) in map.iter().enumerate() {
                if i > 0 {
                    out.push(',');
                }
                newline(out, pretty, depth.saturating_add(1));
                let key = key_text(k, path, i)?;
                write_string(out, &key);
                out.push(':');
                if pretty {
                    out.push(' ');
                }
                write_value(
                    out,
                    v,
                    pretty,
                    depth.saturating_add(1),
                    &format!("{path}.{key}"),
                )?;
            }
            newline(out, pretty, depth);
            out.push('}');
        }
        Value::Tagged(_) => return err(path, "tagged value is not supported"),
    }
    Ok(())
}

/// The JSON object key for a YAML mapping key, or the reason there is none.
fn key_text(key: &Value, path: &str, index: usize) -> Result<String, JsonError> {
    let n = index.saturating_add(1);
    match key {
        Value::String(s) => Ok(s.clone()),
        Value::Bool(b) => Ok(b.to_string()),
        Value::Number(num) => number_text(num, path),
        Value::Null => err(path, format!("mapping key #{n} is null")),
        Value::Sequence(_) => err(path, format!("mapping key #{n} is a sequence")),
        Value::Mapping(_) => err(path, format!("mapping key #{n} is a mapping")),
        Value::Tagged(_) => err(path, format!("mapping key #{n} is tagged")),
    }
}

fn number_text(n: &Number, path: &str) -> Result<String, JsonError> {
    if n.is_nan() || n.is_infinite() {
        return err(path, "NaN and infinity cannot be represented in JSON");
    }
    if let Some(u) = n.as_u64() {
        return Ok(u.to_string());
    }
    if let Some(i) = n.as_i64() {
        return Ok(i.to_string());
    }
    match n.as_f64() {
        Some(f) => {
            let mut buf = ryu::Buffer::new();
            Ok(buf.format_finite(f).to_string())
        }
        None => err(path, "number out of range"),
    }
}

fn write_string(out: &mut String, s: &str) {
    out.push('"');
    for c in s.chars() {
        match c {
            '"' => out.push_str("\\\""),
            '\\' => out.push_str("\\\\"),
            '\n' => out.push_str("\\n"),
            '\r' => out.push_str("\\r"),
            '\t' => out.push_str("\\t"),
            c if u32::from(c) < 0x20 => {
                let _ = write!(out, "\\u{:04x}", u32::from(c));
            }
            c => out.push(c),
        }
    }
    out.push('"');
}

#[cfg(test)]
#[allow(
    clippy::expect_used,
    clippy::unwrap_used,
    reason = "test code: a failure should panic with a clear message"
)]
mod tests {
    use super::*;

    fn parse(s: &str) -> Value {
        crate::from_str(s).expect("valid yaml")
    }

    #[test]
    fn pretty_keeps_document_order() {
        let v = parse("z: 1\na: [x, y]\nm: {}\ne: []\n");
        assert_eq!(
            to_json(&v, true).expect("json"),
            "{\n  \"z\": 1,\n  \"a\": [\n    \"x\",\n    \"y\"\n  ],\n  \"m\": {},\n  \"e\": []\n}"
        );
    }

    #[test]
    fn compact_has_no_whitespace() {
        let v = parse("z: 1\na: [x, true, null, 1.5]\n");
        assert_eq!(
            to_json(&v, false).expect("json"),
            r#"{"z":1,"a":["x",true,null,1.5]}"#
        );
    }

    #[test]
    fn scalar_keys_become_their_yaml_text() {
        let v = parse("1: a\ntrue: b\n2.5: c\n-3: d\n");
        assert_eq!(
            to_json(&v, false).expect("json"),
            r#"{"1":"a","true":"b","2.5":"c","-3":"d"}"#
        );
    }

    #[test]
    fn null_and_collection_keys_are_errors() {
        let e = to_json(&parse("~: a\n"), false).expect_err("null key");
        assert_eq!(e.message, "mapping key #1 is null");
        assert_eq!(e.path, "$");
        let mut m = crate::Mapping::new();
        m.insert(Value::Sequence(vec![Value::Null]), Value::Null);
        let e = to_json(&Value::Mapping(m), false).expect_err("seq key");
        assert_eq!(e.message, "mapping key #1 is a sequence");
        let mut m = crate::Mapping::new();
        m.insert(Value::Mapping(crate::Mapping::new()), Value::Null);
        let e = to_json(&Value::Mapping(m), false).expect_err("map key");
        assert_eq!(e.message, "mapping key #1 is a mapping");
    }

    #[test]
    fn non_finite_floats_are_errors_with_a_path() {
        for src in ["a: [1, .nan]\n", "a: .inf\n", "a: -.inf\n"] {
            let e = to_json(&parse(src), false).expect_err("non-finite");
            assert_eq!(e.message, "NaN and infinity cannot be represented in JSON");
            assert!(e.path.starts_with("$.a"), "{e}");
        }
        let e = to_json(&parse("a: [1, .nan]\n"), false).expect_err("nan");
        assert_eq!(e.path, "$.a[1]");
    }

    #[test]
    fn strings_are_escaped() {
        let v = parse("a: \"q\\\"b\\\\\\n\\t\\u0001é\"\n");
        assert_eq!(
            to_json(&v, false).expect("json"),
            "{\"a\":\"q\\\"b\\\\\\n\\t\\u0001é\"}"
        );
    }

    #[test]
    fn integers_keep_full_precision() {
        let v = parse("a: 18446744073709551615\nb: -9223372036854775808\nc: 1e3\n");
        assert_eq!(
            to_json(&v, false).expect("json"),
            r#"{"a":18446744073709551615,"b":-9223372036854775808,"c":1000.0}"#
        );
    }

    #[test]
    fn write_string_keeps_space_literal() {
        // 0x20 is not a control character: only < 0x20 is escaped, so a
        // space must survive as itself (a `<=` here would emit \u0020).
        let mut out = String::new();
        write_string(&mut out, "a b\u{1}c");
        assert_eq!(out, "\"a b\\u0001c\"");
    }

    #[test]
    fn json_error_display_names_message_and_path() {
        let e = to_json(&parse("~: a\n"), false).expect_err("null key");
        assert_eq!(e.to_string(), "mapping key #1 is null (at $)");
    }
}

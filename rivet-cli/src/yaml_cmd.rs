//! `rivet yaml to-json` (REQ-408, #1094): print a YAML file as JSON through
//! rivet's own parser, for tools that cannot link `rivet-yaml`.

use std::io::Read as _;
use std::path::Path;

use anyhow::{Context, Result};

/// Read `file` (`-` is stdin), parse it with `rivet_yaml`, print JSON.
///
/// Returns `Ok(false)` after writing `file:line:column: message` to stderr on
/// a parse error or refused construct; nothing is written to stdout then.
pub(crate) fn cmd_yaml_to_json(file: &Path, compact: bool) -> Result<bool> {
    let (text, name) = if file.as_os_str() == "-" {
        let mut s = String::new();
        std::io::stdin()
            .read_to_string(&mut s)
            .context("reading stdin")?;
        (s, "<stdin>".to_string())
    } else {
        let s = std::fs::read_to_string(file)
            .with_context(|| format!("reading '{}'", file.display()))?;
        (s, file.display().to_string())
    };
    match convert(&text, &name, compact) {
        Ok(json) => {
            println!("{json}");
            Ok(true)
        }
        Err(msg) => {
            eprintln!("{msg}");
            Ok(false)
        }
    }
}

/// YAML text to JSON text, or the full `name:line:column: message` line.
pub(crate) fn convert(text: &str, name: &str, compact: bool) -> Result<String, String> {
    let value: rivet_yaml::Value = rivet_yaml::from_str(text).map_err(|e| match e.location() {
        Some(loc) => format!(
            "{name}:{}:{}: {}",
            loc.line,
            loc.column,
            e.message_without_location()
        ),
        None => format!("{name}: {e}"),
    })?;
    rivet_yaml::json::to_json(&value, !compact).map_err(|e| format!("{name}: {e}"))
}

#[cfg(test)]
mod tests {
    use super::convert;

    #[test]
    fn valid_document_converts() {
        assert_eq!(
            convert("b: 1\na: x\n", "f", true).expect("json"),
            r#"{"b":1,"a":"x"}"#
        );
    }

    #[test]
    fn tag_is_refused_with_a_position() {
        let e = convert("a: 1\nb: !t x\n", "f.yaml", true).expect_err("tag");
        assert!(e.starts_with("f.yaml:2:"), "{e}");
    }

    #[test]
    fn json_error_names_the_file_and_path() {
        let e = convert("a: .nan\n", "f.yaml", true).expect_err("nan");
        assert_eq!(
            e,
            "f.yaml: NaN and infinity cannot be represented in JSON (at $.a)"
        );
    }
}

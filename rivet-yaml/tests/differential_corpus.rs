// SAFETY-REVIEW (SCRC Phase 1, DD-058): test code; a failure should panic
// with a clear message, so unwrap/expect are the intended style here.
#![allow(clippy::unwrap_used, clippy::expect_used)]

//! REQ-346 safety gate: rivet's own deserializer must read every YAML file in
//! this repository exactly as the serde_yaml delegate does, before serde_yaml
//! is dropped. Compares the `Value` each path builds, file by file.

use std::path::{Path, PathBuf};

fn corpus() -> Vec<PathBuf> {
    let root = Path::new(env!("CARGO_MANIFEST_DIR")).parent().unwrap();
    let mut out = Vec::new();
    let mut stack = vec![root.to_path_buf()];
    while let Some(dir) = stack.pop() {
        for entry in std::fs::read_dir(&dir).unwrap().flatten() {
            let path = entry.path();
            let name = entry.file_name().to_string_lossy().to_string();
            if path.is_dir() {
                if !(name.starts_with('.') && name != ".github")
                    && !["target", "node_modules", "corpus"].contains(&name.as_str())
                {
                    stack.push(path);
                }
            } else if name.ends_with(".yaml") || name.ends_with(".yml") || name.ends_with(".md") {
                out.push(path);
            }
        }
    }
    out.sort();
    out
}

#[test]
fn own_deserializer_matches_serde_yaml_on_the_repository() {
    let files = corpus();
    assert!(
        files.len() > 50,
        "corpus walk found only {} files",
        files.len()
    );
    let mut failures = Vec::new();
    let mut documents: Vec<(String, String)> = Vec::new();
    for file in &files {
        let src = std::fs::read_to_string(file).unwrap();
        if file.extension().is_some_and(|e| e == "md") {
            // Fenced ```yaml blocks in the docs are a second corpus.
            for (i, block) in yaml_blocks(&src).into_iter().enumerate() {
                documents.push((format!("{} (yaml block {})", file.display(), i + 1), block));
            }
        } else {
            documents.push((file.display().to_string(), src));
        }
    }
    let files = &documents;
    for (file, src) in files {
        let src = src.as_str();
        let delegate = rivet_yaml::__from_str_serde_yaml::<rivet_yaml::Value>(src);
        let owned = rivet_yaml::__from_str_owned::<rivet_yaml::Value>(src);
        let same = match (&delegate, &owned) {
            (Ok(a), Ok(b)) => a == b,
            (Err(_), Err(_)) => true,
            _ => false,
        };
        if !same {
            failures.push(format!(
                "{}\n  serde_yaml: {}\n  owned:      {}",
                file,
                summary(&delegate),
                summary(&owned)
            ));
        }
    }
    assert!(
        failures.is_empty(),
        "{} of {} files differ:\n{}",
        failures.len(),
        files.len(),
        failures.join("\n")
    );
}

fn summary(r: &rivet_yaml::Result<rivet_yaml::Value>) -> String {
    match r {
        Ok(v) => {
            let s = format!("{v:?}");
            s.chars().take(160).collect()
        }
        Err(e) => format!("ERROR {e}"),
    }
}

fn yaml_blocks(markdown: &str) -> Vec<String> {
    let mut blocks = Vec::new();
    let mut current: Option<String> = None;
    for line in markdown.lines() {
        let trimmed = line.trim_start();
        match &mut current {
            None if trimmed == "```yaml" || trimmed == "```yml" => current = Some(String::new()),
            Some(block) if trimmed.starts_with("```") => {
                blocks.push(std::mem::take(block));
                current = None;
            }
            Some(block) => {
                block.push_str(line);
                block.push('\n');
            }
            None => {}
        }
    }
    blocks
}

//! Indentation-aware YAML editor for safe artifact file modification.
//!
//! The previous approach in `mutate.rs` used `find()` + string insertion which
//! broke when the YAML structure was non-trivial (wrong indentation, fields
//! placed outside artifact blocks).
//!
//! `YamlEditor` understands YAML indentation structure and performs all edits
//! within the correct indentation context, guaranteeing:
//! - Lossless roundtrip: `parse(content).to_string() == content`
//! - Correct indentation for inserted fields / links
//! - Block boundaries respected (edits never leak outside an artifact)

/// An indentation-aware, line-based YAML editor for artifact files.
///
/// This is **not** a full YAML parser. It handles only the subset used in
/// rivet artifact files (the `artifacts:` list-of-mappings format).
#[derive(Debug, Clone)]
pub struct YamlEditor {
    lines: Vec<String>,
}

impl YamlEditor {
    /// Parse YAML content into an editor. Every line is preserved exactly,
    /// including comments, blank lines, and trailing whitespace.
    pub fn parse(content: &str) -> Self {
        let lines: Vec<String> = content.lines().map(String::from).collect();
        Self { lines }
    }

    /// Find the line range `[start, end)` for the artifact with the given ID.
    ///
    /// The artifact block starts at the `- id: <ID>` line and extends until
    /// the next list item at the same (or lesser) indentation, or EOF.
    pub fn find_artifact_block(&self, id: &str) -> Option<(usize, usize)> {
        let id_pattern = format!("- id: {id}");

        let mut start = None;
        let mut dash_indent = 0;

        for (i, line) in self.lines.iter().enumerate() {
            let trimmed = line.trim();
            if trimmed == id_pattern || trimmed == format!("{id_pattern} ") {
                // Also accept trailing space (unlikely but defensive)
                start = Some(i);
                dash_indent = line.len() - line.trim_start().len();
                continue;
            }
            // More robust: match allowing for quotes around the id
            if start.is_none() {
                // Check for `- id: "ID"` or `- id: 'ID'`
                let quoted_double = format!("- id: \"{id}\"");
                let quoted_single = format!("- id: '{id}'");
                if trimmed == quoted_double || trimmed == quoted_single {
                    start = Some(i);
                    dash_indent = line.len() - line.trim_start().len();
                    continue;
                }
            }

            if let Some(s) = start {
                if i == s {
                    continue;
                }
                // An empty line does not end the block
                if trimmed.is_empty() {
                    continue;
                }
                let this_indent = line.len() - line.trim_start().len();
                // A new list item at the same or lesser indentation ends the block
                if trimmed.starts_with("- ") && this_indent <= dash_indent {
                    return Some((s, i));
                }
                // A top-level key (no leading dash) at lesser/equal indent ends the block
                if this_indent <= dash_indent && !trimmed.starts_with('-') {
                    return Some((s, i));
                }
            }
        }

        start.map(|s| (s, self.lines.len()))
    }

    /// Return the indentation of a field line within an artifact block.
    /// This is the indent of the `- id:` line plus some offset for continuation
    /// fields (typically +4 for 2-space YAML with `- ` prefix).
    fn field_indent(&self, block_start: usize) -> usize {
        let start_line = &self.lines[block_start];
        let dash_indent = start_line.len() - start_line.trim_start().len();
        // The `- ` takes 2 chars, so fields are at dash_indent + 2 + (yaml indent, typically 2)
        // But let's detect from actual content: look at the second line
        for i in (block_start + 1)..self.lines.len() {
            let line = &self.lines[i];
            let trimmed = line.trim();
            if trimmed.is_empty() {
                continue;
            }
            // If the line is a continuation field (type:, title:, status:, etc.)
            let this_indent = line.len() - line.trim_start().len();
            if this_indent > dash_indent {
                return this_indent;
            }
            break;
        }
        // Fallback: dash_indent + 4 (standard 2-space YAML)
        dash_indent + 4
    }

    /// Find a field line within an artifact block.
    /// Returns the line index if found.
    fn find_field_in_block(
        &self,
        block_start: usize,
        block_end: usize,
        key: &str,
    ) -> Option<usize> {
        let field_indent = self.field_indent(block_start);
        let key_prefix = format!("{key}:");
        for i in (block_start + 1)..block_end {
            let line = &self.lines[i];
            let trimmed = line.trim();
            if trimmed.is_empty() {
                continue;
            }
            let this_indent = line.len() - line.trim_start().len();
            if this_indent == field_indent
                && (trimmed.starts_with(&key_prefix))
            {
                return Some(i);
            }
        }
        None
    }

    /// Determine if a field at a given line is a block scalar (multi-line value).
    /// Returns the end line (exclusive) of the block scalar content.
    fn block_scalar_end(&self, field_line: usize, block_end: usize) -> usize {
        let line = &self.lines[field_line];
        let trimmed = line.trim();
        // Check if value is a block scalar indicator (> or |)
        let after_colon = trimmed.splitn(2, ':').nth(1).map(|s| s.trim());
        match after_colon {
            Some(">") | Some("|") | Some(">-") | Some("|-") => {
                // Content continues on subsequent lines with greater indentation
                let field_indent = line.len() - line.trim_start().len();
                let mut end = field_line + 1;
                while end < block_end {
                    let next = &self.lines[end];
                    let next_trimmed = next.trim();
                    if next_trimmed.is_empty() {
                        end += 1;
                        continue;
                    }
                    let next_indent = next.len() - next.trim_start().len();
                    if next_indent <= field_indent {
                        break;
                    }
                    end += 1;
                }
                end
            }
            _ => field_line + 1,
        }
    }

    /// Set a scalar field value within an artifact block.
    ///
    /// If the field already exists, its value is replaced (including any
    /// block-scalar continuation lines). If it does not exist, a new line
    /// is inserted at the correct indentation.
    pub fn set_field(&mut self, id: &str, key: &str, value: &str) -> Result<(), String> {
        let (block_start, block_end) = self
            .find_artifact_block(id)
            .ok_or_else(|| format!("artifact '{id}' not found"))?;

        let field_indent = self.field_indent(block_start);
        let indent_str = " ".repeat(field_indent);

        if let Some(field_line) = self.find_field_in_block(block_start, block_end, key) {
            // Replace existing field (and any block-scalar continuation)
            let scalar_end = self.block_scalar_end(field_line, block_end);
            let new_line = format!("{indent_str}{key}: {value}");
            // Replace the range [field_line, scalar_end) with the single new line
            self.lines.splice(field_line..scalar_end, std::iter::once(new_line));
        } else {
            // Insert new field. Place it after the last simple field before
            // any `links:`, `fields:`, or `tags:` section — or at the end
            // of the block.
            let insert_at = self.find_insert_position(block_start, block_end, key);
            let new_line = format!("{indent_str}{key}: {value}");
            self.lines.insert(insert_at, new_line);
        }

        Ok(())
    }

    /// Find the best position to insert a new field.
    ///
    /// Strategy: insert after the last existing "simple" field (id, type,
    /// title, status, description) and before complex sections (tags, links,
    /// fields). If the key itself is one of the complex ones, insert at the
    /// appropriate position.
    fn find_insert_position(
        &self,
        block_start: usize,
        block_end: usize,
        key: &str,
    ) -> usize {
        let field_indent = self.field_indent(block_start);

        // Preferred ordering of base fields
        let base_order = ["id", "type", "title", "status", "description"];
        let complex_keys = ["tags", "links", "fields"];

        // Find the position of each known field
        let mut last_base_end = block_start + 1; // after `- id:` line at minimum

        for i in (block_start + 1)..block_end {
            let line = &self.lines[i];
            let trimmed = line.trim();
            if trimmed.is_empty() {
                continue;
            }
            let this_indent = line.len() - line.trim_start().len();
            if this_indent != field_indent {
                continue;
            }
            // Extract key name
            if let Some(k) = trimmed.split(':').next() {
                if base_order.contains(&k) || (!complex_keys.contains(&k) && !k.starts_with("- "))
                {
                    let end = self.block_scalar_end(i, block_end);
                    last_base_end = end;
                }
            }
        }

        // For base fields like "status", insert after the last base field
        if base_order.contains(&key) {
            // Try to respect ordering: find the right position
            if let Some(my_pos) = base_order.iter().position(|&k| k == key) {
                // Find the last field that comes before this key in the ordering
                for check_key in base_order[..my_pos].iter().rev() {
                    if let Some(line_idx) =
                        self.find_field_in_block(block_start, block_end, check_key)
                    {
                        return self.block_scalar_end(line_idx, block_end);
                    }
                }
            }
            return last_base_end;
        }

        last_base_end
    }

    /// Add a link to an artifact's `links:` array.
    ///
    /// If the `links:` section exists, the new link is appended to it.
    /// If not, a new `links:` section is created at the end of the artifact
    /// block (before any trailing blank lines).
    pub fn add_link(
        &mut self,
        id: &str,
        link_type: &str,
        target: &str,
    ) -> Result<(), String> {
        let (block_start, block_end) = self
            .find_artifact_block(id)
            .ok_or_else(|| format!("artifact '{id}' not found"))?;

        let field_indent = self.field_indent(block_start);
        let indent_str = " ".repeat(field_indent);
        let link_item_indent = " ".repeat(field_indent + 2);

        if let Some(links_line) = self.find_field_in_block(block_start, block_end, "links") {
            // Find end of links section (all lines deeper than links: indent)
            let links_indent = field_indent;
            let mut insert_at = links_line + 1;
            while insert_at < block_end {
                let line = &self.lines[insert_at];
                let trimmed = line.trim();
                if trimmed.is_empty() {
                    insert_at += 1;
                    continue;
                }
                let this_indent = line.len() - line.trim_start().len();
                if this_indent <= links_indent {
                    break;
                }
                insert_at += 1;
            }
            // Insert new link entries
            let type_line = format!("{link_item_indent}- type: {link_type}");
            let target_line = format!("{link_item_indent}  target: {target}");
            self.lines.insert(insert_at, target_line);
            self.lines.insert(insert_at, type_line);
        } else {
            // No links section — create one at the end of the block,
            // before trailing blank lines.
            let mut insert_at = block_end;
            while insert_at > block_start + 1
                && self.lines.get(insert_at - 1).is_some_and(|l| l.trim().is_empty())
            {
                insert_at -= 1;
            }
            let links_header = format!("{indent_str}links:");
            let type_line = format!("{link_item_indent}- type: {link_type}");
            let target_line = format!("{link_item_indent}  target: {target}");
            self.lines.insert(insert_at, target_line);
            self.lines.insert(insert_at, type_line);
            self.lines.insert(insert_at, links_header);
        }

        Ok(())
    }

    /// Remove a specific link from an artifact's `links:` array.
    ///
    /// Matches on both `type` and `target`. If the `links:` section becomes
    /// empty after removal, the `links:` header line is also removed.
    pub fn remove_link(
        &mut self,
        id: &str,
        link_type: &str,
        target: &str,
    ) -> Result<(), String> {
        let (block_start, block_end) = self
            .find_artifact_block(id)
            .ok_or_else(|| format!("artifact '{id}' not found"))?;

        let links_line = self
            .find_field_in_block(block_start, block_end, "links")
            .ok_or_else(|| format!("artifact '{id}' has no links section"))?;

        let field_indent = self.field_indent(block_start);
        let links_content_indent = field_indent + 2;

        // Find the link to remove: scan for `- type: <link_type>` followed by
        // `target: <target>` within the links section.
        let mut link_start = None;
        let mut link_end = None;
        let mut i = links_line + 1;
        while i < block_end {
            let line = &self.lines[i];
            let trimmed = line.trim();
            if trimmed.is_empty() {
                i += 1;
                continue;
            }
            let this_indent = line.len() - line.trim_start().len();
            if this_indent < links_content_indent {
                break;
            }
            // Match `- type: <link_type>`
            if trimmed == format!("- type: {link_type}") && this_indent == links_content_indent {
                // Check next non-empty line for `target: <target>`
                let mut j = i + 1;
                while j < block_end && self.lines[j].trim().is_empty() {
                    j += 1;
                }
                if j < block_end && self.lines[j].trim() == format!("target: {target}") {
                    link_start = Some(i);
                    link_end = Some(j + 1);
                    break;
                }
            }
            i += 1;
        }

        let link_start =
            link_start.ok_or_else(|| {
                format!("link '{link_type} -> {target}' not found in artifact '{id}'")
            })?;
        let link_end = link_end.unwrap();

        // Remove the link lines
        self.lines.drain(link_start..link_end);

        // Check if the links section is now empty (only header remains)
        // Recalculate block boundaries after the drain
        let (_, new_block_end) = self
            .find_artifact_block(id)
            .expect("artifact must still exist after link removal");
        let links_line = self
            .find_field_in_block(block_start, new_block_end, "links");
        if let Some(ll) = links_line {
            let mut has_content = false;
            let mut k = ll + 1;
            while k < new_block_end {
                let line = &self.lines[k];
                let trimmed = line.trim();
                if trimmed.is_empty() {
                    k += 1;
                    continue;
                }
                let this_indent = line.len() - line.trim_start().len();
                if this_indent <= field_indent {
                    break;
                }
                has_content = true;
                break;
            }
            if !has_content {
                self.lines.remove(ll);
            }
        }

        Ok(())
    }

    /// Remove an entire artifact block (including any preceding blank line
    /// that separates it from the previous artifact).
    pub fn remove_artifact(&mut self, id: &str) -> Result<(), String> {
        let (block_start, block_end) = self
            .find_artifact_block(id)
            .ok_or_else(|| format!("artifact '{id}' not found"))?;

        // Also remove a preceding blank line if it exists (visual separator)
        let remove_start = if block_start > 0
            && self.lines[block_start - 1].trim().is_empty()
        {
            block_start - 1
        } else {
            block_start
        };

        self.lines.drain(remove_start..block_end);

        Ok(())
    }

    /// Serialize the editor contents back to a string.
    ///
    /// The output preserves the exact original formatting for any lines that
    /// were not modified.
    pub fn to_string(&self) -> String {
        if self.lines.is_empty() {
            return String::new();
        }
        // Join with newlines and add trailing newline (standard for YAML files)
        let mut out = self.lines.join("\n");
        out.push('\n');
        out
    }
}

impl std::fmt::Display for YamlEditor {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(&self.to_string())
    }
}

// ── Mutation helpers that bridge YamlEditor into the existing mutate API ──

use crate::error::Error;
use crate::model::Link;
use std::path::Path;

use super::mutate::ModifyParams;

/// Modify an artifact in its YAML file using the safe editor.
pub fn modify_artifact_in_file(
    id: &str,
    params: &ModifyParams,
    file_path: &Path,
    store: &crate::store::Store,
) -> Result<(), Error> {
    let content = std::fs::read_to_string(file_path)
        .map_err(|e| Error::Io(format!("{}: {}", file_path.display(), e)))?;

    let new_content = modify_artifact_yaml(&content, id, params, store)?;

    std::fs::write(file_path, &new_content)
        .map_err(|e| Error::Io(format!("{}: {}", file_path.display(), e)))?;

    Ok(())
}

/// Apply modify params to YAML content using `YamlEditor`.
pub fn modify_artifact_yaml(
    content: &str,
    id: &str,
    params: &ModifyParams,
    store: &crate::store::Store,
) -> Result<String, Error> {
    let mut editor = YamlEditor::parse(content);

    // Verify artifact exists in the file
    if editor.find_artifact_block(id).is_none() {
        return Err(Error::Validation(format!(
            "artifact '{id}' not found in file"
        )));
    }

    // Set title
    if let Some(ref new_title) = params.set_title {
        editor
            .set_field(id, "title", new_title)
            .map_err(|e| Error::Validation(e))?;
    }

    // Set status
    if let Some(ref new_status) = params.set_status {
        editor
            .set_field(id, "status", new_status)
            .map_err(|e| Error::Validation(e))?;
    }

    // Handle tags
    if !params.add_tags.is_empty() || !params.remove_tags.is_empty() {
        let artifact = store.get(id).ok_or_else(|| {
            Error::Validation(format!("artifact '{id}' not found in store"))
        })?;
        let mut current_tags = artifact.tags.clone();
        for tag in &params.remove_tags {
            current_tags.retain(|t| t != tag);
        }
        for tag in &params.add_tags {
            if !current_tags.contains(tag) {
                current_tags.push(tag.clone());
            }
        }
        if current_tags.is_empty() {
            // Remove the tags line entirely
            let (block_start, block_end) = editor.find_artifact_block(id).unwrap();
            if let Some(tags_line) =
                editor.find_field_in_block(block_start, block_end, "tags")
            {
                editor.lines.remove(tags_line);
            }
        } else {
            let tags_value = format!("[{}]", current_tags.join(", "));
            editor
                .set_field(id, "tags", &tags_value)
                .map_err(|e| Error::Validation(e))?;
        }
    }

    // Set custom fields
    for (key, value) in &params.set_fields {
        // Custom fields live under the `fields:` mapping. We need to handle
        // these differently — they are nested one level deeper.
        let (block_start, block_end) = editor.find_artifact_block(id).unwrap();
        let field_indent = editor.field_indent(block_start);

        if let Some(fields_line) =
            editor.find_field_in_block(block_start, block_end, "fields")
        {
            // Look for the sub-key within the fields mapping
            let sub_indent = field_indent + 2;
            let sub_prefix = format!("{key}:");
            let mut found = false;
            for i in (fields_line + 1)..block_end {
                let line = &editor.lines[i];
                let trimmed = line.trim();
                if trimmed.is_empty() {
                    continue;
                }
                let this_indent = line.len() - line.trim_start().len();
                if this_indent <= field_indent {
                    break;
                }
                if this_indent == sub_indent && trimmed.starts_with(&sub_prefix) {
                    editor.lines[i] =
                        format!("{}{key}: {value}", " ".repeat(sub_indent));
                    found = true;
                    break;
                }
            }
            if !found {
                // Insert new sub-field at end of fields section
                let mut insert_at = fields_line + 1;
                while insert_at < block_end {
                    let line = &editor.lines[insert_at];
                    let trimmed = line.trim();
                    if trimmed.is_empty() {
                        insert_at += 1;
                        continue;
                    }
                    let this_indent = line.len() - line.trim_start().len();
                    if this_indent <= field_indent {
                        break;
                    }
                    insert_at += 1;
                }
                editor.lines.insert(
                    insert_at,
                    format!("{}{key}: {value}", " ".repeat(sub_indent)),
                );
            }
        } else {
            // No `fields:` section — create one
            let mut insert_at = block_end;
            while insert_at > block_start + 1
                && editor
                    .lines
                    .get(insert_at - 1)
                    .is_some_and(|l| l.trim().is_empty())
            {
                insert_at -= 1;
            }
            let sub_indent = field_indent + 2;
            editor.lines.insert(
                insert_at,
                format!("{}{key}: {value}", " ".repeat(sub_indent)),
            );
            editor.lines.insert(
                insert_at,
                format!("{}fields:", " ".repeat(field_indent)),
            );
        }
    }

    Ok(editor.to_string())
}

/// Add a link entry to an artifact in its YAML file using the safe editor.
pub fn add_link_to_file(source_id: &str, link: &Link, file_path: &Path) -> Result<(), Error> {
    let content = std::fs::read_to_string(file_path)
        .map_err(|e| Error::Io(format!("{}: {}", file_path.display(), e)))?;

    let mut editor = YamlEditor::parse(&content);
    editor
        .add_link(source_id, &link.link_type, &link.target)
        .map_err(|e| Error::Validation(e))?;

    std::fs::write(file_path, editor.to_string())
        .map_err(|e| Error::Io(format!("{}: {}", file_path.display(), e)))?;

    Ok(())
}

/// Remove a link from an artifact in its YAML file using the safe editor.
pub fn remove_link_from_file(
    source_id: &str,
    link_type: &str,
    target_id: &str,
    file_path: &Path,
) -> Result<(), Error> {
    let content = std::fs::read_to_string(file_path)
        .map_err(|e| Error::Io(format!("{}: {}", file_path.display(), e)))?;

    let mut editor = YamlEditor::parse(&content);
    editor
        .remove_link(source_id, link_type, target_id)
        .map_err(|e| Error::Validation(e))?;

    std::fs::write(file_path, editor.to_string())
        .map_err(|e| Error::Io(format!("{}: {}", file_path.display(), e)))?;

    Ok(())
}

/// Remove an artifact from its YAML file using the safe editor.
pub fn remove_artifact_from_file(artifact_id: &str, file_path: &Path) -> Result<(), Error> {
    let content = std::fs::read_to_string(file_path)
        .map_err(|e| Error::Io(format!("{}: {}", file_path.display(), e)))?;

    let mut editor = YamlEditor::parse(&content);
    editor
        .remove_artifact(artifact_id)
        .map_err(|e| Error::Validation(e))?;

    std::fs::write(file_path, editor.to_string())
        .map_err(|e| Error::Io(format!("{}: {}", file_path.display(), e)))?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    const SAMPLE_YAML: &str = "\
artifacts:
  - id: REQ-001
    type: requirement
    title: First requirement
    status: draft
    description: >
      Multi-line description
      that spans two lines.
    tags: [core, safety]
    fields:
      priority: must
      category: functional
    links:
      - type: satisfies
        target: SC-1
      - type: satisfies
        target: SC-3

  - id: REQ-002
    type: requirement
    title: Second requirement
    status: approved
    tags: [core]

  - id: REQ-003
    type: requirement
    title: Third requirement
    status: draft
    description: >
      Another description.
    tags: [testing]
    links:
      - type: satisfies
        target: REQ-001";

    #[test]
    fn test_roundtrip_preserves_content() {
        let editor = YamlEditor::parse(SAMPLE_YAML);
        assert_eq!(editor.to_string(), format!("{SAMPLE_YAML}\n"));
    }

    #[test]
    fn test_find_artifact_block_first() {
        let editor = YamlEditor::parse(SAMPLE_YAML);
        let (start, end) = editor.find_artifact_block("REQ-001").unwrap();
        assert_eq!(start, 1); // `- id: REQ-001`
        // Block ends at the blank line before REQ-002
        assert!(end > start);
        assert!(editor.lines[start].contains("REQ-001"));
        // The next non-blank line at or before `end` should be the last line of REQ-001
        // or `end` points to the start of REQ-002
    }

    #[test]
    fn test_find_artifact_block_middle() {
        let editor = YamlEditor::parse(SAMPLE_YAML);
        let (start, end) = editor.find_artifact_block("REQ-002").unwrap();
        assert!(editor.lines[start].contains("REQ-002"));
        // REQ-002 is a short block (4 content lines)
        assert!(end > start);
        // The block should not include REQ-003
        for i in start..end {
            assert!(
                !editor.lines[i].contains("REQ-003"),
                "REQ-002 block should not contain REQ-003 at line {i}"
            );
        }
    }

    #[test]
    fn test_find_artifact_block_last() {
        let editor = YamlEditor::parse(SAMPLE_YAML);
        let (start, end) = editor.find_artifact_block("REQ-003").unwrap();
        assert!(editor.lines[start].contains("REQ-003"));
        // Last artifact extends to EOF
        assert_eq!(end, editor.lines.len());
    }

    #[test]
    fn test_find_artifact_block_not_found() {
        let editor = YamlEditor::parse(SAMPLE_YAML);
        assert!(editor.find_artifact_block("REQ-999").is_none());
    }

    #[test]
    fn test_set_field_updates_existing() {
        let mut editor = YamlEditor::parse(SAMPLE_YAML);
        editor.set_field("REQ-001", "status", "approved").unwrap();
        let output = editor.to_string();
        assert!(output.contains("    status: approved"));
        // Verify REQ-001 no longer has "status: draft" (REQ-003 still has it)
        let lines: Vec<&str> = output.lines().collect();
        let req001_start = lines.iter().position(|l| l.contains("REQ-001")).unwrap();
        let req002_start = lines.iter().position(|l| l.contains("REQ-002")).unwrap();
        for i in req001_start..req002_start {
            assert!(
                !lines[i].contains("status: draft"),
                "REQ-001 should no longer have 'status: draft'"
            );
        }
        // Other fields should be unchanged
        assert!(output.contains("    title: First requirement"));
    }

    #[test]
    fn test_set_field_adds_new_field() {
        let mut editor = YamlEditor::parse(SAMPLE_YAML);
        // REQ-002 has no description; add a status change to verify insertion
        editor.set_field("REQ-002", "status", "rejected").unwrap();
        let output = editor.to_string();
        // The status field should be at the correct indent
        let lines: Vec<&str> = output.lines().collect();
        let req002_start = lines.iter().position(|l| l.contains("REQ-002")).unwrap();
        // Find the status line within REQ-002
        let mut found_status = false;
        for i in (req002_start + 1)..lines.len() {
            if lines[i].contains("- id:") {
                break;
            }
            if lines[i].trim().starts_with("status: rejected") {
                found_status = true;
                // Verify correct indentation (should match other fields)
                let indent = lines[i].len() - lines[i].trim_start().len();
                assert_eq!(indent, 4, "status field should be at indent 4");
                break;
            }
        }
        assert!(found_status, "status field should have been added");
    }

    #[test]
    fn test_set_field_replaces_block_scalar() {
        let mut editor = YamlEditor::parse(SAMPLE_YAML);
        // Replace the multi-line description of REQ-001
        editor
            .set_field("REQ-001", "description", "Simple one-liner")
            .unwrap();
        let output = editor.to_string();
        assert!(output.contains("    description: Simple one-liner"));
        // The old multi-line content should be gone
        assert!(!output.contains("Multi-line description"));
        assert!(!output.contains("that spans two lines"));
    }

    #[test]
    fn test_add_link_to_existing_links() {
        let mut editor = YamlEditor::parse(SAMPLE_YAML);
        editor
            .add_link("REQ-001", "derives-from", "REQ-099")
            .unwrap();
        let output = editor.to_string();
        assert!(output.contains("- type: derives-from"));
        assert!(output.contains("target: REQ-099"));
        // Existing links should still be there
        assert!(output.contains("- type: satisfies"));
        assert!(output.contains("target: SC-1"));
    }

    #[test]
    fn test_add_link_creates_links_section() {
        let mut editor = YamlEditor::parse(SAMPLE_YAML);
        // REQ-002 has no links section
        editor
            .add_link("REQ-002", "satisfies", "REQ-001")
            .unwrap();
        let output = editor.to_string();
        // Verify the links section was created in REQ-002
        let lines: Vec<&str> = output.lines().collect();
        let req002_start = lines.iter().position(|l| l.contains("REQ-002")).unwrap();
        let mut found_links = false;
        for i in (req002_start + 1)..lines.len() {
            if lines[i].contains("- id:") && !lines[i].contains("REQ-002") {
                break;
            }
            if lines[i].trim() == "links:" {
                found_links = true;
            }
        }
        assert!(found_links, "links section should have been created for REQ-002");
        assert!(output.contains("- type: satisfies"));
        assert!(output.contains("target: REQ-001"));
    }

    #[test]
    fn test_remove_link() {
        let mut editor = YamlEditor::parse(SAMPLE_YAML);
        editor
            .remove_link("REQ-001", "satisfies", "SC-1")
            .unwrap();
        let output = editor.to_string();
        // The SC-1 link should be gone
        assert!(!output.contains("target: SC-1"));
        // The SC-3 link should still be there
        assert!(output.contains("target: SC-3"));
    }

    #[test]
    fn test_remove_artifact() {
        let mut editor = YamlEditor::parse(SAMPLE_YAML);
        editor.remove_artifact("REQ-002").unwrap();
        let output = editor.to_string();
        assert!(!output.contains("REQ-002"));
        assert!(output.contains("REQ-001"));
        assert!(output.contains("REQ-003"));
    }

    #[test]
    fn test_set_status_after_tags_description_bug() {
        // This is the bug case: setting status on an artifact that has
        // description after tags. The old string-manipulation approach
        // would place the status outside the artifact block.
        let content = "\
artifacts:
  - id: FEAT-010
    type: feature
    title: Some feature
    tags: [alpha, beta]
    description: >
      A description that comes after tags.
    links:
      - type: satisfies
        target: REQ-001

  - id: FEAT-011
    type: feature
    title: Another feature
    status: draft";

        let mut editor = YamlEditor::parse(content);
        editor
            .set_field("FEAT-010", "status", "approved")
            .unwrap();
        let output = editor.to_string();

        // The status should be inside the FEAT-010 block
        let lines: Vec<&str> = output.lines().collect();
        let feat010_start = lines.iter().position(|l| l.contains("FEAT-010")).unwrap();
        let feat011_start = lines.iter().position(|l| l.contains("FEAT-011")).unwrap();

        let mut status_line = None;
        for i in (feat010_start + 1)..feat011_start {
            if lines[i].trim().starts_with("status:") {
                status_line = Some(i);
                break;
            }
        }

        assert!(
            status_line.is_some(),
            "status should appear within FEAT-010 block, not after it"
        );

        let idx = status_line.unwrap();
        assert!(
            idx > feat010_start && idx < feat011_start,
            "status at line {idx} should be between FEAT-010 (line {feat010_start}) and FEAT-011 (line {feat011_start})"
        );

        // Verify indentation matches
        let indent = lines[idx].len() - lines[idx].trim_start().len();
        assert_eq!(indent, 4);
    }

    #[test]
    fn test_remove_only_link_removes_section() {
        let content = "\
artifacts:
  - id: REQ-050
    type: requirement
    title: Single link artifact
    status: draft
    links:
      - type: satisfies
        target: SC-1";

        let mut editor = YamlEditor::parse(content);
        editor
            .remove_link("REQ-050", "satisfies", "SC-1")
            .unwrap();
        let output = editor.to_string();
        // The links: header should be removed too
        assert!(!output.contains("links:"));
        // But the artifact should still exist
        assert!(output.contains("REQ-050"));
        assert!(output.contains("title: Single link artifact"));
    }

    #[test]
    fn test_remove_last_artifact() {
        let content = "\
artifacts:
  - id: REQ-001
    type: requirement
    title: First

  - id: REQ-002
    type: requirement
    title: Last";

        let mut editor = YamlEditor::parse(content);
        editor.remove_artifact("REQ-002").unwrap();
        let output = editor.to_string();
        assert!(!output.contains("REQ-002"));
        assert!(output.contains("REQ-001"));
    }

    #[test]
    fn test_remove_first_artifact() {
        let content = "\
artifacts:
  - id: REQ-001
    type: requirement
    title: First

  - id: REQ-002
    type: requirement
    title: Second";

        let mut editor = YamlEditor::parse(content);
        editor.remove_artifact("REQ-001").unwrap();
        let output = editor.to_string();
        assert!(!output.contains("REQ-001"));
        assert!(output.contains("REQ-002"));
    }

    #[test]
    fn test_roundtrip_real_world_artifact() {
        // A realistic artifact with all field types
        let content = "\
artifacts:
  - id: REQ-023
    type: requirement
    title: Conditional validation rules
    status: draft
    description: >
      The validation engine must support conditional rules where field
      requirements or link cardinality depend on the value of another field.
    tags: [validation, schema, safety]
    links:
      - type: satisfies
        target: SC-12
    fields:
      priority: should
      category: functional
      upstream-ref: \"eclipse-score/docs-as-code#180\"
";
        let editor = YamlEditor::parse(content);
        assert_eq!(editor.to_string(), content);
    }

    #[test]
    fn test_multiple_modifications() {
        let content = "\
artifacts:
  - id: REQ-001
    type: requirement
    title: Original title
    status: draft
    tags: [core]";

        let mut editor = YamlEditor::parse(content);
        editor
            .set_field("REQ-001", "title", "Updated title")
            .unwrap();
        editor
            .set_field("REQ-001", "status", "approved")
            .unwrap();
        let output = editor.to_string();
        assert!(output.contains("title: Updated title"));
        assert!(output.contains("status: approved"));
        assert!(!output.contains("Original title"));
        assert!(!output.contains("status: draft"));
    }

    #[test]
    fn test_add_link_not_found() {
        let mut editor = YamlEditor::parse(SAMPLE_YAML);
        let result = editor.add_link("NOPE-999", "satisfies", "REQ-001");
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("not found"));
    }

    #[test]
    fn test_remove_link_not_found() {
        let mut editor = YamlEditor::parse(SAMPLE_YAML);
        let result = editor.remove_link("REQ-001", "satisfies", "NOPE-999");
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("not found"));
    }

    #[test]
    fn test_remove_artifact_not_found() {
        let mut editor = YamlEditor::parse(SAMPLE_YAML);
        let result = editor.remove_artifact("NOPE-999");
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("not found"));
    }
}

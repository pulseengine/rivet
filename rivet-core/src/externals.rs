// rivet-core/src/externals.rs

/// A parsed artifact reference — either local or cross-repo.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ArtifactRef {
    /// Local artifact ID (no prefix).
    Local(String),
    /// Cross-repo artifact: (prefix, id).
    External { prefix: String, id: String },
}

/// Parse an artifact reference string.
///
/// - `"REQ-001"` → `ArtifactRef::Local("REQ-001")`
/// - `"rivet:REQ-001"` → `ArtifactRef::External { prefix: "rivet", id: "REQ-001" }`
pub fn parse_artifact_ref(s: &str) -> ArtifactRef {
    // Only split on first colon. The prefix must be purely alphabetic
    // (no digits, hyphens, or dots) to avoid confusion with IDs like "H-1.2".
    if let Some((prefix, id)) = s.split_once(':') {
        if !prefix.is_empty()
            && prefix.chars().all(|c| c.is_ascii_lowercase())
            && !id.is_empty()
        {
            return ArtifactRef::External {
                prefix: prefix.to_string(),
                id: id.to_string(),
            };
        }
    }
    ArtifactRef::Local(s.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn local_id_no_colon() {
        assert_eq!(
            parse_artifact_ref("REQ-001"),
            ArtifactRef::Local("REQ-001".into())
        );
    }

    #[test]
    fn external_id_with_prefix() {
        assert_eq!(
            parse_artifact_ref("rivet:REQ-001"),
            ArtifactRef::External {
                prefix: "rivet".into(),
                id: "REQ-001".into(),
            }
        );
    }

    #[test]
    fn local_id_with_hyphen_numbers() {
        // IDs like "H-1.2" should not be confused with prefix:id
        assert_eq!(
            parse_artifact_ref("H-1.2"),
            ArtifactRef::Local("H-1.2".into())
        );
    }

    #[test]
    fn external_with_complex_id() {
        assert_eq!(
            parse_artifact_ref("meld:UCA-C-1"),
            ArtifactRef::External {
                prefix: "meld".into(),
                id: "UCA-C-1".into(),
            }
        );
    }
}

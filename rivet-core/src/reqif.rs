//! ReqIF 1.2 XML import/export adapter.
//!
//! Implements the OMG Requirements Interchange Format (ReqIF) version 1.2,
//! namespace `http://www.omg.org/spec/ReqIF/20110401/reqif.xsd`.
//!
//! Mapping strategy:
//!
//! | Rivet concept     | ReqIF element                     |
//! |-------------------|-----------------------------------|
//! | Artifact          | SPEC-OBJECT                       |
//! | Artifact.id       | SPEC-OBJECT.IDENTIFIER            |
//! | Artifact.title    | SPEC-OBJECT.LONG-NAME             |
//! | Artifact.description | SPEC-OBJECT.DESC               |
//! | Artifact.artifact_type | SPEC-OBJECT-TYPE.LONG-NAME   |
//! | Artifact.status   | ATTRIBUTE-VALUE-STRING ("status") |
//! | Artifact.tags     | ATTRIBUTE-VALUE-STRING ("tags")   |
//! | Artifact.fields   | ATTRIBUTE-VALUE-STRING per field   |
//! | Link              | SPEC-RELATION                     |
//! | Link.link_type    | SPEC-RELATION-TYPE.LONG-NAME      |

use std::collections::{BTreeMap, HashMap};

use quick_xml::de::from_str as xml_from_str;
use quick_xml::se::to_string as xml_to_string;
use serde::{Deserialize, Serialize};

use crate::adapter::{Adapter, AdapterConfig, AdapterSource};
use crate::error::Error;
use crate::model::{Artifact, Link, Provenance};

// ── ReqIF XML structures ────────────────────────────────────────────────
//
// These mirror the ReqIF 1.2 XSD just enough for lossless round-tripping
// of Rivet artifacts.  Fields not relevant to Rivet are accepted on read
// (via serde defaults) and omitted on write.

/// Root element: `<REQ-IF>`.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename = "REQ-IF")]
pub struct ReqIfRoot {
    #[serde(rename = "@xmlns", default = "default_namespace")]
    pub xmlns: String,

    #[serde(rename = "THE-HEADER")]
    pub the_header: TheHeader,

    #[serde(rename = "CORE-CONTENT")]
    pub core_content: CoreContent,
}

fn default_namespace() -> String {
    REQIF_NAMESPACE.to_string()
}

/// `<THE-HEADER>` wrapping `<REQ-IF-HEADER>`.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename = "THE-HEADER")]
pub struct TheHeader {
    #[serde(rename = "REQ-IF-HEADER")]
    pub req_if_header: ReqIfHeader,
}

/// `<REQ-IF-HEADER>`.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename = "REQ-IF-HEADER")]
pub struct ReqIfHeader {
    #[serde(rename = "@IDENTIFIER")]
    pub identifier: String,

    #[serde(rename = "COMMENT", default, skip_serializing_if = "Option::is_none")]
    pub comment: Option<String>,

    #[serde(
        rename = "CREATION-TIME",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub creation_time: Option<String>,

    #[serde(
        rename = "REPOSITORY-ID",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub repository_id: Option<String>,

    #[serde(
        rename = "REQ-IF-TOOL-ID",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub req_if_tool_id: Option<String>,

    #[serde(
        rename = "REQ-IF-VERSION",
        default = "default_reqif_version",
        skip_serializing_if = "Option::is_none"
    )]
    pub req_if_version: Option<String>,

    #[serde(
        rename = "SOURCE-TOOL-ID",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub source_tool_id: Option<String>,

    #[serde(rename = "TITLE", default, skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
}

fn default_reqif_version() -> Option<String> {
    Some("1.2".into())
}

/// `<CORE-CONTENT>` wrapping `<REQ-IF-CONTENT>`.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename = "CORE-CONTENT")]
pub struct CoreContent {
    #[serde(rename = "REQ-IF-CONTENT")]
    pub req_if_content: ReqIfContent,
}

/// `<REQ-IF-CONTENT>` — the meat of a ReqIF document.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename = "REQ-IF-CONTENT")]
pub struct ReqIfContent {
    #[serde(rename = "DATATYPES", default)]
    pub datatypes: Datatypes,

    #[serde(rename = "SPEC-TYPES", default)]
    pub spec_types: SpecTypes,

    #[serde(rename = "SPEC-OBJECTS", default)]
    pub spec_objects: SpecObjects,

    #[serde(rename = "SPEC-RELATIONS", default)]
    pub spec_relations: SpecRelations,
}

// ── DATATYPES ───────────────────────────────────────────────────────────

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename = "DATATYPES")]
pub struct Datatypes {
    #[serde(rename = "DATATYPE-DEFINITION-STRING", default)]
    pub string_types: Vec<DatatypeDefinitionString>,

    #[serde(rename = "DATATYPE-DEFINITION-ENUMERATION", default)]
    pub enum_types: Vec<DatatypeDefinitionEnumeration>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename = "DATATYPE-DEFINITION-STRING")]
pub struct DatatypeDefinitionString {
    #[serde(rename = "@IDENTIFIER")]
    pub identifier: String,

    #[serde(
        rename = "@LONG-NAME",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub long_name: Option<String>,

    #[serde(
        rename = "@MAX-LENGTH",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub max_length: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename = "DATATYPE-DEFINITION-ENUMERATION")]
pub struct DatatypeDefinitionEnumeration {
    #[serde(rename = "@IDENTIFIER")]
    pub identifier: String,

    #[serde(
        rename = "@LONG-NAME",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub long_name: Option<String>,

    #[serde(
        rename = "SPECIFIED-VALUES",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub specified_values: Option<SpecifiedValues>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename = "SPECIFIED-VALUES")]
pub struct SpecifiedValues {
    #[serde(rename = "ENUM-VALUE", default)]
    pub values: Vec<EnumValue>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename = "ENUM-VALUE")]
pub struct EnumValue {
    #[serde(rename = "@IDENTIFIER")]
    pub identifier: String,

    #[serde(
        rename = "@LONG-NAME",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub long_name: Option<String>,
}

// ── SPEC-TYPES ──────────────────────────────────────────────────────────

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename = "SPEC-TYPES")]
pub struct SpecTypes {
    #[serde(rename = "SPEC-OBJECT-TYPE", default)]
    pub object_types: Vec<SpecObjectType>,

    #[serde(rename = "SPEC-RELATION-TYPE", default)]
    pub relation_types: Vec<SpecRelationType>,

    /// StrictDoc and other tools emit SPECIFICATION-TYPE elements.
    /// We parse but don't use them.
    #[serde(rename = "SPECIFICATION-TYPE", default)]
    pub specification_types: Vec<SpecificationType>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename = "SPECIFICATION-TYPE")]
pub struct SpecificationType {
    #[serde(rename = "@IDENTIFIER")]
    pub identifier: String,

    #[serde(
        rename = "@LONG-NAME",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub long_name: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename = "SPEC-OBJECT-TYPE")]
pub struct SpecObjectType {
    #[serde(rename = "@IDENTIFIER")]
    pub identifier: String,

    #[serde(
        rename = "@LONG-NAME",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub long_name: Option<String>,

    #[serde(
        rename = "SPEC-ATTRIBUTES",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub spec_attributes: Option<SpecAttributes>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename = "SPEC-RELATION-TYPE")]
pub struct SpecRelationType {
    #[serde(rename = "@IDENTIFIER")]
    pub identifier: String,

    #[serde(
        rename = "@LONG-NAME",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub long_name: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename = "SPEC-ATTRIBUTES")]
pub struct SpecAttributes {
    #[serde(rename = "ATTRIBUTE-DEFINITION-STRING", default)]
    pub string_attrs: Vec<AttributeDefinitionString>,

    #[serde(rename = "ATTRIBUTE-DEFINITION-ENUMERATION", default)]
    pub enum_attrs: Vec<AttributeDefinitionEnumeration>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename = "ATTRIBUTE-DEFINITION-ENUMERATION")]
pub struct AttributeDefinitionEnumeration {
    #[serde(rename = "@IDENTIFIER")]
    pub identifier: String,

    #[serde(
        rename = "@LONG-NAME",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub long_name: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename = "ATTRIBUTE-DEFINITION-STRING")]
pub struct AttributeDefinitionString {
    #[serde(rename = "@IDENTIFIER")]
    pub identifier: String,

    #[serde(
        rename = "@LONG-NAME",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub long_name: Option<String>,

    #[serde(rename = "TYPE", default, skip_serializing_if = "Option::is_none")]
    pub datatype_ref: Option<DatatypeRef>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename = "TYPE")]
pub struct DatatypeRef {
    #[serde(rename = "DATATYPE-DEFINITION-STRING-REF")]
    pub datatype_ref: String,
}

// ── SPEC-OBJECTS ────────────────────────────────────────────────────────

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename = "SPEC-OBJECTS")]
pub struct SpecObjects {
    #[serde(rename = "SPEC-OBJECT", default)]
    pub objects: Vec<SpecObject>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename = "SPEC-OBJECT")]
pub struct SpecObject {
    #[serde(rename = "@IDENTIFIER")]
    pub identifier: String,

    #[serde(
        rename = "@LONG-NAME",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub long_name: Option<String>,

    #[serde(rename = "@DESC", default, skip_serializing_if = "Option::is_none")]
    pub desc: Option<String>,

    #[serde(rename = "TYPE", default, skip_serializing_if = "Option::is_none")]
    pub object_type_ref: Option<SpecObjectTypeRef>,

    #[serde(rename = "VALUES", default, skip_serializing_if = "Option::is_none")]
    pub values: Option<Values>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename = "TYPE")]
pub struct SpecObjectTypeRef {
    #[serde(rename = "SPEC-OBJECT-TYPE-REF")]
    pub spec_object_type_ref: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename = "VALUES")]
pub struct Values {
    #[serde(rename = "ATTRIBUTE-VALUE-STRING", default)]
    pub string_values: Vec<AttributeValueString>,

    #[serde(rename = "ATTRIBUTE-VALUE-ENUMERATION", default)]
    pub enum_values: Vec<AttributeValueEnumeration>,
}

/// Enumeration attribute value — references one or more ENUM-VALUE identifiers.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename = "ATTRIBUTE-VALUE-ENUMERATION")]
pub struct AttributeValueEnumeration {
    #[serde(rename = "VALUES", default, skip_serializing_if = "Option::is_none")]
    pub values: Option<EnumValueRefs>,

    #[serde(rename = "DEFINITION")]
    pub definition: EnumAttrDefinitionRef,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename = "VALUES")]
pub struct EnumValueRefs {
    #[serde(rename = "ENUM-VALUE-REF", default)]
    pub refs: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename = "DEFINITION")]
pub struct EnumAttrDefinitionRef {
    #[serde(rename = "ATTRIBUTE-DEFINITION-ENUMERATION-REF")]
    pub attr_def_ref: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename = "ATTRIBUTE-VALUE-STRING")]
pub struct AttributeValueString {
    #[serde(rename = "@THE-VALUE")]
    pub the_value: String,

    #[serde(rename = "DEFINITION")]
    pub definition: AttrDefinitionRef,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename = "DEFINITION")]
pub struct AttrDefinitionRef {
    #[serde(rename = "ATTRIBUTE-DEFINITION-STRING-REF")]
    pub attr_def_ref: String,
}

// ── SPEC-RELATIONS ──────────────────────────────────────────────────────

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename = "SPEC-RELATIONS")]
pub struct SpecRelations {
    #[serde(rename = "SPEC-RELATION", default)]
    pub relations: Vec<SpecRelation>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename = "SPEC-RELATION")]
pub struct SpecRelation {
    #[serde(rename = "@IDENTIFIER")]
    pub identifier: String,

    #[serde(rename = "TYPE", default, skip_serializing_if = "Option::is_none")]
    pub relation_type_ref: Option<SpecRelationTypeRef>,

    #[serde(rename = "SOURCE")]
    pub source: SpecRelationEnd,

    #[serde(rename = "TARGET")]
    pub target: SpecRelationEnd,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename = "TYPE")]
pub struct SpecRelationTypeRef {
    #[serde(rename = "SPEC-RELATION-TYPE-REF")]
    pub spec_relation_type_ref: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpecRelationEnd {
    #[serde(rename = "SPEC-OBJECT-REF")]
    pub spec_object_ref: String,
}

// ── Constants ───────────────────────────────────────────────────────────

pub const REQIF_NAMESPACE: &str = "http://www.omg.org/spec/ReqIF/20110401/reqif.xsd";

const DATATYPE_STRING_ID: &str = "DT-STRING";
const ATTR_DEF_STATUS: &str = "ATTR-STATUS";
const ATTR_DEF_TAGS: &str = "ATTR-TAGS";
const ATTR_DEF_ARTIFACT_TYPE: &str = "ATTR-ARTIFACT-TYPE";

// Provenance attribute definition identifiers and long-names.
//
// These expose rivet's AI-provenance metadata over ReqIF as a stable
// convention: five string attributes prefixed with `rivet:`.  Other tools
// that don't know about rivet will ignore the unknown attribute names.
// Files that don't carry them round-trip as `provenance: None`.
const ATTR_DEF_PROV_CREATED_BY: &str = "ATTR-RIVET-CREATED-BY";
const ATTR_DEF_PROV_MODEL: &str = "ATTR-RIVET-MODEL";
const ATTR_DEF_PROV_SESSION_ID: &str = "ATTR-RIVET-SESSION-ID";
const ATTR_DEF_PROV_TIMESTAMP: &str = "ATTR-RIVET-TIMESTAMP";
const ATTR_DEF_PROV_REVIEWED_BY: &str = "ATTR-RIVET-REVIEWED-BY";

const PROV_LONG_CREATED_BY: &str = "rivet:created-by";
const PROV_LONG_MODEL: &str = "rivet:model";
const PROV_LONG_SESSION_ID: &str = "rivet:session-id";
const PROV_LONG_TIMESTAMP: &str = "rivet:timestamp";
const PROV_LONG_REVIEWED_BY: &str = "rivet:reviewed-by";

// ── Adapter ─────────────────────────────────────────────────────────────

pub struct ReqIfAdapter {
    supported: Vec<String>,
}

impl ReqIfAdapter {
    pub fn new() -> Self {
        Self {
            supported: vec![], // accepts all types
        }
    }
}

impl Default for ReqIfAdapter {
    fn default() -> Self {
        Self::new()
    }
}

impl Adapter for ReqIfAdapter {
    fn id(&self) -> &str {
        "reqif"
    }

    fn name(&self) -> &str {
        "ReqIF 1.2 XML"
    }

    fn supported_types(&self) -> &[String] {
        &self.supported
    }

    fn import(
        &self,
        source: &AdapterSource,
        config: &AdapterConfig,
    ) -> Result<Vec<Artifact>, Error> {
        let type_map = build_type_map(config);
        let xml_str = match source {
            AdapterSource::Bytes(bytes) => std::str::from_utf8(bytes)
                .map_err(|e| Error::Adapter(format!("invalid UTF-8: {e}")))?
                .to_string(),
            AdapterSource::Path(path) => std::fs::read_to_string(path)
                .map_err(|e| Error::Io(format!("{}: {e}", path.display())))?,
            AdapterSource::Directory(dir) => {
                return import_reqif_directory(dir, &type_map);
            }
        };
        parse_reqif(&xml_str, &type_map)
    }

    fn export(&self, artifacts: &[Artifact], _config: &AdapterConfig) -> Result<Vec<u8>, Error> {
        let reqif = build_reqif(artifacts);
        serialize_reqif(&reqif)
    }
}

// ── Import ──────────────────────────────────────────────────────────────

/// Build a type map from config entries with `type-map.` prefix.
///
/// Example config:
///   type-map.requirement: sw-req
///   type-map.section: documentation
///
/// Keys are lowercased to match the artifact_type normalization.
fn build_type_map(config: &AdapterConfig) -> HashMap<String, String> {
    let mut map = HashMap::new();
    for (key, value) in &config.entries {
        if let Some(from_type) = key.strip_prefix("type-map.") {
            map.insert(from_type.to_lowercase(), value.clone());
        }
    }
    map
}

fn import_reqif_directory(
    dir: &std::path::Path,
    type_map: &HashMap<String, String>,
) -> Result<Vec<Artifact>, Error> {
    let mut artifacts = Vec::new();
    let entries =
        std::fs::read_dir(dir).map_err(|e| Error::Io(format!("{}: {e}", dir.display())))?;

    for entry in entries {
        let entry = entry.map_err(|e| Error::Io(e.to_string()))?;
        let path = entry.path();
        if path
            .extension()
            .is_some_and(|ext| ext == "reqif" || ext == "xml")
        {
            let content = std::fs::read_to_string(&path)
                .map_err(|e| Error::Io(format!("{}: {e}", path.display())))?;
            match parse_reqif(&content, type_map) {
                Ok(arts) => artifacts.extend(arts),
                Err(e) => log::warn!("skipping {}: {e}", path.display()),
            }
        } else if path.is_dir() {
            artifacts.extend(import_reqif_directory(&path, type_map)?);
        }
    }

    Ok(artifacts)
}

/// Parse a ReqIF XML string into Rivet artifacts.
///
/// `type_map` remaps artifact types: e.g. `{"requirement" => "sw-req"}`.
pub fn parse_reqif(xml: &str, type_map: &HashMap<String, String>) -> Result<Vec<Artifact>, Error> {
    let root: ReqIfRoot =
        xml_from_str(xml).map_err(|e| Error::Adapter(format!("ReqIF XML parse error: {e}")))?;

    let content = &root.core_content.req_if_content;

    // Build lookup tables for types.
    let object_type_names: HashMap<&str, &str> = content
        .spec_types
        .object_types
        .iter()
        .map(|t| {
            (
                t.identifier.as_str(),
                t.long_name.as_deref().unwrap_or(&t.identifier),
            )
        })
        .collect();

    let relation_type_names: HashMap<&str, &str> = content
        .spec_types
        .relation_types
        .iter()
        .map(|t| {
            (
                t.identifier.as_str(),
                t.long_name.as_deref().unwrap_or(&t.identifier),
            )
        })
        .collect();

    // Build lookup: attr-def id -> long-name (strings + enumerations).
    // Tolerate duplicate attribute definitions (e.g. StrictDoc exports)
    // by keeping the first occurrence and skipping later duplicates.
    let mut attr_def_names: HashMap<&str, &str> = HashMap::new();
    for ot in &content.spec_types.object_types {
        if let Some(attrs) = &ot.spec_attributes {
            for ad in &attrs.string_attrs {
                let name = ad.long_name.as_deref().unwrap_or(&ad.identifier);
                attr_def_names.entry(ad.identifier.as_str()).or_insert(name);
            }
            for ad in &attrs.enum_attrs {
                let name = ad.long_name.as_deref().unwrap_or(&ad.identifier);
                attr_def_names.entry(ad.identifier.as_str()).or_insert(name);
            }
        }
    }

    // Build lookup: enum-value id -> long-name for resolving ATTRIBUTE-VALUE-ENUMERATION.
    let mut enum_value_names: HashMap<&str, &str> = HashMap::new();
    for dt in &content.datatypes.enum_types {
        if let Some(sv) = &dt.specified_values {
            for ev in &sv.values {
                let name = ev.long_name.as_deref().unwrap_or(&ev.identifier);
                enum_value_names.insert(ev.identifier.as_str(), name);
            }
        }
    }

    // Parse SPEC-OBJECTS into Artifacts.
    let mut artifacts: Vec<Artifact> = Vec::new();
    for obj in &content.spec_objects.objects {
        let artifact_type = obj
            .object_type_ref
            .as_ref()
            .and_then(|r| {
                object_type_names
                    .get(r.spec_object_type_ref.as_str())
                    .copied()
            })
            .unwrap_or("unknown")
            .to_string();

        let mut status: Option<String> = None;
        let mut tags: Vec<String> = Vec::new();
        let mut fields: BTreeMap<String, serde_yaml::Value> = BTreeMap::new();
        let mut override_artifact_type: Option<String> = None;
        // ReqIF standard attributes (used by StrictDoc, DOORS, etc.)
        let mut reqif_foreign_id: Option<String> = None;
        let mut reqif_name: Option<String> = None;
        let mut reqif_text: Option<String> = None;
        // Rivet AI-provenance attributes.
        let mut prov_created_by: Option<String> = None;
        let mut prov_model: Option<String> = None;
        let mut prov_session_id: Option<String> = None;
        let mut prov_timestamp: Option<String> = None;
        let mut prov_reviewed_by: Option<String> = None;

        if let Some(values) = &obj.values {
            for av in &values.string_values {
                let attr_name = attr_def_names
                    .get(av.definition.attr_def_ref.as_str())
                    .copied()
                    .unwrap_or(&av.definition.attr_def_ref);

                match attr_name {
                    "status" | "STATUS" => {
                        if !av.the_value.is_empty() {
                            status = Some(av.the_value.clone());
                        }
                    }
                    "tags" | "TAGS" => {
                        tags = av
                            .the_value
                            .split(',')
                            .map(|s| s.trim().to_string())
                            .filter(|s| !s.is_empty())
                            .collect();
                    }
                    "artifact-type" => {
                        if !av.the_value.is_empty() {
                            override_artifact_type = Some(av.the_value.clone());
                        }
                    }
                    // ReqIF standard attributes (StrictDoc, DOORS, Polarion)
                    "ReqIF.ForeignID" => {
                        if !av.the_value.is_empty() {
                            reqif_foreign_id = Some(av.the_value.clone());
                        }
                    }
                    "ReqIF.Name" => {
                        if !av.the_value.is_empty() {
                            reqif_name = Some(av.the_value.clone());
                        }
                    }
                    "ReqIF.Text" => {
                        if !av.the_value.is_empty() {
                            reqif_text = Some(av.the_value.clone());
                        }
                    }
                    "ReqIF.ChapterName" => {
                        if !av.the_value.is_empty() {
                            reqif_name = Some(av.the_value.clone());
                        }
                    }
                    // Rivet AI-provenance: mapped back into the Provenance struct.
                    PROV_LONG_CREATED_BY => {
                        if !av.the_value.is_empty() {
                            prov_created_by = Some(av.the_value.clone());
                        }
                    }
                    PROV_LONG_MODEL => {
                        if !av.the_value.is_empty() {
                            prov_model = Some(av.the_value.clone());
                        }
                    }
                    PROV_LONG_SESSION_ID => {
                        if !av.the_value.is_empty() {
                            prov_session_id = Some(av.the_value.clone());
                        }
                    }
                    PROV_LONG_TIMESTAMP => {
                        if !av.the_value.is_empty() {
                            prov_timestamp = Some(av.the_value.clone());
                        }
                    }
                    PROV_LONG_REVIEWED_BY => {
                        if !av.the_value.is_empty() {
                            prov_reviewed_by = Some(av.the_value.clone());
                        }
                    }
                    _ => {
                        fields.insert(attr_name.to_string(), decode_field_value(&av.the_value));
                    }
                }
            }

            // Process enumeration values (e.g. StrictDoc TYPE field)
            for ev in &values.enum_values {
                let attr_name = attr_def_names
                    .get(ev.definition.attr_def_ref.as_str())
                    .copied()
                    .unwrap_or(&ev.definition.attr_def_ref);

                // Resolve enum value refs to their LONG-NAME
                let resolved: Vec<&str> = ev
                    .values
                    .as_ref()
                    .map(|v| {
                        v.refs
                            .iter()
                            .filter_map(|r| enum_value_names.get(r.as_str()).copied())
                            .collect()
                    })
                    .unwrap_or_default();

                let value = resolved.join(", ");
                if !value.is_empty() {
                    match attr_name {
                        "status" | "STATUS" => {
                            status = Some(value);
                        }
                        "tags" | "TAGS" => {
                            tags = value
                                .split(',')
                                .map(|s| s.trim().to_string())
                                .filter(|s| !s.is_empty())
                                .collect();
                        }
                        _ => {
                            fields.insert(attr_name.to_string(), serde_yaml::Value::String(value));
                        }
                    }
                }
            }
        }

        // Use ReqIF.ForeignID as artifact ID when available (StrictDoc/DOORS
        // store the human-readable UID there, while IDENTIFIER is a UUID).
        let id = reqif_foreign_id.unwrap_or_else(|| obj.identifier.clone());
        // Use ReqIF.Name or @LONG-NAME as title
        let title = reqif_name
            .or_else(|| obj.long_name.clone())
            .unwrap_or_default();
        // Use ReqIF.Text or @DESC as description
        let description = reqif_text.or_else(|| obj.desc.clone());

        let resolved_type = override_artifact_type
            .unwrap_or(artifact_type)
            .to_lowercase();
        let mapped_type = type_map
            .get(&resolved_type)
            .cloned()
            .unwrap_or(resolved_type);

        // Reconstruct provenance only if at least `created-by` was emitted.
        // Absence → `None` (backward-compatible with files lacking rivet
        // metadata).
        let provenance = prov_created_by.map(|created_by| Provenance {
            created_by,
            model: prov_model,
            session_id: prov_session_id,
            timestamp: prov_timestamp,
            reviewed_by: prov_reviewed_by,
        });

        let artifact = Artifact {
            id,
            artifact_type: mapped_type,
            title,
            description,
            status,
            tags,
            links: vec![], // filled in below from SPEC-RELATIONS
            fields,
            provenance,
            source_file: None,
        };
        artifacts.push(artifact);
    }

    // Build UUID -> resolved ID map (for StrictDoc where IDENTIFIER is a UUID
    // but we use ReqIF.ForeignID as the artifact ID).
    let uuid_to_id: HashMap<String, String> = content
        .spec_objects
        .objects
        .iter()
        .zip(artifacts.iter())
        .map(|(obj, art)| (obj.identifier.clone(), art.id.clone()))
        .collect();

    // Build id -> index map using resolved IDs.
    let artifact_ids: HashMap<String, usize> = artifacts
        .iter()
        .enumerate()
        .map(|(i, a)| (a.id.clone(), i))
        .collect();

    // Parse SPEC-RELATIONS into Links on source artifacts.
    for rel in &content.spec_relations.relations {
        let link_type = rel
            .relation_type_ref
            .as_ref()
            .and_then(|r| {
                relation_type_names
                    .get(r.spec_relation_type_ref.as_str())
                    .copied()
            })
            .unwrap_or("traces-to")
            .to_string();

        // Resolve UUID references to artifact IDs
        let source_id = uuid_to_id
            .get(&rel.source.spec_object_ref)
            .unwrap_or(&rel.source.spec_object_ref);
        let target_id = uuid_to_id
            .get(&rel.target.spec_object_ref)
            .unwrap_or(&rel.target.spec_object_ref);

        if let Some(&idx) = artifact_ids.get(source_id.as_str()) {
            artifacts[idx].links.push(Link {
                link_type,
                target: target_id.clone(),
            });
        }
    }

    Ok(artifacts)
}

// ── Export ───────────────────────────────────────────────────────────────

/// Build a ReqIF document from Rivet artifacts.
pub fn build_reqif(artifacts: &[Artifact]) -> ReqIfRoot {
    // Collect unique artifact types and link types.
    let mut artifact_types: Vec<String> = Vec::new();
    let mut link_types: Vec<String> = Vec::new();

    for a in artifacts {
        if !artifact_types.contains(&a.artifact_type) {
            artifact_types.push(a.artifact_type.clone());
        }
        for l in &a.links {
            if !link_types.contains(&l.link_type) {
                link_types.push(l.link_type.clone());
            }
        }
    }

    // Collect unique extra field names across all artifacts.
    let mut field_names: Vec<String> = Vec::new();
    for a in artifacts {
        for key in a.fields.keys() {
            if !field_names.contains(key) {
                field_names.push(key.clone());
            }
        }
    }

    // Build DATATYPE-DEFINITION-STRING.
    let datatypes = Datatypes {
        string_types: vec![DatatypeDefinitionString {
            identifier: DATATYPE_STRING_ID.into(),
            long_name: Some("String".into()),
            max_length: Some(65535),
        }],
        enum_types: vec![],
    };

    // Build SPEC-OBJECT-TYPEs — one per artifact type, each with standard
    // attribute definitions for status, tags, artifact-type, plus any extra fields.
    let object_types: Vec<SpecObjectType> = artifact_types
        .iter()
        .map(|at| {
            let type_id = format!("SOT-{at}");

            let mut string_attrs = vec![
                AttributeDefinitionString {
                    identifier: ATTR_DEF_STATUS.into(),
                    long_name: Some("status".into()),
                    datatype_ref: Some(DatatypeRef {
                        datatype_ref: DATATYPE_STRING_ID.into(),
                    }),
                },
                AttributeDefinitionString {
                    identifier: ATTR_DEF_TAGS.into(),
                    long_name: Some("tags".into()),
                    datatype_ref: Some(DatatypeRef {
                        datatype_ref: DATATYPE_STRING_ID.into(),
                    }),
                },
                AttributeDefinitionString {
                    identifier: ATTR_DEF_ARTIFACT_TYPE.into(),
                    long_name: Some("artifact-type".into()),
                    datatype_ref: Some(DatatypeRef {
                        datatype_ref: DATATYPE_STRING_ID.into(),
                    }),
                },
            ];

            // Rivet AI-provenance attribute definitions.  Emitted on every
            // SpecObjectType so tools that preserve attribute ordering don't
            // drop them; values are only set per-SpecObject when the source
            // Artifact carries provenance.
            for (ident, long_name) in [
                (ATTR_DEF_PROV_CREATED_BY, PROV_LONG_CREATED_BY),
                (ATTR_DEF_PROV_MODEL, PROV_LONG_MODEL),
                (ATTR_DEF_PROV_SESSION_ID, PROV_LONG_SESSION_ID),
                (ATTR_DEF_PROV_TIMESTAMP, PROV_LONG_TIMESTAMP),
                (ATTR_DEF_PROV_REVIEWED_BY, PROV_LONG_REVIEWED_BY),
            ] {
                string_attrs.push(AttributeDefinitionString {
                    identifier: ident.into(),
                    long_name: Some(long_name.into()),
                    datatype_ref: Some(DatatypeRef {
                        datatype_ref: DATATYPE_STRING_ID.into(),
                    }),
                });
            }

            for fname in &field_names {
                string_attrs.push(AttributeDefinitionString {
                    identifier: format!("ATTR-{fname}"),
                    long_name: Some(fname.clone()),
                    datatype_ref: Some(DatatypeRef {
                        datatype_ref: DATATYPE_STRING_ID.into(),
                    }),
                });
            }

            SpecObjectType {
                identifier: type_id,
                long_name: Some(at.clone()),
                spec_attributes: Some(SpecAttributes {
                    string_attrs,
                    enum_attrs: vec![],
                }),
            }
        })
        .collect();

    // Build SPEC-RELATION-TYPEs.
    let relation_types: Vec<SpecRelationType> = link_types
        .iter()
        .map(|lt| {
            let type_id = format!("SRT-{lt}");
            SpecRelationType {
                identifier: type_id,
                long_name: Some(lt.clone()),
            }
        })
        .collect();

    // Build SPEC-OBJECTs.
    let objects: Vec<SpecObject> = artifacts
        .iter()
        .map(|a| {
            let type_ref_id = format!("SOT-{}", a.artifact_type);

            let mut string_values = vec![
                AttributeValueString {
                    the_value: a.status.clone().unwrap_or_default(),
                    definition: AttrDefinitionRef {
                        attr_def_ref: ATTR_DEF_STATUS.into(),
                    },
                },
                AttributeValueString {
                    the_value: a.tags.join(", "),
                    definition: AttrDefinitionRef {
                        attr_def_ref: ATTR_DEF_TAGS.into(),
                    },
                },
                AttributeValueString {
                    the_value: a.artifact_type.clone(),
                    definition: AttrDefinitionRef {
                        attr_def_ref: ATTR_DEF_ARTIFACT_TYPE.into(),
                    },
                },
            ];

            // Emit rivet AI-provenance when present.  Fields with `None`
            // values are skipped — only the non-empty metadata survives.
            if let Some(p) = &a.provenance {
                let entries: [(&str, Option<&str>); 5] = [
                    (ATTR_DEF_PROV_CREATED_BY, Some(p.created_by.as_str())),
                    (ATTR_DEF_PROV_MODEL, p.model.as_deref()),
                    (ATTR_DEF_PROV_SESSION_ID, p.session_id.as_deref()),
                    (ATTR_DEF_PROV_TIMESTAMP, p.timestamp.as_deref()),
                    (ATTR_DEF_PROV_REVIEWED_BY, p.reviewed_by.as_deref()),
                ];
                for (ident, val) in entries {
                    if let Some(v) = val {
                        if !v.is_empty() {
                            string_values.push(AttributeValueString {
                                the_value: v.to_string(),
                                definition: AttrDefinitionRef {
                                    attr_def_ref: ident.into(),
                                },
                            });
                        }
                    }
                }
            }

            for (key, value) in &a.fields {
                if let Some(val_str) = encode_field_value(value) {
                    string_values.push(AttributeValueString {
                        the_value: val_str,
                        definition: AttrDefinitionRef {
                            attr_def_ref: format!("ATTR-{key}"),
                        },
                    });
                }
            }

            SpecObject {
                identifier: a.id.clone(),
                long_name: Some(a.title.clone()),
                desc: a.description.clone(),
                object_type_ref: Some(SpecObjectTypeRef {
                    spec_object_type_ref: type_ref_id,
                }),
                values: Some(Values {
                    string_values,
                    enum_values: vec![],
                }),
            }
        })
        .collect();

    // Build SPEC-RELATIONs.
    let mut relations: Vec<SpecRelation> = Vec::new();
    let mut rel_counter = 0u64;
    for a in artifacts {
        for link in &a.links {
            rel_counter += 1;
            let type_ref_id = format!("SRT-{}", link.link_type);
            relations.push(SpecRelation {
                identifier: format!("REL-{rel_counter}"),
                relation_type_ref: Some(SpecRelationTypeRef {
                    spec_relation_type_ref: type_ref_id,
                }),
                source: SpecRelationEnd {
                    spec_object_ref: a.id.clone(),
                },
                target: SpecRelationEnd {
                    spec_object_ref: link.target.clone(),
                },
            });
        }
    }

    ReqIfRoot {
        xmlns: REQIF_NAMESPACE.into(),
        the_header: TheHeader {
            req_if_header: ReqIfHeader {
                identifier: "rivet-export".into(),
                comment: Some("Generated by Rivet SDLC tool".into()),
                creation_time: None,
                repository_id: None,
                req_if_tool_id: Some("rivet".into()),
                req_if_version: Some("1.2".into()),
                source_tool_id: Some("rivet".into()),
                title: Some("Rivet ReqIF Export".into()),
            },
        },
        core_content: CoreContent {
            req_if_content: ReqIfContent {
                datatypes,
                spec_types: SpecTypes {
                    object_types,
                    relation_types,
                    specification_types: vec![],
                },
                spec_objects: SpecObjects { objects },
                spec_relations: SpecRelations { relations },
            },
        },
    }
}

/// Encode a `serde_yaml::Value` as a ReqIF ATTRIBUTE-VALUE-STRING string.
///
/// ReqIF 1.2's STRING attribute only carries text, so we apply explicit
/// type-aware conversions rather than Rust's `Debug` format (which emitted
/// gibberish like `"Bool(true)"` or `"Sequence [String(\"a\")]"`).
///
/// Conventions:
/// - `String(s)` → `s` verbatim.
/// - `Bool(b)`   → `"true"` / `"false"`.
/// - `Number(n)` → decimal string representation.
/// - `Sequence`  → JSON array representation (lossless, reversible).
/// - `Mapping`   → JSON object representation (ReqIF has no native map type).
/// - `Null`      → attribute omitted (returns `None`).
/// - `Tagged(t)` → recurse into inner value, tag itself is not preserved.
fn encode_field_value(value: &serde_yaml::Value) -> Option<String> {
    match value {
        serde_yaml::Value::Null => None,
        serde_yaml::Value::String(s) => Some(s.clone()),
        serde_yaml::Value::Bool(b) => Some(if *b { "true".into() } else { "false".into() }),
        serde_yaml::Value::Number(n) => Some(n.to_string()),
        serde_yaml::Value::Sequence(_) | serde_yaml::Value::Mapping(_) => {
            // JSON is both a well-understood interchange form and a YAML
            // subset, so the string remains valid input to serde_yaml on
            // import.
            serde_json::to_string(value).ok()
        }
        serde_yaml::Value::Tagged(t) => encode_field_value(&t.value),
    }
}

/// Attempt to recover the original `serde_yaml::Value` type from a ReqIF
/// ATTRIBUTE-VALUE-STRING written by `encode_field_value`.
///
/// This is best-effort type recovery for round-trip fidelity: values that
/// unambiguously parse as JSON booleans, numbers, arrays, or objects are
/// reconstructed as the matching YAML variant.  Anything that doesn't
/// parse — the common case for free-form text — is kept as a string.
fn decode_field_value(s: &str) -> serde_yaml::Value {
    // Strings that happen to round-trip through JSON unchanged (plain text
    // without a leading quote) must not be re-typed, so we only attempt
    // JSON recovery for content that looks like a JSON scalar/compound.
    let trimmed = s.trim_start();
    let looks_structured = trimmed.starts_with('{')
        || trimmed.starts_with('[')
        || trimmed == "true"
        || trimmed == "false"
        || trimmed
            .chars()
            .next()
            .is_some_and(|c| c == '-' || c.is_ascii_digit());

    if looks_structured {
        if let Ok(v) = serde_json::from_str::<serde_json::Value>(s) {
            if let Ok(yaml_v) = serde_yaml::to_value(&v) {
                return yaml_v;
            }
        }
    }
    serde_yaml::Value::String(s.to_string())
}

/// Serialize a ReqIF document to XML bytes.
pub fn serialize_reqif(root: &ReqIfRoot) -> Result<Vec<u8>, Error> {
    let xml_body = xml_to_string(root)
        .map_err(|e| Error::Adapter(format!("ReqIF XML serialize error: {e}")))?;

    // Prepend the XML declaration that quick-xml's serializer omits.
    let mut output = String::with_capacity(xml_body.len() + 50);
    output.push_str("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
    output.push_str(&xml_body);

    Ok(output.into_bytes())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn sample_artifacts() -> Vec<Artifact> {
        vec![
            Artifact {
                id: "REQ-001".into(),
                artifact_type: "requirement".into(),
                title: "Memory isolation".into(),
                description: Some("The system shall enforce memory isolation.".into()),
                status: Some("approved".into()),
                tags: vec!["safety".into(), "core".into()],
                links: vec![],
                fields: {
                    let mut f = BTreeMap::new();
                    f.insert("priority".into(), serde_yaml::Value::String("must".into()));
                    f
                },
                provenance: None,
                source_file: None,
            },
            Artifact {
                id: "TC-001".into(),
                artifact_type: "test-case".into(),
                title: "Test memory isolation".into(),
                description: None,
                status: Some("draft".into()),
                tags: vec![],
                links: vec![Link {
                    link_type: "verifies".into(),
                    target: "REQ-001".into(),
                }],
                fields: BTreeMap::new(),
                provenance: None,
                source_file: None,
            },
        ]
    }

    // rivet: verifies REQ-005
    #[test]
    #[cfg_attr(miri, ignore)] // quick-xml uses unsafe/SIMD internals that Miri cannot interpret
    fn test_export_produces_valid_xml() {
        let arts = sample_artifacts();
        let adapter = ReqIfAdapter::new();
        let config = AdapterConfig::default();
        let bytes = adapter.export(&arts, &config).unwrap();
        let xml = std::str::from_utf8(&bytes).unwrap();

        assert!(xml.starts_with("<?xml version=\"1.0\" encoding=\"UTF-8\"?>"));
        assert!(xml.contains("REQ-IF"));
        assert!(xml.contains("THE-HEADER"));
        assert!(xml.contains("SPEC-OBJECTS"));
        assert!(xml.contains("SPEC-RELATIONS"));
        assert!(xml.contains("SPEC-OBJECT-TYPE"));
        assert!(xml.contains("SPEC-RELATION-TYPE"));
        assert!(xml.contains(REQIF_NAMESPACE));
    }

    // rivet: verifies REQ-005
    #[test]
    #[cfg_attr(miri, ignore)] // quick-xml uses unsafe/SIMD internals that Miri cannot interpret
    fn test_roundtrip() {
        let original = sample_artifacts();
        let adapter = ReqIfAdapter::new();
        let config = AdapterConfig::default();

        let bytes = adapter.export(&original, &config).unwrap();
        let reimported = adapter
            .import(&AdapterSource::Bytes(bytes), &config)
            .unwrap();

        assert_eq!(reimported.len(), original.len());

        for (orig, re) in original.iter().zip(reimported.iter()) {
            assert_eq!(orig.id, re.id, "id mismatch");
            assert_eq!(
                orig.artifact_type, re.artifact_type,
                "artifact_type mismatch"
            );
            assert_eq!(orig.title, re.title, "title mismatch");
            assert_eq!(orig.description, re.description, "description mismatch");
            assert_eq!(orig.status, re.status, "status mismatch");
            assert_eq!(orig.tags, re.tags, "tags mismatch");
            assert_eq!(orig.links.len(), re.links.len(), "links len mismatch");
            for (ol, rl) in orig.links.iter().zip(re.links.iter()) {
                assert_eq!(ol.link_type, rl.link_type, "link_type mismatch");
                assert_eq!(ol.target, rl.target, "link target mismatch");
            }
            assert_eq!(orig.fields, re.fields, "fields mismatch");
        }
    }

    // rivet: verifies REQ-005
    #[test]
    #[cfg_attr(miri, ignore)] // quick-xml uses unsafe/SIMD internals that Miri cannot interpret
    fn test_parse_minimal_reqif() {
        let xml = r#"<?xml version="1.0" encoding="UTF-8"?>
<REQ-IF xmlns="http://www.omg.org/spec/ReqIF/20110401/reqif.xsd">
  <THE-HEADER>
    <REQ-IF-HEADER IDENTIFIER="test-header"/>
  </THE-HEADER>
  <CORE-CONTENT>
    <REQ-IF-CONTENT>
      <DATATYPES/>
      <SPEC-TYPES>
        <SPEC-OBJECT-TYPE IDENTIFIER="SOT-req" LONG-NAME="requirement"/>
      </SPEC-TYPES>
      <SPEC-OBJECTS>
        <SPEC-OBJECT IDENTIFIER="R-1" LONG-NAME="First req" DESC="A description">
          <TYPE><SPEC-OBJECT-TYPE-REF>SOT-req</SPEC-OBJECT-TYPE-REF></TYPE>
        </SPEC-OBJECT>
      </SPEC-OBJECTS>
      <SPEC-RELATIONS/>
    </REQ-IF-CONTENT>
  </CORE-CONTENT>
</REQ-IF>"#;

        let arts = parse_reqif(xml, &HashMap::new()).unwrap();
        assert_eq!(arts.len(), 1);
        assert_eq!(arts[0].id, "R-1");
        assert_eq!(arts[0].title, "First req");
        assert_eq!(arts[0].description, Some("A description".into()));
        assert_eq!(arts[0].artifact_type, "requirement");
    }

    /// StrictDoc exports may contain duplicate ATTRIBUTE-DEFINITION-STRING
    /// elements with the same IDENTIFIER. Rivet should tolerate this by
    /// keeping the first occurrence.
    // rivet: verifies REQ-005
    #[test]
    #[cfg_attr(miri, ignore)]
    fn test_duplicate_attribute_definitions() {
        let xml = r#"<?xml version="1.0" encoding="UTF-8"?>
<REQ-IF xmlns="http://www.omg.org/spec/ReqIF/20110401/reqif.xsd">
  <THE-HEADER>
    <REQ-IF-HEADER IDENTIFIER="dup-test"/>
  </THE-HEADER>
  <CORE-CONTENT>
    <REQ-IF-CONTENT>
      <DATATYPES/>
      <SPEC-TYPES>
        <SPEC-OBJECT-TYPE IDENTIFIER="SOT-req" LONG-NAME="requirement">
          <SPEC-ATTRIBUTES>
            <ATTRIBUTE-DEFINITION-STRING IDENTIFIER="ATTR-STATUS" LONG-NAME="status"/>
            <ATTRIBUTE-DEFINITION-STRING IDENTIFIER="ATTR-STATUS" LONG-NAME="status"/>
            <ATTRIBUTE-DEFINITION-STRING IDENTIFIER="ATTR-COMP" LONG-NAME="component"/>
          </SPEC-ATTRIBUTES>
        </SPEC-OBJECT-TYPE>
      </SPEC-TYPES>
      <SPEC-OBJECTS>
        <SPEC-OBJECT IDENTIFIER="R-1" LONG-NAME="Test req">
          <TYPE><SPEC-OBJECT-TYPE-REF>SOT-req</SPEC-OBJECT-TYPE-REF></TYPE>
          <VALUES>
            <ATTRIBUTE-VALUE-STRING THE-VALUE="Draft">
              <DEFINITION><ATTRIBUTE-DEFINITION-STRING-REF>ATTR-STATUS</ATTRIBUTE-DEFINITION-STRING-REF></DEFINITION>
            </ATTRIBUTE-VALUE-STRING>
            <ATTRIBUTE-VALUE-STRING THE-VALUE="Threads">
              <DEFINITION><ATTRIBUTE-DEFINITION-STRING-REF>ATTR-COMP</ATTRIBUTE-DEFINITION-STRING-REF></DEFINITION>
            </ATTRIBUTE-VALUE-STRING>
          </VALUES>
        </SPEC-OBJECT>
      </SPEC-OBJECTS>
      <SPEC-RELATIONS/>
    </REQ-IF-CONTENT>
  </CORE-CONTENT>
</REQ-IF>"#;

        let arts = parse_reqif(xml, &HashMap::new()).unwrap();
        assert_eq!(arts.len(), 1);
        assert_eq!(arts[0].status, Some("Draft".into()));
        // "component" field should be present despite duplicate ATTR-STATUS
        let comp = arts[0].fields.get("component");
        assert_eq!(comp, Some(&serde_yaml::Value::String("Threads".into())));
    }

    // rivet: verifies REQ-005
    #[test]
    #[cfg_attr(miri, ignore)]
    fn test_type_map_remaps_artifact_types() {
        let xml = r#"<?xml version="1.0" encoding="UTF-8"?>
<REQ-IF xmlns="http://www.omg.org/spec/ReqIF/20110401/reqif.xsd">
  <THE-HEADER>
    <REQ-IF-HEADER IDENTIFIER="map-test"/>
  </THE-HEADER>
  <CORE-CONTENT>
    <REQ-IF-CONTENT>
      <DATATYPES/>
      <SPEC-TYPES>
        <SPEC-OBJECT-TYPE IDENTIFIER="SOT-req" LONG-NAME="REQUIREMENT"/>
        <SPEC-OBJECT-TYPE IDENTIFIER="SOT-sec" LONG-NAME="SECTION"/>
      </SPEC-TYPES>
      <SPEC-OBJECTS>
        <SPEC-OBJECT IDENTIFIER="R-1" LONG-NAME="A requirement">
          <TYPE><SPEC-OBJECT-TYPE-REF>SOT-req</SPEC-OBJECT-TYPE-REF></TYPE>
        </SPEC-OBJECT>
        <SPEC-OBJECT IDENTIFIER="S-1" LONG-NAME="A section">
          <TYPE><SPEC-OBJECT-TYPE-REF>SOT-sec</SPEC-OBJECT-TYPE-REF></TYPE>
        </SPEC-OBJECT>
      </SPEC-OBJECTS>
      <SPEC-RELATIONS/>
    </REQ-IF-CONTENT>
  </CORE-CONTENT>
</REQ-IF>"#;

        // Without type map — original types
        let arts = parse_reqif(xml, &HashMap::new()).unwrap();
        assert_eq!(arts[0].artifact_type, "requirement");
        assert_eq!(arts[1].artifact_type, "section");

        // With type map — remapped types
        let mut type_map = HashMap::new();
        type_map.insert("requirement".to_string(), "sw-req".to_string());
        let arts = parse_reqif(xml, &type_map).unwrap();
        assert_eq!(arts[0].artifact_type, "sw-req");
        // Unmapped types pass through unchanged
        assert_eq!(arts[1].artifact_type, "section");
    }

    /// Provenance must round-trip through ReqIF.  Rivet's AI-provenance
    /// metadata is encoded as five `rivet:*` string attributes on every
    /// SpecObject.  Absence on the way in → `None` on the way out.
    ///
    /// Regression test for the bug documented in
    /// `docs/design/polarion-reqif-fidelity.md` row "provenance.*" where every
    /// provenance field was ABSENT on Path 2.
    // rivet: verifies REQ-025
    #[test]
    #[cfg_attr(miri, ignore)]
    fn test_provenance_roundtrip() {
        let art = Artifact {
            id: "REQ-PROV".into(),
            artifact_type: "requirement".into(),
            title: "Provenance carrier".into(),
            description: None,
            status: None,
            tags: vec![],
            links: vec![],
            fields: BTreeMap::new(),
            provenance: Some(Provenance {
                created_by: "ai-assisted".into(),
                model: Some("claude-opus-4-7".into()),
                session_id: Some("s-1234".into()),
                timestamp: Some("2026-04-19T12:34:56Z".into()),
                reviewed_by: Some("alice".into()),
            }),
            source_file: None,
        };

        let adapter = ReqIfAdapter::new();
        let config = AdapterConfig::default();
        let bytes = adapter.export(&[art.clone()], &config).unwrap();
        let re = adapter
            .import(&AdapterSource::Bytes(bytes), &config)
            .unwrap();

        assert_eq!(re.len(), 1);
        assert_eq!(re[0].provenance, art.provenance);
    }

    /// Non-string `fields` values must round-trip without Rust-`Debug`
    /// coercion.  Regression test for `reqif.rs:968-970` flagged in
    /// `docs/design/polarion-reqif-fidelity.md`: previously a bool field
    /// emitted `"Bool(true)"` instead of `"true"`, a list emitted the
    /// Rust-internal `Sequence[String("…")]` form.
    // rivet: verifies REQ-025
    #[test]
    #[cfg_attr(miri, ignore)]
    fn test_non_string_fields_roundtrip() {
        let mut fields: BTreeMap<String, serde_yaml::Value> = BTreeMap::new();
        fields.insert("safety-critical".into(), serde_yaml::Value::Bool(true));
        fields.insert(
            "asil-level".into(),
            serde_yaml::Value::Number(serde_yaml::Number::from(3i64)),
        );
        fields.insert(
            "confidence".into(),
            serde_yaml::Value::Number(serde_yaml::Number::from(0.85f64)),
        );
        fields.insert(
            "aliases".into(),
            serde_yaml::Value::Sequence(vec![
                serde_yaml::Value::String("req-a".into()),
                serde_yaml::Value::String("req-b".into()),
            ]),
        );

        let art = Artifact {
            id: "REQ-FIELDS".into(),
            artifact_type: "requirement".into(),
            title: "Typed fields".into(),
            description: None,
            status: None,
            tags: vec![],
            links: vec![],
            fields: fields.clone(),
            provenance: None,
            source_file: None,
        };

        let adapter = ReqIfAdapter::new();
        let config = AdapterConfig::default();
        let bytes = adapter.export(&[art], &config).unwrap();

        // The raw XML must not contain Rust `Debug` form artefacts like
        // `Bool(`, `Number(`, or `Sequence[`.  Those would indicate the bug
        // has regressed.
        let xml = std::str::from_utf8(&bytes).unwrap();
        assert!(
            !xml.contains("Bool("),
            "Debug-form Bool leaked into XML: {xml}"
        );
        assert!(
            !xml.contains("Sequence ["),
            "Debug-form Sequence leaked into XML: {xml}"
        );
        assert!(!xml.contains("Number("), "Debug-form Number leaked");

        let re = adapter
            .import(&AdapterSource::Bytes(bytes), &config)
            .unwrap();
        assert_eq!(re.len(), 1);
        assert_eq!(
            re[0].fields.get("safety-critical"),
            Some(&serde_yaml::Value::Bool(true))
        );
        // Integer equality via Number.
        let asil = re[0].fields.get("asil-level").unwrap();
        if let serde_yaml::Value::Number(n) = asil {
            assert_eq!(n.as_i64(), Some(3));
        } else {
            panic!("asil-level lost its number type: {asil:?}");
        }
        // Float equality.
        let conf = re[0].fields.get("confidence").unwrap();
        if let serde_yaml::Value::Number(n) = conf {
            assert!((n.as_f64().unwrap() - 0.85).abs() < 1e-9);
        } else {
            panic!("confidence lost its number type: {conf:?}");
        }
        // Sequence recovered.
        let aliases = re[0].fields.get("aliases").unwrap();
        if let serde_yaml::Value::Sequence(items) = aliases {
            assert_eq!(items.len(), 2);
        } else {
            panic!("aliases did not round-trip as sequence: {aliases:?}");
        }
    }

    /// Null field values are dropped (not emitted as empty attributes).
    // rivet: verifies REQ-025
    #[test]
    #[cfg_attr(miri, ignore)]
    fn test_null_field_dropped_on_export() {
        let mut fields: BTreeMap<String, serde_yaml::Value> = BTreeMap::new();
        fields.insert("deprecated".into(), serde_yaml::Value::Null);
        let art = Artifact {
            id: "REQ-NULL".into(),
            artifact_type: "requirement".into(),
            title: "Null field".into(),
            description: None,
            status: None,
            tags: vec![],
            links: vec![],
            fields,
            provenance: None,
            source_file: None,
        };
        let adapter = ReqIfAdapter::new();
        let bytes = adapter.export(&[art], &AdapterConfig::default()).unwrap();
        let re = adapter
            .import(&AdapterSource::Bytes(bytes), &AdapterConfig::default())
            .unwrap();
        assert_eq!(re.len(), 1);
        // Null is not present after round-trip (attribute omitted).
        assert!(re[0].fields.get("deprecated").is_none());
    }

    /// Files without any provenance attributes parse back to `None` — the
    /// backward-compatibility contract.
    // rivet: verifies REQ-025
    #[test]
    #[cfg_attr(miri, ignore)]
    fn test_provenance_absent_stays_none() {
        let art = Artifact {
            id: "REQ-NOPROV".into(),
            artifact_type: "requirement".into(),
            title: "No provenance".into(),
            description: None,
            status: None,
            tags: vec![],
            links: vec![],
            fields: BTreeMap::new(),
            provenance: None,
            source_file: None,
        };
        let adapter = ReqIfAdapter::new();
        let config = AdapterConfig::default();
        let bytes = adapter.export(&[art], &config).unwrap();
        let re = adapter
            .import(&AdapterSource::Bytes(bytes), &config)
            .unwrap();
        assert_eq!(re.len(), 1);
        assert!(re[0].provenance.is_none());
    }
}

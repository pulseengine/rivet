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
use crate::schema::Schema;

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
    /// Optional schema used on export to emit `DATATYPE-DEFINITION-ENUMERATION`
    /// for fields whose schema declares `allowed-values`.  When `None`, the
    /// exporter falls back to flat STRING attributes for all fields.
    schema: Option<Schema>,
}

impl ReqIfAdapter {
    pub fn new() -> Self {
        Self {
            supported: vec![], // accepts all types
            schema: None,
        }
    }

    /// Attach a schema to drive enum-aware export.  When artifacts carry
    /// fields whose schema declares `allowed-values`, the exporter emits a
    /// `DATATYPE-DEFINITION-ENUMERATION` and an `ATTRIBUTE-DEFINITION-ENUMERATION`
    /// on the SpecObjectType, instead of a flat STRING attribute.  Import is
    /// unchanged — it already recognises ENUMERATION values.
    pub fn with_schema(mut self, schema: Schema) -> Self {
        self.schema = Some(schema);
        self
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
        let reqif = build_reqif_with_schema(artifacts, self.schema.as_ref());
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
                        tags = decode_tags(&av.the_value);
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
                            tags = decode_tags(&value);
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

/// Internal per-field metadata for schema-driven ENUMERATION emission.
///
/// Computed once per (artifact-type, field-name) pair whose schema carries
/// `allowed-values`; re-used when emitting the DATATYPE, the
/// ATTRIBUTE-DEFINITION, and each ATTRIBUTE-VALUE.
struct EnumFieldMeta {
    /// `DATATYPE-DEFINITION-ENUMERATION` identifier.
    datatype_id: String,
    /// `ATTRIBUTE-DEFINITION-ENUMERATION` identifier on the SpecObjectType.
    attr_def_id: String,
    /// Enum value identifiers, one per allowed value (same order).
    value_ids: Vec<String>,
    /// Allowed label strings (the schema's `allowed-values` array).
    allowed: Vec<String>,
}

/// Build a ReqIF document from Rivet artifacts.
///
/// Shorthand for `build_reqif_with_schema(artifacts, None)` — emits flat
/// STRING attributes for every field, ignoring `allowed-values` constraints.
pub fn build_reqif(artifacts: &[Artifact]) -> ReqIfRoot {
    build_reqif_with_schema(artifacts, None)
}

/// Build a ReqIF document from Rivet artifacts, optionally consulting a
/// Schema to emit `DATATYPE-DEFINITION-ENUMERATION` constraints.
///
/// When `schema` is `Some`, fields whose schema declares `allowed-values`
/// are emitted as `ATTRIBUTE-DEFINITION-ENUMERATION` on the SpecObjectType
/// and as `ATTRIBUTE-VALUE-ENUMERATION` on each SpecObject.  Other fields
/// still use STRING attributes.  When `schema` is `None`, all fields are
/// STRING (legacy behaviour).
pub fn build_reqif_with_schema(artifacts: &[Artifact], schema: Option<&Schema>) -> ReqIfRoot {
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

    // Precompute schema-driven enum metadata per (artifact_type, field_name):
    //   enum_meta[(at, field)] = (datatype_id, attr_def_id, [enum_value_id, ...])
    // This is empty when `schema` is None or no enum fields apply.
    let mut enum_meta: std::collections::BTreeMap<(String, String), EnumFieldMeta> =
        std::collections::BTreeMap::new();
    if let Some(sch) = schema {
        for at in &artifact_types {
            let Some(atdef) = sch.artifact_types.get(at) else {
                continue;
            };
            for fdef in &atdef.fields {
                let Some(allowed) = &fdef.allowed_values else {
                    continue;
                };
                if allowed.is_empty() {
                    continue;
                }
                // Datatypes, attribute-defs, and enum-values need globally-unique
                // identifiers.  Namespacing with artifact-type keeps per-type
                // allowed-values sets separate when the same field name appears
                // on multiple types with different constraints.
                let datatype_id = format!("DT-ENUM-{at}-{}", fdef.name);
                let attr_def_id = format!("ATTR-ENUM-{at}-{}", fdef.name);
                let value_ids: Vec<String> = allowed
                    .iter()
                    .enumerate()
                    .map(|(i, _)| format!("{datatype_id}-V{i}"))
                    .collect();
                enum_meta.insert(
                    (at.clone(), fdef.name.clone()),
                    EnumFieldMeta {
                        datatype_id,
                        attr_def_id,
                        value_ids,
                        allowed: allowed.clone(),
                    },
                );
            }
        }
    }

    // Build DATATYPE-DEFINITION-STRING + optional ENUMERATION datatypes.
    let mut enum_types: Vec<DatatypeDefinitionEnumeration> = Vec::new();
    for meta in enum_meta.values() {
        let values: Vec<EnumValue> = meta
            .allowed
            .iter()
            .zip(meta.value_ids.iter())
            .map(|(label, id)| EnumValue {
                identifier: id.clone(),
                long_name: Some(label.clone()),
            })
            .collect();
        enum_types.push(DatatypeDefinitionEnumeration {
            identifier: meta.datatype_id.clone(),
            long_name: Some(format!("Enum-{}", meta.datatype_id)),
            specified_values: Some(SpecifiedValues { values }),
        });
    }

    let datatypes = Datatypes {
        string_types: vec![DatatypeDefinitionString {
            identifier: DATATYPE_STRING_ID.into(),
            long_name: Some("String".into()),
            max_length: Some(65535),
        }],
        enum_types,
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

            let mut enum_attrs: Vec<AttributeDefinitionEnumeration> = Vec::new();
            for fname in &field_names {
                // Prefer ENUMERATION when the schema declares allowed-values
                // for this (artifact-type, field) pair.
                if let Some(meta) = enum_meta.get(&(at.clone(), fname.clone())) {
                    enum_attrs.push(AttributeDefinitionEnumeration {
                        identifier: meta.attr_def_id.clone(),
                        long_name: Some(fname.clone()),
                    });
                } else {
                    string_attrs.push(AttributeDefinitionString {
                        identifier: format!("ATTR-{fname}"),
                        long_name: Some(fname.clone()),
                        datatype_ref: Some(DatatypeRef {
                            datatype_ref: DATATYPE_STRING_ID.into(),
                        }),
                    });
                }
            }

            SpecObjectType {
                identifier: type_id,
                long_name: Some(at.clone()),
                spec_attributes: Some(SpecAttributes {
                    string_attrs,
                    enum_attrs,
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
                    the_value: encode_tags(&a.tags),
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

            let mut enum_values: Vec<AttributeValueEnumeration> = Vec::new();
            for (key, value) in &a.fields {
                if let Some(meta) = enum_meta.get(&(a.artifact_type.clone(), key.clone())) {
                    // Schema-driven ENUMERATION.  The value must match one of
                    // the allowed labels; if it doesn't, fall back to a STRING
                    // attribute so the raw value isn't silently dropped.
                    let label = match value {
                        serde_yaml::Value::String(s) => s.clone(),
                        other => encode_field_value(other).unwrap_or_default(),
                    };
                    if let Some(pos) = meta.allowed.iter().position(|a| a == &label) {
                        enum_values.push(AttributeValueEnumeration {
                            values: Some(EnumValueRefs {
                                refs: vec![meta.value_ids[pos].clone()],
                            }),
                            definition: EnumAttrDefinitionRef {
                                attr_def_ref: meta.attr_def_id.clone(),
                            },
                        });
                        continue;
                    }
                    // Out-of-enum value: emit as STRING with the original
                    // attribute name so downstream validate.rs can flag it.
                }
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
                    enum_values,
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
                creation_time: Some(reqif_creation_timestamp()),
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

/// Current UTC timestamp in ISO 8601 format, for the REQ-IF-HEADER
/// CREATION-TIME element.  Inline implementation (no chrono/jiff dep) —
/// see `export.rs::timestamp_now` for the same algorithm used in HTML
/// export.  Uses Howard Hinnant's civil_from_days algorithm for the
/// year/month/day breakdown; no leap-second handling.
fn reqif_creation_timestamp() -> String {
    let now = std::time::SystemTime::now();
    let duration = now
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default();
    let secs = duration.as_secs();
    let days = secs / 86400;
    let time_secs = secs % 86400;
    let hours = time_secs / 3600;
    let minutes = (time_secs % 3600) / 60;
    let seconds = time_secs % 60;
    let (year, month, day) = {
        let days = days + 719_468;
        let era = days / 146_097;
        let doe = days - era * 146_097;
        let yoe = (doe - doe / 1460 + doe / 36524 - doe / 146_096) / 365;
        let y = yoe + era * 400;
        let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
        let mp = (5 * doy + 2) / 153;
        let d = doy - (153 * mp + 2) / 5 + 1;
        let m = if mp < 10 { mp + 3 } else { mp - 9 };
        let y = if m <= 2 { y + 1 } else { y };
        (y, m, d)
    };
    format!("{year:04}-{month:02}-{day:02}T{hours:02}:{minutes:02}:{seconds:02}Z")
}

/// Encode `tags` as a JSON array string for ReqIF transport.
///
/// The previous implementation joined with `", "` and split on `,` — any
/// tag containing a comma (e.g. `"safety, critical"`) or leading
/// whitespace got mangled on round-trip.  JSON array form is predictable,
/// reversible, and uses a well-known escaping convention that all ReqIF
/// consumers understand as a plain string.
///
/// For backward compatibility the importer also accepts the legacy
/// comma-joined form, so files produced by older rivet versions or other
/// tools keep working (see `decode_tags`).
fn encode_tags(tags: &[String]) -> String {
    if tags.is_empty() {
        return String::new();
    }
    serde_json::to_string(tags).unwrap_or_default()
}

/// Decode a tags attribute value.  Preferred form is a JSON array;
/// falls back to comma-split for backward compatibility.
fn decode_tags(s: &str) -> Vec<String> {
    let trimmed = s.trim_start();
    if trimmed.starts_with('[') {
        if let Ok(v) = serde_json::from_str::<Vec<String>>(s) {
            return v;
        }
    }
    s.split(',')
        .map(|t| t.trim().to_string())
        .filter(|t| !t.is_empty())
        .collect()
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

    /// Tags containing commas or leading whitespace must round-trip intact.
    /// Regression for the bug at `reqif.rs:953-958` vs `reqif.rs:672-679`:
    /// previously the exporter joined with `, ` and the importer split on
    /// `,`, so any tag with a comma was silently split on re-import.
    // rivet: verifies REQ-025
    #[test]
    #[cfg_attr(miri, ignore)]
    fn test_tags_with_special_chars_roundtrip() {
        let art = Artifact {
            id: "REQ-TAGS".into(),
            artifact_type: "requirement".into(),
            title: "Tags with specials".into(),
            description: None,
            status: None,
            tags: vec![
                "safety, critical".into(), // contains comma
                " leading-space".into(),   // leading whitespace
                "plain".into(),
                "with \"quotes\"".into(),
            ],
            links: vec![],
            fields: BTreeMap::new(),
            provenance: None,
            source_file: None,
        };

        let adapter = ReqIfAdapter::new();
        let config = AdapterConfig::default();
        let bytes = adapter.export(&[art.clone()], &config).unwrap();
        let re = adapter
            .import(&AdapterSource::Bytes(bytes), &config)
            .unwrap();
        assert_eq!(re.len(), 1);
        assert_eq!(
            re[0].tags, art.tags,
            "tags with commas/whitespace lost on round-trip"
        );
    }

    /// The exported REQ-IF-HEADER must carry a non-empty CREATION-TIME in
    /// ISO-8601 UTC form.  Regression for the hardcoded `creation_time: None`
    /// flagged in the fidelity scorecard.
    // rivet: verifies REQ-025
    #[test]
    #[cfg_attr(miri, ignore)]
    fn test_creation_time_is_stamped() {
        let arts = sample_artifacts();
        let adapter = ReqIfAdapter::new();
        let bytes = adapter.export(&arts, &AdapterConfig::default()).unwrap();
        let xml = std::str::from_utf8(&bytes).unwrap();

        // Element must be present and non-empty.
        assert!(
            xml.contains("<CREATION-TIME>"),
            "CREATION-TIME missing from exported XML: {xml}"
        );
        assert!(
            !xml.contains("<CREATION-TIME></CREATION-TIME>"),
            "CREATION-TIME is empty in exported XML"
        );

        // Re-parse and confirm the header field round-trips.
        let root: ReqIfRoot = quick_xml::de::from_str(xml).unwrap();
        let ct = root.the_header.req_if_header.creation_time.as_deref();
        assert!(ct.is_some(), "creation_time deserialized as None");
        let ct = ct.unwrap();
        // ISO 8601 form: YYYY-MM-DDTHH:MM:SSZ (20 chars).
        assert_eq!(ct.len(), 20, "creation_time not ISO 8601: {ct}");
        assert!(ct.ends_with('Z'));
        assert!(ct.contains('T'));
    }

    /// When the schema declares `allowed-values` for a field, the exporter
    /// must emit `DATATYPE-DEFINITION-ENUMERATION` plus
    /// `ATTRIBUTE-DEFINITION-ENUMERATION` rather than a flat STRING.
    /// Regression for the bug at `reqif.rs:871-874` flagged in
    /// `docs/design/polarion-reqif-fidelity.md`: the exporter previously
    /// never emitted any ENUMERATION, silently flattening closed-enum
    /// schema constraints.
    // rivet: verifies REQ-025
    #[test]
    #[cfg_attr(miri, ignore)]
    fn test_schema_enum_field_emits_enumeration() {
        use crate::schema::{ArtifactTypeDef, FieldDef, Schema};
        use std::collections::HashMap;

        let atdef = ArtifactTypeDef {
            name: "hazard".into(),
            description: "Safety hazard".into(),
            fields: vec![FieldDef {
                name: "severity".into(),
                field_type: "string".into(),
                required: false,
                description: None,
                allowed_values: Some(vec![
                    "catastrophic".into(),
                    "critical".into(),
                    "marginal".into(),
                    "negligible".into(),
                ]),
            }],
            link_fields: vec![],
            aspice_process: None,
            common_mistakes: vec![],
            example: None,
            yaml_section: None,
            yaml_sections: vec![],
            yaml_section_suffix: None,
            shorthand_links: Default::default(),
        };
        let mut at_map = HashMap::new();
        at_map.insert("hazard".to_string(), atdef);
        let schema = Schema {
            artifact_types: at_map,
            link_types: HashMap::new(),
            inverse_map: HashMap::new(),
            traceability_rules: vec![],
            conditional_rules: vec![],
        };

        let mut fields: BTreeMap<String, serde_yaml::Value> = BTreeMap::new();
        fields.insert(
            "severity".into(),
            serde_yaml::Value::String("critical".into()),
        );
        let art = Artifact {
            id: "H-1".into(),
            artifact_type: "hazard".into(),
            title: "Runaway train".into(),
            description: None,
            status: None,
            tags: vec![],
            links: vec![],
            fields,
            provenance: None,
            source_file: None,
        };

        let adapter = ReqIfAdapter::new().with_schema(schema);
        let bytes = adapter.export(&[art], &AdapterConfig::default()).unwrap();
        let xml = std::str::from_utf8(&bytes).unwrap();

        // Must contain ENUMERATION elements — not just STRING.
        assert!(
            xml.contains("DATATYPE-DEFINITION-ENUMERATION"),
            "no DATATYPE-DEFINITION-ENUMERATION in export: {xml}"
        );
        assert!(
            xml.contains("ATTRIBUTE-DEFINITION-ENUMERATION"),
            "no ATTRIBUTE-DEFINITION-ENUMERATION in export: {xml}"
        );
        assert!(
            xml.contains("ATTRIBUTE-VALUE-ENUMERATION"),
            "no ATTRIBUTE-VALUE-ENUMERATION in export: {xml}"
        );
        // All allowed values must appear as ENUM-VALUE LONG-NAMEs.
        for v in ["catastrophic", "critical", "marginal", "negligible"] {
            assert!(
                xml.contains(v),
                "allowed value {v} missing from enum datatype"
            );
        }

        // Import round-trip: the enum-valued field comes back as a string
        // with the long-name of the referenced enum value.
        let re = adapter
            .import(&AdapterSource::Bytes(bytes), &AdapterConfig::default())
            .unwrap();
        assert_eq!(re.len(), 1);
        assert_eq!(
            re[0].fields.get("severity"),
            Some(&serde_yaml::Value::String("critical".into()))
        );
    }

    /// Without a schema, exports fall back to flat STRING attributes for
    /// fields — backward compatibility with adapter callers that pre-date
    /// `with_schema`.
    // rivet: verifies REQ-025
    #[test]
    #[cfg_attr(miri, ignore)]
    fn test_export_without_schema_stays_string() {
        let mut fields: BTreeMap<String, serde_yaml::Value> = BTreeMap::new();
        fields.insert(
            "severity".into(),
            serde_yaml::Value::String("critical".into()),
        );
        let art = Artifact {
            id: "H-1".into(),
            artifact_type: "hazard".into(),
            title: "Runaway train".into(),
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
        let xml = std::str::from_utf8(&bytes).unwrap();
        assert!(
            !xml.contains("DATATYPE-DEFINITION-ENUMERATION"),
            "unexpected ENUMERATION emitted without schema: {xml}"
        );
    }

    /// Legacy comma-joined tags (from older rivet exports or other tools)
    /// are still parsed correctly on import — backward-compat contract.
    // rivet: verifies REQ-025
    #[test]
    #[cfg_attr(miri, ignore)]
    fn test_tags_legacy_comma_form_parses() {
        assert_eq!(
            decode_tags("alpha, beta , gamma"),
            vec!["alpha".to_string(), "beta".to_string(), "gamma".to_string()]
        );
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

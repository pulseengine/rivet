pub mod aadl;
pub mod generic;
pub mod needs_json;

// Note: The aadl module is always compiled. When the "aadl" feature is
// enabled (default), it uses spar-hir/spar-analysis for direct parsing.
// Without the feature, directory/file import of .aadl files returns an error
// but JSON import still works for test compatibility.

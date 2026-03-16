use thiserror::Error as ThisError;

#[derive(Debug, ThisError)]
pub enum Error {
    #[error("IO error: {0}")]
    Io(String),

    #[error("YAML parse error: {0}")]
    Yaml(#[from] serde_yaml::Error),

    #[error("Schema error: {0}")]
    Schema(String),

    #[error("Validation error: {0}")]
    Validation(String),

    #[error("Adapter error: {0}")]
    Adapter(String),

    #[error("Link error: {0}")]
    Link(String),

    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Results error: {0}")]
    Results(String),
}

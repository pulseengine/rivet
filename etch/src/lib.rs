//! # etch
//!
//! Hierarchical graph layout and SVG rendering for PulseEngine tools.
//!
//! This crate provides a domain-agnostic Sugiyama-style layered DAG layout
//! algorithm and an SVG renderer.  It is shared between **rivet** (SDLC
//! traceability) and **spar** (AADL architecture) — so it intentionally knows
//! nothing about artifacts, requirements, or AADL components.  Callers supply
//! a `petgraph::Graph` plus closures that extract display-level information
//! from their own node/edge types.
//!
//! ## Quick start
//!
//! ```rust
//! use petgraph::Graph;
//! use etch::{
//!     layout::{layout, LayoutOptions, NodeInfo, EdgeInfo},
//!     svg::{render_svg, SvgOptions},
//! };
//!
//! let mut g = Graph::<&str, &str>::new();
//! let a = g.add_node("A");
//! let b = g.add_node("B");
//! g.add_edge(a, b, "links-to");
//!
//! let gl = layout(
//!     &g,
//!     &|_idx, n| NodeInfo { id: n.to_string(), label: n.to_string(), node_type: "default".into(), sublabel: None, parent: None, ports: vec![] },
//!     &|_idx, e| EdgeInfo { label: e.to_string(), source_port: None, target_port: None },
//!     &LayoutOptions::default(),
//! );
//!
//! let svg = render_svg(&gl, &SvgOptions::default());
//! assert!(svg.contains("<svg"));
//! ```

pub mod filter;
pub mod layout;
pub mod ortho;
pub mod svg;

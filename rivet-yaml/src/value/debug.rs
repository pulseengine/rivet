// Ported from serde_yaml 0.9.34 — https://github.com/dtolnay/serde-yaml
// Copyright (c) David Tolnay. Licensed MIT OR Apache-2.0; used here under
// Apache-2.0. See rivet-yaml/NOTICE.
//
// REQ-346: serde_yaml was archived upstream (0.9.34+deprecated, 2024-03-25).
// The value model below is safe Rust with no dependency on the unmaintained
// libyaml translation, so rivet takes ownership of it verbatim rather than
// re-deriving its semantics — `Mapping::remove` being `swap_remove`, float
// normalisation in `Number`'s `Eq`/`Hash`, the tagged-value protocol. Changes
// from upstream are limited to module paths unless marked `RIVET:`.

use crate::mapping::Mapping;
use crate::value::{Number, Value};
use std::fmt::{self, Debug, Display};

impl Debug for Value {
    fn fmt(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
        match self {
            Value::Null => formatter.write_str("Null"),
            Value::Bool(boolean) => write!(formatter, "Bool({})", boolean),
            Value::Number(number) => write!(formatter, "Number({})", number),
            Value::String(string) => write!(formatter, "String({:?})", string),
            Value::Sequence(sequence) => {
                formatter.write_str("Sequence ")?;
                formatter.debug_list().entries(sequence).finish()
            }
            Value::Mapping(mapping) => Debug::fmt(mapping, formatter),
            Value::Tagged(tagged) => Debug::fmt(tagged, formatter),
        }
    }
}

struct DisplayNumber<'a>(&'a Number);

impl<'a> Debug for DisplayNumber<'a> {
    fn fmt(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
        Display::fmt(self.0, formatter)
    }
}

impl Debug for Number {
    fn fmt(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
        write!(formatter, "Number({})", self)
    }
}

impl Debug for Mapping {
    fn fmt(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
        formatter.write_str("Mapping ")?;
        let mut debug = formatter.debug_map();
        for (k, v) in self {
            let tmp;
            debug.entry(
                match k {
                    Value::Bool(boolean) => boolean,
                    Value::Number(number) => {
                        tmp = DisplayNumber(number);
                        &tmp
                    }
                    Value::String(string) => string,
                    _ => k,
                },
                v,
            );
        }
        debug.finish()
    }
}

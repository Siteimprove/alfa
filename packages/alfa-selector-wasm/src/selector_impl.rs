//! Selector implementation configuration for Alfa.
//!
//! Defines the concrete types the `selectors` crate is generic over. For the
//! Milestone 1 PoC we use `String` for all name/atom types and minimal, empty
//! enums for pseudo-classes and pseudo-elements (no non-tree-structural
//! pseudo-classes are matched yet).

use std::borrow::Borrow;
use std::fmt;

use cssparser::{serialize_identifier, ToCss};
use precomputed_hash::PrecomputedHash;
use selectors::parser::{NonTSPseudoClass, PseudoElement, SelectorImpl};

/// A string wrapper satisfying the trait bounds the `selectors` crate imposes
/// on its atom/name associated types (`ToCss`, `PrecomputedHash`, `From<&str>`,
/// `Borrow<str>`, `Default`).
#[derive(Debug, Clone, PartialEq, Eq, Default, Hash)]
pub struct Atom(pub String);

impl From<&str> for Atom {
    fn from(value: &str) -> Self {
        Atom(value.to_owned())
    }
}

impl Borrow<str> for Atom {
    fn borrow(&self) -> &str {
        &self.0
    }
}

impl AsRef<str> for Atom {
    fn as_ref(&self) -> &str {
        &self.0
    }
}

impl PrecomputedHash for Atom {
    fn precomputed_hash(&self) -> u32 {
        // A cheap FNV-1a hash over the bytes. Sufficient for bloom-filter and
        // bucketing use; not required to be stable across runs.
        let mut hash: u32 = 0x811c_9dc5;
        for byte in self.0.as_bytes() {
            hash ^= *byte as u32;
            hash = hash.wrapping_mul(0x0100_0193);
        }
        hash
    }
}

impl ToCss for Atom {
    fn to_css<W>(&self, dest: &mut W) -> fmt::Result
    where
        W: fmt::Write,
    {
        serialize_identifier(&self.0, dest)
    }
}

#[derive(Debug, Clone)]
pub struct AlfaSelectorImpl;

impl SelectorImpl for AlfaSelectorImpl {
    type ExtraMatchingData<'a> = ();
    type AttrValue = Atom;
    type Identifier = Atom;
    type LocalName = Atom;
    type NamespaceUrl = Atom;
    type NamespacePrefix = Atom;
    type BorrowedNamespaceUrl = str;
    type BorrowedLocalName = str;
    type NonTSPseudoClass = AlfaPseudoClass;
    type PseudoElement = AlfaPseudoElement;
}

/// Non tree-structural pseudo-classes.
///
/// Empty for the PoC. Tree-structural pseudo-classes (`:root`, `:empty`,
/// `:nth-child`, etc.) are handled by the `selectors` crate directly via the
/// `Element` trait and do not need to appear here.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum AlfaPseudoClass {}

impl ToCss for AlfaPseudoClass {
    fn to_css<W>(&self, _dest: &mut W) -> fmt::Result
    where
        W: fmt::Write,
    {
        match *self {}
    }
}

impl NonTSPseudoClass for AlfaPseudoClass {
    type Impl = AlfaSelectorImpl;

    fn is_active_or_hover(&self) -> bool {
        match *self {}
    }

    fn is_user_action_state(&self) -> bool {
        match *self {}
    }
}

/// Pseudo-elements.
///
/// Empty for the PoC.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum AlfaPseudoElement {}

impl ToCss for AlfaPseudoElement {
    fn to_css<W>(&self, _dest: &mut W) -> fmt::Result
    where
        W: fmt::Write,
    {
        match *self {}
    }
}

impl PseudoElement for AlfaPseudoElement {
    type Impl = AlfaSelectorImpl;
}

//! An in-memory DOM and its `selectors::Element` implementation.
//!
//! The DOM is a flat arena of element nodes held in thread-local storage.
//! Elements are referenced by a lightweight `Copy` handle (`ElementRef`),
//! satisfying the `Element: Clone` requirement while keeping traversal cheap.
//! The arena is populated by deserializing the binary format produced by the
//! TypeScript side (see `serialization.rs`).

use std::cell::RefCell;

use selectors::attr::{AttrSelectorOperation, CaseSensitivity, NamespaceConstraint};
use selectors::bloom::BloomFilter;
use selectors::context::MatchingContext;
use selectors::matching::ElementSelectorFlags;
use selectors::{Element, OpaqueElement};

use crate::selector_impl::{Atom, AlfaPseudoClass, AlfaPseudoElement, AlfaSelectorImpl};

/// A single element node in the arena.
///
/// Tree relationships are stored as explicit O(1) pointers (matching the binary
/// serialization format) rather than child vectors.
#[derive(Debug, Clone)]
pub struct ElementData {
    pub local_name: String,
    /// Empty string means "no namespace".
    pub namespace: String,
    pub id: Option<String>,
    pub classes: Vec<String>,
    /// (local_name, value) attribute pairs, no-namespace only for now.
    pub attributes: Vec<(String, String)>,
    pub parent: Option<usize>,
    pub first_child: Option<usize>,
    pub next_sibling: Option<usize>,
    pub prev_sibling: Option<usize>,
    pub is_root: bool,
}

thread_local! {
    static DOM: RefCell<Vec<ElementData>> = const { RefCell::new(Vec::new()) };
}

/// Replace the current thread-local DOM with `elements`.
pub fn set_dom(elements: Vec<ElementData>) {
    DOM.with(|dom| *dom.borrow_mut() = elements);
}

/// Clear the current thread-local DOM.
pub fn clear_dom() {
    DOM.with(|dom| dom.borrow_mut().clear());
}

fn with_element<T>(index: usize, f: impl FnOnce(&ElementData) -> T) -> T {
    DOM.with(|dom| f(&dom.borrow()[index]))
}

/// A `Copy` handle into the thread-local DOM arena.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct ElementRef(pub usize);

impl ElementRef {
    fn data<T>(&self, f: impl FnOnce(&ElementData) -> T) -> T {
        with_element(self.0, f)
    }
}

impl Element for ElementRef {
    type Impl = AlfaSelectorImpl;

    fn opaque(&self) -> OpaqueElement {
        // The index uniquely identifies the element; hand the crate a pointer
        // derived from it purely for identity comparisons.
        OpaqueElement::new(&self.0)
    }

    fn parent_element(&self) -> Option<Self> {
        self.data(|e| e.parent).map(ElementRef)
    }

    fn parent_node_is_shadow_root(&self) -> bool {
        false
    }

    fn containing_shadow_host(&self) -> Option<Self> {
        None
    }

    fn is_pseudo_element(&self) -> bool {
        false
    }

    fn prev_sibling_element(&self) -> Option<Self> {
        self.data(|e| e.prev_sibling).map(ElementRef)
    }

    fn next_sibling_element(&self) -> Option<Self> {
        self.data(|e| e.next_sibling).map(ElementRef)
    }

    fn first_element_child(&self) -> Option<Self> {
        self.data(|e| e.first_child).map(ElementRef)
    }

    fn is_html_element_in_html_document(&self) -> bool {
        // Treat elements with no namespace or the HTML namespace as HTML.
        self.data(|e| e.namespace.is_empty() || e.namespace == HTML_NS)
    }

    fn has_local_name(&self, local_name: &str) -> bool {
        self.data(|e| e.local_name == local_name)
    }

    fn has_namespace(&self, ns: &str) -> bool {
        self.data(|e| e.namespace == ns)
    }

    fn is_same_type(&self, other: &Self) -> bool {
        self.data(|a| {
            other.data(|b| a.local_name == b.local_name && a.namespace == b.namespace)
        })
    }

    fn attr_matches(
        &self,
        _ns: &NamespaceConstraint<&Atom>,
        local_name: &Atom,
        operation: &AttrSelectorOperation<&Atom>,
    ) -> bool {
        self.data(|e| {
            e.attributes
                .iter()
                .filter(|(name, _)| name.as_str() == local_name.0)
                .any(|(_, value)| operation.eval_str(value))
        })
    }

    fn match_non_ts_pseudo_class(
        &self,
        pc: &AlfaPseudoClass,
        _context: &mut MatchingContext<AlfaSelectorImpl>,
    ) -> bool {
        match *pc {}
    }

    fn match_pseudo_element(
        &self,
        pe: &AlfaPseudoElement,
        _context: &mut MatchingContext<AlfaSelectorImpl>,
    ) -> bool {
        match *pe {}
    }

    fn apply_selector_flags(&self, _flags: ElementSelectorFlags) {}

    fn is_link(&self) -> bool {
        false
    }

    fn is_html_slot_element(&self) -> bool {
        false
    }

    fn has_id(&self, id: &Atom, case_sensitivity: CaseSensitivity) -> bool {
        self.data(|e| {
            e.id.as_deref()
                .is_some_and(|existing| case_sensitivity.eq(existing.as_bytes(), id.0.as_bytes()))
        })
    }

    fn has_class(&self, name: &Atom, case_sensitivity: CaseSensitivity) -> bool {
        self.data(|e| {
            e.classes
                .iter()
                .any(|class| case_sensitivity.eq(class.as_bytes(), name.0.as_bytes()))
        })
    }

    fn has_custom_state(&self, _name: &Atom) -> bool {
        false
    }

    fn imported_part(&self, _name: &Atom) -> Option<Atom> {
        None
    }

    fn is_part(&self, _name: &Atom) -> bool {
        false
    }

    fn is_empty(&self) -> bool {
        self.data(|e| e.first_child.is_none())
    }

    fn is_root(&self) -> bool {
        self.data(|e| e.is_root)
    }

    fn add_element_unique_hashes(&self, _filter: &mut BloomFilter) -> bool {
        false
    }
}

const HTML_NS: &str = "http://www.w3.org/1999/xhtml";

//! WASM bindings around Servo's `selectors` crate.
//!
//! Milestone 2 surface: load an Alfa DOM (serialized to the binary format in
//! `serialization.rs`), parse selectors, match them against real elements, and
//! read specificity. Cascade integration is a later milestone.

mod dom;
mod selector_impl;
mod serialization;

use std::cell::RefCell;

use cssparser::{Parser as CssParser, ParserInput};
use selectors::context::{
    MatchingContext, MatchingForInvalidation, MatchingMode, NeedsSelectorFlags, QuirksMode,
    SelectorCaches,
};
use selectors::matching::matches_selector;
use selectors::parser::{ParseRelative, Parser, SelectorList, SelectorParseErrorKind};
use wasm_bindgen::prelude::*;

use crate::dom::{clear_dom, set_dom, ElementRef};
use crate::selector_impl::AlfaSelectorImpl;

/// Parser configuration. Enables the modern selector features we care about.
struct AlfaParser;

impl<'i> Parser<'i> for AlfaParser {
    type Impl = AlfaSelectorImpl;
    type Error = SelectorParseErrorKind<'i>;

    fn parse_is_and_where(&self) -> bool {
        true
    }

    fn parse_has(&self) -> bool {
        true
    }

    fn parse_parent_selector(&self) -> bool {
        true
    }
}

thread_local! {
    /// Parsed selector lists, indexed by the id we hand back to JS.
    static SELECTORS: RefCell<Vec<SelectorList<AlfaSelectorImpl>>> = const {
        RefCell::new(Vec::new())
    };
}

/// Load a DOM from the binary serialization format. Returns an empty string on
/// success, or an error message on failure.
#[wasm_bindgen]
pub fn load_dom(data: &[u8]) -> String {
    match serialization::decode(data) {
        Ok(elements) => {
            set_dom(elements);
            String::new()
        }
        Err(message) => message,
    }
}

/// Clear the DOM and all parsed selectors.
#[wasm_bindgen]
pub fn clear() {
    clear_dom();
    SELECTORS.with(|s| s.borrow_mut().clear());
}

/// Parse a CSS selector string. Returns the selector id (>= 0) on success, or
/// -1 on parse error.
#[wasm_bindgen]
pub fn parse_selector(text: &str) -> i32 {
    let mut input = ParserInput::new(text);
    let mut parser = CssParser::new(&mut input);

    match SelectorList::parse(&AlfaParser, &mut parser, ParseRelative::No) {
        Ok(list) => SELECTORS.with(|s| {
            let mut selectors = s.borrow_mut();
            selectors.push(list);
            (selectors.len() - 1) as i32
        }),
        Err(_) => -1,
    }
}

/// Return the packed specificity of the first selector in the list.
///
/// Encoding (per the `selectors` crate): `(a << 20) | (b << 10) | c`.
#[wasm_bindgen]
pub fn specificity(selector_id: u32) -> u32 {
    SELECTORS.with(|s| {
        s.borrow()
            .get(selector_id as usize)
            .and_then(|list| list.slice().first())
            .map(|selector| selector.specificity())
            .unwrap_or(0)
    })
}

/// Test whether the element at `element_id` matches the selector.
#[wasm_bindgen]
pub fn matches(selector_id: u32, element_id: u32) -> bool {
    SELECTORS.with(|s| {
        let selectors = s.borrow();
        let Some(list) = selectors.get(selector_id as usize) else {
            return false;
        };

        let element = ElementRef(element_id as usize);
        let mut caches = SelectorCaches::default();
        let mut context = MatchingContext::new(
            MatchingMode::Normal,
            None,
            &mut caches,
            QuirksMode::NoQuirks,
            NeedsSelectorFlags::No,
            MatchingForInvalidation::No,
        );

        list.slice()
            .iter()
            .any(|selector| matches_selector(selector, 0, None, &element, &mut context))
    })
}

#[cfg(test)]
mod tests {
    use crate::dom::{set_dom, ElementData};

    #[derive(Default, Clone, Copy)]
    struct Node<'a> {
        name: &'a str,
        classes: &'a [&'a str],
        parent: Option<usize>,
        first_child: Option<usize>,
        next_sibling: Option<usize>,
        prev_sibling: Option<usize>,
    }

    fn build(nodes: &[Node]) {
        set_dom(
            nodes
                .iter()
                .map(|n| ElementData {
                    local_name: n.name.to_string(),
                    namespace: String::new(),
                    id: None,
                    classes: n.classes.iter().map(|s| s.to_string()).collect(),
                    attributes: vec![],
                    parent: n.parent,
                    first_child: n.first_child,
                    next_sibling: n.next_sibling,
                    prev_sibling: n.prev_sibling,
                    is_root: n.parent.is_none(),
                })
                .collect(),
        );
    }

    fn matches(selector: &str, element_id: u32) -> bool {
        let id = crate::parse_selector(selector);
        assert!(id >= 0, "failed to parse {selector:?}");
        crate::matches(id as u32, element_id)
    }

    #[test]
    fn has_matches_direct_child() {
        // <div class="container"><span class="target"></span></div>
        build(&[
            Node {
                name: "div",
                classes: &["container"],
                first_child: Some(1),
                ..Default::default()
            },
            Node {
                name: "span",
                classes: &["target"],
                parent: Some(0),
                ..Default::default()
            },
        ]);

        assert!(matches(".container:has(.target)", 0));
    }

    #[test]
    fn has_matches_deep_descendant() {
        // <div class="container"><p><span class="target"></span></p></div>
        build(&[
            Node {
                name: "div",
                classes: &["container"],
                first_child: Some(1),
                ..Default::default()
            },
            Node {
                name: "p",
                parent: Some(0),
                first_child: Some(2),
                ..Default::default()
            },
            Node {
                name: "span",
                classes: &["target"],
                parent: Some(1),
                ..Default::default()
            },
        ]);

        assert!(matches(".container:has(.target)", 0));
    }

    #[test]
    fn has_does_not_match_when_absent() {
        // <div class="container"><span class="other"></span></div>
        build(&[
            Node {
                name: "div",
                classes: &["container"],
                first_child: Some(1),
                ..Default::default()
            },
            Node {
                name: "span",
                classes: &["other"],
                parent: Some(0),
                ..Default::default()
            },
        ]);

        assert!(!matches(".container:has(.target)", 0));
    }

    #[test]
    fn has_matches_next_sibling_combinator() {
        // <div class="anchor"></div><span class="target"></span>
        build(&[
            Node {
                name: "div",
                classes: &["anchor"],
                next_sibling: Some(1),
                ..Default::default()
            },
            Node {
                name: "span",
                classes: &["target"],
                prev_sibling: Some(0),
                ..Default::default()
            },
        ]);

        assert!(matches(".anchor:has(+ .target)", 0));
        assert!(!matches(".anchor:has(+ .other)", 0));
    }

    #[test]
    fn has_composes_with_is() {
        // Original motivating bug: a desugared `& .table` nested rule, wrapped in
        // `:has()`, should still resolve correctly against a real tree.
        // <div class="lfr-layout-structure-item foo"><table class="table"><span id="cell"/></table></div>
        build(&[
            Node {
                name: "div",
                classes: &["lfr-layout-structure-item", "foo"],
                first_child: Some(1),
                ..Default::default()
            },
            Node {
                name: "table",
                classes: &["table"],
                parent: Some(0),
                first_child: Some(2),
                ..Default::default()
            },
            Node {
                name: "span",
                parent: Some(1),
                ..Default::default()
            },
        ]);

        assert!(matches(
            ":is(.lfr-layout-structure-item):has(.table)",
            0
        ));
        assert!(!matches(":is(.lfr-layout-structure-item):has(.missing)", 0));
    }
}

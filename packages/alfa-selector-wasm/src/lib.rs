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

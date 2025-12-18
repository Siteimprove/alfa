import { Token, type Parser as CSSParser } from "@siteimprove/alfa-css";
import { Err } from "@siteimprove/alfa-result";
import { Parser } from "@siteimprove/alfa-parser";

import type { Selector } from "../../index.js";

import { After } from "./after.js";
import { Backdrop } from "./backdrop.js";
import { Before } from "./before.js";
import { Cue } from "./cue.js";
import { CueRegion } from "./cue-region.js";
import { FileSelectorButton } from "./file-selector-button.js";
import { FirstLetter } from "./first-letter.js";
import { FirstLine } from "./first-line.js";
import { GrammarError } from "./grammar-error.js";
import { Marker } from "./marker.js";
import { Part } from "./part.js";
import { Placeholder } from "./placeholder.js";
import { Selection } from "./selection.js";
import { Slotted } from "./slotted.js";
import { SpellingError } from "./spelling-error.js";
import { TargetText } from "./target-text.js";

import { PseudoElementSelector } from "./pseudo-element.js";

const { right } = Parser;
const { parseLegacy, parseNonLegacy } = PseudoElementSelector;

/**
 * @public
 */
export type PseudoElement =
  | After
  | Backdrop
  | Before
  | Cue
  | CueRegion
  | FileSelectorButton
  | FirstLetter
  | FirstLine
  | GrammarError
  | Marker
  | Part
  | Placeholder
  | Selection
  | Slotted
  | SpellingError
  | TargetText;

/**
 * @public
 */
export namespace PseudoElement {
  export type JSON = PseudoElementSelector.JSON;

  export function isPseudoElement(
    value: unknown,
  ): value is PseudoElementSelector {
    // Note: this is not totally true as we could extend PseudoElementSelector
    // without making it a PseudoElement. We're likely having other problems in
    // that case…
    return value instanceof PseudoElementSelector;
  }

  const legacyConstructors: Record<string, () => PseudoElement> = {
    after: After.of,
    before: Before.of,
    "first-letter": FirstLetter.of,
    "first-line": FirstLine.of,
  };

  const nonLegacyConstructors: Record<string, () => PseudoElement> = {
    after: After.of,
    backdrop: Backdrop.of,
    before: Before.of,
    cue: Cue.of,
    "file-selector-button": FileSelectorButton.of,
    "first-letter": FirstLetter.of,
    "first-line": FirstLine.of,
    "grammar-error": GrammarError.of,
    marker: Marker.of,
    placeholder: Placeholder.of,
    selection: Selection.of,
    "spelling-error": SpellingError.of,
    "target-text": TargetText.of,
  };

  const functionalParsers = (
    parseSelector: Selector.Parser.Component,
  ): Record<string, CSSParser<PseudoElement>> => {
    return {
      cue: Cue.parseFunctional(parseSelector, false),
      "cue-region": CueRegion.parse(parseSelector, false),
      slotted: Slotted.parse(parseSelector, false),
    };
  };

  /**
   * @privateRemarks
   * This function is a hot path and uses token lookahead instead
   * of the `either` parser combinator to avoid backtracking. Any changes to
   * this function should be benchmarked.
   */
  export function parseWithoutColon(
    parseSelector: Selector.Parser.Component,
    isDoubleColon: boolean,
  ): CSSParser<PseudoElement> {
    return (input) => {
      if (input.isEmpty()) {
        return Err.of("Unexpected end of input");
      }

      const funcOrIdent = input.getUnsafe(0);

      // Function pseudo-elements must be checked first. If we checked for
      // ident tokens first, function tokens would never be reached since
      // Token.isIdent would also match the beginning of function tokens.
      if (Token.isFunction(funcOrIdent)) {
        const name = funcOrIdent.value.toLowerCase();
        const parser = functionalParsers(parseSelector)[name];
        return parser !== undefined
          ? parser(input)
          : Err.of(`Unknown pseudo-element: ${name}`);
      }

      // Non-functional pseudo-elements
      if (Token.isIdent(funcOrIdent)) {
        const name = funcOrIdent.value.toLowerCase();
        const of = isDoubleColon
          ? nonLegacyConstructors[name]
          : legacyConstructors[name];
        if (of === undefined) {
          return Err.of(`Unknown pseudo-element: ${name}`);
        }
        const parser = isDoubleColon
          ? parseNonLegacy(name, of, false)
          : parseLegacy(name, of, false);

        return parser(input);
      }

      return Err.of("Expected ident or function after colons");
    };
  }

  export function parse(
    parseSelector: Selector.Parser.Component,
  ): CSSParser<PseudoElement> {
    return right(Token.parseColon, (input) => {
      if (input.isEmpty()) {
        return Err.of("Unexpected end of input");
      }

      const isDoubleColon = Token.isColon(input.getUnsafe(0));
      if (isDoubleColon) {
        input = input.rest();
      }

      return parseWithoutColon(parseSelector, isDoubleColon)(input);
    });
  }
}

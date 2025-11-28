import { Token, type Parser as CSSParser } from "@siteimprove/alfa-css";
import { Err } from "@siteimprove/alfa-result";

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

const { parseLegacy, parseNonLegacy, parseFunctional } = PseudoElementSelector;

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
      cue: Cue.parseFunction(parseSelector),
      "cue-region": CueRegion.parse(parseSelector),
      slotted: Slotted.parse(parseSelector),
    };
  };

  /**
   * @remarks
   * This function is a hot path and uses token lookahead instead
   * of the `either` parser combinator to avoid backtracking. Any changes to
   * this function should be benchmarked.
   */
  export function parse(
    parseSelector: Selector.Parser.Component,
  ): CSSParser<PseudoElement> {
    return (input) => {
      if (!input.has(1)) {
        return Err.of("Unexpected end of input");
      }

      const first = input.getUnsafe(0);
      const second = input.getUnsafe(1);

      if (!Token.isColon(first)) {
        return Err.of("Expected colon");
      }

      const isDoubleColon = Token.isColon(second);
      const nameIndex = isDoubleColon ? 2 : 1;

      if (!input.has(nameIndex)) {
        return Err.of("Unexpected end of input");
      }

      const nameToken = input.getUnsafe(nameIndex);

      // Function pseudo-elements must be checked first. If we checked for
      // ident tokens first, function tokens would never be reached since
      // Token.isIdent would also match the beginning of function tokens.
      if (Token.isFunction(nameToken)) {
        const name = nameToken.value.toLowerCase();
        return parseFunctional(name, functionalParsers(parseSelector))(input);
      }

      // Non-functional pseudo-elements
      if (Token.isIdent(nameToken)) {
        const name = nameToken.value.toLowerCase();

        const parser = isDoubleColon
          ? parseNonLegacy(name, nonLegacyConstructors)
          : parseLegacy(name, legacyConstructors);

        return parser(input);
      }

      return Err.of("Expected ident or function after colons");
    };
  }
}

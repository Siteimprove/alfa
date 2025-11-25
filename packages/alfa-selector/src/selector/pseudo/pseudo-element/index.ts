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
      if (input.length < 2) {
        return Err.of("Unexpected end of input");
      }

      const first = input.getUnsafe(0);
      const second = input.getUnsafe(1);

      // All pseudo-elements require at least one colon
      if (!Token.isColon(first)) {
        return Err.of("Expected colon");
      }

      // Check if it's a double colon (most pseudo-elements)
      // or single colon (legacy pseudo-elements)
      const isDoubleColon = Token.isColon(second);
      const nameIndex = isDoubleColon ? 2 : 1;

      if (!input.has(nameIndex)) {
        return Err.of("Unexpected end of input");
      }

      const nameToken = input.getUnsafe(nameIndex);

      // Check for function pseudo-elements
      if (Token.isFunction(nameToken)) {
        const name = nameToken.value.toLowerCase();
        switch (name) {
          case "cue":
            return Cue.parse(parseSelector)(input);
          case "cue-region":
            return CueRegion.parse(parseSelector)(input);
          case "slotted":
            return Slotted.parse(parseSelector)(input);
        }
        return Err.of(`Unknown pseudo-element function: ${name}`);
      }

      // Check for non-functional pseudo-elements
      if (Token.isIdent(nameToken)) {
        const name = nameToken.value.toLowerCase();

        // Legacy pseudo-elements can use single colon
        if (!isDoubleColon) {
          switch (name) {
            case "after":
              return After.parse(input);
            case "before":
              return Before.parse(input);
            case "first-letter":
              return FirstLetter.parse(input);
            case "first-line":
              return FirstLine.parse(input);
          }
          return Err.of(`Unknown legacy pseudo-element: ${name}`);
        }

        // Double colon pseudo-elements (includes legacy ones)
        switch (name) {
          case "after":
            return After.parse(input);
          case "backdrop":
            return Backdrop.parse(input);
          case "before":
            return Before.parse(input);
          case "cue":
            return Cue.parse(parseSelector)(input);
          case "file-selector-button":
            return FileSelectorButton.parse(input);
          case "first-letter":
            return FirstLetter.parse(input);
          case "first-line":
            return FirstLine.parse(input);
          case "grammar-error":
            return GrammarError.parse(input);
          case "marker":
            return Marker.parse(input);
          case "part":
            return Part.parse(input);
          case "placeholder":
            return Placeholder.parse(input);
          case "selection":
            return Selection.parse(input);
          case "spelling-error":
            return SpellingError.parse(input);
          case "target-text":
            return TargetText.parse(input);
        }
        return Err.of(`Unknown pseudo-element: ${name}`);
      }

      return Err.of("Expected ident or function after colons");
    };
  }
}

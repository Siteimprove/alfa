import type { Parser as CSSParser, Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import type { Slice } from "@siteimprove/alfa-slice";
import type { Thunk } from "@siteimprove/alfa-thunk";

import { Absolute } from "../../../selector";
import { After } from "./after";
import { Backdrop } from "./backdrop";
import { Before } from "./before";
import { Cue } from "./cue";
import { CueRegion } from "./cue-region";
import { FileSelectorButton } from "./file-selector-button";
import { FirstLetter } from "./first-letter";
import { FirstLine } from "./first-line";
import { GrammarError } from "./grammar-error";
import { Marker } from "./marker";
import { Part } from "./part";
import { Placeholder } from "./placeholder";
import { Selection } from "./selection";
import { Slotted } from "./slotted";
import { SpellingError } from "./spelling-error";
import { TargetText } from "./target-text";

import { PseudoElementSelector } from "./pseudo-element";

const { either } = Parser;

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

  export function parse(
    parseSelector: Thunk<CSSParser<Absolute>>,
  ): CSSParser<PseudoElement> {
    return either<Slice<Token>, PseudoElement, string>(
      After.parse,
      Before.parse,
      Cue.parse(parseSelector),
      CueRegion.parse(parseSelector),
      FirstLetter.parse,
      FirstLine.parse,
      Backdrop.parse,
      FileSelectorButton.parse,
      GrammarError.parse,
      Marker.parse,
      Part.parse,
      Placeholder.parse,
      Selection.parse,
      Slotted.parse(parseSelector),
      SpellingError.parse,
      TargetText.parse,
    );
  }
}

import type { Parser as CSSParser, Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import type { Slice } from "@siteimprove/alfa-slice";

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
    parseSelector: Selector.Parser.Component<Selector>,
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

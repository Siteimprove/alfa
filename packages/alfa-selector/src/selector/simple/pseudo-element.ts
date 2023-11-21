import { Function, Parser as CSSParser, Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Err } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";
import type { Thunk } from "@siteimprove/alfa-thunk";

import { Absolute } from "../../selector";

import { Compound } from "../compound";
import {
  After,
  Backdrop,
  Before,
  Cue,
  CueRegion,
  FileSelectorButton,
  FirstLetter,
  FirstLine,
  GrammarError,
  Marker,
  Part,
  Placeholder,
  Selection,
  Slotted,
  SpellingError,
  TargetText,
} from "./pseudo-element/index";

import { PseudoElementSelector } from "./pseudo-element/pseudo-element";

const { either, mapResult, peek, right, separatedList, take } = Parser;

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

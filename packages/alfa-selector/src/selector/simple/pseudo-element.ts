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
      // Functional pseudo-elements need to be first because ::cue and
      // ::cue-region can be both functional and non-functional, so we want to
      // fail them as functional before testing them as non-functional.
      right(
        take(Token.parseColon, 2),
        mapResult(
          right(peek(Token.parseFunction()), Function.consume),
          (fn) => {
            const { name } = fn;
            const tokens = Slice.of(fn.value);

            switch (name) {
              case "cue":
              case "cue-region":
                return parseSelector()(tokens).map(([, selector]) =>
                  name === "cue"
                    ? (Cue.of(selector) as PseudoElement)
                    : CueRegion.of(selector),
                );

              case "part":
                return separatedList(
                  Token.parseIdent(),
                  Token.parseWhitespace,
                )(tokens).map(([, idents]) => Part.of(idents));

              case "slotted":
                return separatedList(
                  Compound.parseCompound(parseSelector),
                  Token.parseWhitespace,
                )(tokens).map(([, selectors]) => Slotted.of(selectors));
            }

            return Err.of(`Unknown pseudo-element ::${name}()`);
          },
        ),
      ),

      PseudoElementSelector.parseNonLegacy("cue", () => Cue.of()),
      PseudoElementSelector.parseNonLegacy("cue-region", () => CueRegion.of()),

      After.parse,
      Before.parse,
      FirstLetter.parse,
      FirstLine.parse,
      Backdrop.parse,
      FileSelectorButton.parse,
      GrammarError.parse,
      Marker.parse,
      Placeholder.parse,
      Selection.parse,
      SpellingError.parse,
      TargetText.parse,
    );
  }
}

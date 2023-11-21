import { Function, Parser as CSSParser, Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Err, Result } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";
import { Thunk } from "@siteimprove/alfa-thunk";

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

const {
  either,
  flatMap,
  map,
  mapResult,
  peek,
  right,
  separatedList,
  take,
  takeBetween,
} = Parser;

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
    return either(
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
      // Non-functional pseudo-elements
      flatMap(
        map(takeBetween(Token.parseColon, 1, 2), (colons) => colons.length),
        (colons) =>
          mapResult(Token.parseIdent(), (ident) => {
            if (colons === 1) {
              switch (ident.value) {
                // Legacy pseudo-elements must be accepted with both a single and
                // double colon.
                case "after":
                case "before":
                case "first-letter":
                case "first-line":
                  break;

                default:
                  return Err.of(
                    `This pseudo-element is not allowed with single colon: ::${ident.value}`,
                  );
              }
            }

            switch (ident.value) {
              case "after":
                return Result.of<PseudoElement, string>(After.of());
              case "backdrop":
                return Result.of(Backdrop.of());
              case "before":
                return Result.of(Before.of());
              case "cue":
                return Result.of(Cue.of());
              case "cue-region":
                return Result.of(CueRegion.of());
              case "file-selector-button":
                return Result.of(FileSelectorButton.of());
              case "first-letter":
                return Result.of(FirstLetter.of());
              case "first-line":
                return Result.of(FirstLine.of());
              case "grammar-error":
                return Result.of(GrammarError.of());
              case "marker":
                return Result.of(Marker.of());
              case "placeholder":
                return Result.of(Placeholder.of());
              case "selection":
                return Result.of(Selection.of());
              case "spelling-error":
                return Result.of(SpellingError.of());
              case "target-text":
                return Result.of(TargetText.of());
            }

            return Err.of(`Unknown pseudo-element ::${ident.value}`);
          }),
      ),
    );
  }
}

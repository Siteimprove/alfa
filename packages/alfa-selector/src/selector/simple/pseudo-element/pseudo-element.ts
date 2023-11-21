import { Array } from "@siteimprove/alfa-array";
import { Function, Parser as CSSParser, Token } from "@siteimprove/alfa-css";
import { Element } from "@siteimprove/alfa-dom";
import { Option } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Err, Result } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";
import { Thunk } from "@siteimprove/alfa-thunk";

import type { Context } from "../../../context";
import type { Absolute } from "../../../selector";

import { Compound } from "../../compound";
import { type Selector, WithName } from "../../selector";
import type { Simple } from "../../simple";

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

export abstract class PseudoElement<N extends string = string> extends WithName<
  "pseudo-element",
  N
> {
  protected constructor(name: N) {
    super("pseudo-element", name);
  }

  public matches(element: Element, context?: Context): boolean {
    return false;
  }

  public equals(value: PseudoElement): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof PseudoElement && super.equals(value);
  }

  public *[Symbol.iterator](): Iterator<PseudoElement> {
    yield this;
  }

  public toJSON(): PseudoElement.JSON<N> {
    return {
      ...super.toJSON(),
    };
  }

  public toString(): string {
    return `::${this._name}`;
  }
}

export namespace PseudoElement {
  export interface JSON<N extends string = string>
    extends WithName.JSON<"pseudo-element", N> {}

  export function isPseudoElement(value: unknown): value is PseudoElement {
    return value instanceof PseudoElement;
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

/**
 * {@link https://drafts.csswg.org/css-pseudo/#selectordef-after}
 */
export class After extends PseudoElement<"after"> {
  public static of(): After {
    return new After();
  }

  private constructor() {
    super("after");
  }
}

/**
 * {@link https://fullscreen.spec.whatwg.org/#::backdrop-pseudo-element}
 */
export class Backdrop extends PseudoElement<"backdrop"> {
  public static of(): Backdrop {
    return new Backdrop();
  }

  private constructor() {
    super("backdrop");
  }
}

/**
 * {@link https://drafts.csswg.org/css-pseudo/#selectordef-before}
 */
export class Before extends PseudoElement<"before"> {
  public static of(): Before {
    return new Before();
  }

  private constructor() {
    super("before");
  }
}

/**
 * {@link https://w3c.github.io/webvtt/#the-cue-pseudo-element}
 */
class Cue extends PseudoElement<"cue"> {
  public static of(selector?: Selector): Cue {
    return new Cue(Option.from(selector));
  }

  private readonly _selector: Option<Selector>;

  private constructor(selector: Option<Selector>) {
    super("cue");
    this._selector = selector;
  }

  public get selector(): Option<Selector> {
    return this._selector;
  }

  public equals(value: Cue): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof Cue && value.selector.equals(this.selector);
  }

  public toJSON(): Cue.JSON {
    return {
      ...super.toJSON(),
      selector: this._selector.toJSON(),
    };
  }

  public toString(): string {
    return `::${this.name}` + this._selector.isSome()
      ? `(${this._selector})`
      : "";
  }
}

export namespace Cue {
  export interface JSON extends PseudoElement.JSON<"cue"> {
    selector: Option.JSON<Selector>;
  }
}

/**
 * {@link https://w3c.github.io/webvtt/#the-cue-region-pseudo-element}
 */
class CueRegion extends PseudoElement<"cue-region"> {
  public static of(selector?: Selector): CueRegion {
    return new CueRegion(Option.from(selector));
  }

  private readonly _selector: Option<Selector>;

  private constructor(selector: Option<Selector>) {
    super("cue-region");
    this._selector = selector;
  }

  public get selector(): Option<Selector> {
    return this._selector;
  }

  public equals(value: CueRegion): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof CueRegion && value.selector.equals(this.selector);
  }

  public toJSON(): CueRegion.JSON {
    return {
      ...super.toJSON(),
      selector: this._selector.toJSON(),
    };
  }

  public toString(): string {
    return `::${this.name}` + this._selector.isSome()
      ? `(${this._selector})`
      : "";
  }
}

export namespace CueRegion {
  export interface JSON extends PseudoElement.JSON<"cue-region"> {
    selector: Option.JSON<Selector>;
  }
}

/**
 *{@link https://drafts.csswg.org/css-pseudo-4/#file-selector-button-pseudo}
 */
export class FileSelectorButton extends PseudoElement<"file-selector-button"> {
  public static of(): FileSelectorButton {
    return new FileSelectorButton();
  }

  private constructor() {
    super("file-selector-button");
  }
}

/**
 * {@link https://drafts.csswg.org/css-pseudo-4/#first-letter-pseudo}
 */
export class FirstLetter extends PseudoElement<"first-letter"> {
  public static of(): FirstLetter {
    return new FirstLetter();
  }

  private constructor() {
    super("first-letter");
  }
}

/**
 * {@link https://drafts.csswg.org/css-pseudo-4/#first-line-pseudo}
 */
export class FirstLine extends PseudoElement<"first-line"> {
  public static of(): FirstLine {
    return new FirstLine();
  }

  private constructor() {
    super("first-line");
  }
}

/**
 * {@link https://drafts.csswg.org/css-pseudo-4/#selectordef-grammar-error}
 */
export class GrammarError extends PseudoElement<"grammar-error"> {
  public static of(): GrammarError {
    return new GrammarError();
  }

  private constructor() {
    super("grammar-error");
  }
}

/**
 * {@link https://drafts.csswg.org/css-pseudo-4/#marker-pseudo}
 */
export class Marker extends PseudoElement<"marker"> {
  public static of(): Marker {
    return new Marker();
  }

  private constructor() {
    super("marker");
  }
}

/**
 * {@link https://drafts.csswg.org/css-shadow-parts-1/#part}
 */
export class Part extends PseudoElement<"part"> {
  public static of(idents: Iterable<Token.Ident>): Part {
    return new Part(Array.from(idents));
  }

  private readonly _idents: ReadonlyArray<Token.Ident>;

  private constructor(idents: Array<Token.Ident>) {
    super("part");
    this._idents = idents;
  }

  public get idents(): Iterable<Token.Ident> {
    return this._idents;
  }

  public equals(value: Part): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof Part && Array.equals(value._idents, this._idents);
  }

  public toJSON(): Part.JSON {
    return {
      ...super.toJSON(),
      idents: Array.toJSON(this._idents),
    };
  }

  public toString(): string {
    return `::${this.name}(${this._idents})`;
  }
}

export namespace Part {
  export interface JSON extends PseudoElement.JSON<"part"> {
    idents: Array<Token.Ident.JSON>;
  }
}

/**
 * {@link https://drafts.csswg.org/css-pseudo-4/#placeholder-pseudo}
 */
export class Placeholder extends PseudoElement<"placeholder"> {
  public static of(): Placeholder {
    return new Placeholder();
  }

  private constructor() {
    super("placeholder");
  }
}

/**
 * {@link https://drafts.csswg.org/css-pseudo-4/#selectordef-selection}
 */
export class Selection extends PseudoElement<"selection"> {
  public static of(): Selection {
    return new Selection();
  }

  private constructor() {
    super("selection");
  }
}

/**
 * {@link https://drafts.csswg.org/css-scoping/#slotted-pseudo}
 */
export class Slotted extends PseudoElement<"slotted"> {
  public static of(selectors: Iterable<Simple | Compound>): Slotted {
    return new Slotted(Array.from(selectors));
  }

  private readonly _selectors: ReadonlyArray<Simple | Compound>;

  private constructor(selectors: Array<Simple | Compound>) {
    super("slotted");
    this._selectors = selectors;
  }

  public get selectors(): Iterable<Simple | Compound> {
    return this._selectors;
  }

  public equals(value: Slotted): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof Slotted &&
      Array.equals(value._selectors, this._selectors)
    );
  }

  public toJSON(): Slotted.JSON {
    return {
      ...super.toJSON(),
      selectors: Array.toJSON(this._selectors),
    };
  }

  public toString(): string {
    return `::${this.name}(${this._selectors})`;
  }
}

export namespace Slotted {
  export interface JSON extends PseudoElement.JSON<"slotted"> {
    selectors: Array<Simple.JSON | Compound.JSON>;
  }
}

/**
 * {@link https://drafts.csswg.org/css-pseudo-4/#selectordef-spelling-error}
 */
export class SpellingError extends PseudoElement<"spelling-error"> {
  public static of(): SpellingError {
    return new SpellingError();
  }

  private constructor() {
    super("spelling-error");
  }
}

/**
 * {@link https://drafts.csswg.org/css-pseudo-4/#selectordef-target-text}
 */
export class TargetText extends PseudoElement<"target-text"> {
  public static of(): TargetText {
    return new TargetText();
  }

  private constructor() {
    super("target-text");
  }
}

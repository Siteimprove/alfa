import { Array } from "@siteimprove/alfa-array";
import {
  Function,
  type Parser as CSSParser,
  Token,
} from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import type { Thunk } from "@siteimprove/alfa-thunk";

import type { Absolute } from "../../../selector";

import { Compound } from "../../compound";
import { Simple } from "../../simple";

import { PseudoElementSelector } from "./pseudo-element";

const { map, separatedList } = Parser;

/**
 * {@link https://drafts.csswg.org/css-scoping/#slotted-pseudo}
 */
export class Slotted extends PseudoElementSelector<"slotted"> {
  public static of(selectors: Iterable<Simple | Compound>): Slotted {
    return new Slotted(Array.from(selectors));
  }

  private readonly _selectors: ReadonlyArray<Simple | Compound>;

  private constructor(selectors: Array<Simple | Compound>) {
    super("slotted");
    this._selectors = selectors;
  }

  /** @public (knip) */
  public get selectors(): Iterable<Simple | Compound> {
    return this._selectors;
  }

  /** @public (knip) */
  public *[Symbol.iterator](): Iterator<Slotted> {
    yield this;
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
  export interface JSON extends PseudoElementSelector.JSON<"slotted"> {
    selectors: Array<Simple.JSON | Compound.JSON>;
  }

  export function parse(
    parseSelector: Thunk<CSSParser<Absolute>>,
  ): CSSParser<Slotted> {
    return map(
      Function.parse("slotted", () =>
        separatedList(
          Compound.parseCompound(parseSelector),
          Token.parseWhitespace,
        ),
      ),
      ([_, selectors]) => Slotted.of(selectors),
    );
  }
}

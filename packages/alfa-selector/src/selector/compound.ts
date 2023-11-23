import { Array } from "@siteimprove/alfa-array";
import { Token } from "@siteimprove/alfa-css";
import type { Element } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import type { Context } from "../context";
import type { Absolute } from "./index";

import { Selector } from "./selector";
import { Simple } from "./simple";

const { map, oneOrMore } = Parser;

/**
 * {@link https://drafts.csswg.org/selectors/#compound}
 *
 * @public
 */
export class Compound extends Selector<"compound"> {
  public static of(...selectors: Array<Simple>): Compound {
    return new Compound(selectors);
  }

  private readonly _selectors: Array<Simple>;
  private readonly _length: number;

  private constructor(selectors: Array<Simple>) {
    super("compound");
    this._selectors = selectors;
    this._length = selectors.length;
  }

  public get selectors(): Iterable<Simple> {
    return this._selectors;
  }

  public get length(): number {
    return this._length;
  }

  public matches(element: Element, context?: Context): boolean {
    return this._selectors.every((selector) =>
      selector.matches(element, context),
    );
  }

  public equals(value: Compound): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof Compound &&
      Array.equals(value._selectors, this._selectors)
    );
  }

  public *[Symbol.iterator](): Iterator<Compound> {
    yield this;
  }

  public toJSON(): Compound.JSON {
    return {
      ...super.toJSON(),
      selectors: this._selectors.map((selector) => selector.toJSON()),
    };
  }

  public toString(): string {
    return this._selectors.map((selector) => selector.toString()).join("");
  }
}

/**
 * @public
 */
export namespace Compound {
  export interface JSON extends Selector.JSON<"compound"> {
    selectors: Array<Simple.JSON>;
  }

  export function isCompound(value: unknown): value is Compound {
    return value instanceof Compound;
  }

  /**
   * {@link https://drafts.csswg.org/selectors/#typedef-compound-selector}
   *
   * @internal
   */
  export const parseCompound = (
    parseSelector: () => Parser<Slice<Token>, Absolute, string>,
  ) =>
    map(oneOrMore(Simple.parse(parseSelector)), (result) =>
      result.length === 1 ? result[0] : Compound.of(...result),
    );
}

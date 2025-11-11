import { Array } from "@siteimprove/alfa-array";
import type { Element } from "@siteimprove/alfa-dom";
import type { Iterable } from "@siteimprove/alfa-iterable";
import type { Option } from "@siteimprove/alfa-option";
import { None } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";

import type { Context } from "../context.js";
import { Specificity } from "../specificity.js";
import type { Selector } from "./index.js";

import { BaseSelector } from "./selector.js";
import { type Class, type Id, Simple, type Type } from "./simple/index.js";

const { map, oneOrMore } = Parser;

/**
 * {@link https://drafts.csswg.org/selectors/#compound}
 *
 * @public
 */
export class Compound extends BaseSelector<"compound"> {
  public static of(...selectors: Array<Simple>): Compound {
    return new Compound(selectors);
  }

  private readonly _selectors: Array<Simple>;
  private readonly _length: number;
  protected readonly _key: Option<Id | Class | Type>;

  protected constructor(selectors: Array<Simple>) {
    super(
      "compound",
      Specificity.sum(...selectors.map((selector) => selector.specificity)),
    );
    this._selectors = selectors;
    this._length = selectors.length;

    this._key = selectors[0]?.key ?? None;
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
  export interface JSON extends BaseSelector.JSON<"compound"> {
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
  export const parse = (parseSelector: Selector.Parser.Component<Selector>) =>
    map(oneOrMore(Simple.parse(parseSelector)), (result) =>
      result.length === 1 ? result[0] : Compound.of(...result),
    );
}

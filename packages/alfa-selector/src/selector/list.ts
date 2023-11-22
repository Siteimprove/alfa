import { Array } from "@siteimprove/alfa-array";
import { Comma, type Parser as CSSParser } from "@siteimprove/alfa-css";
import { Element } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { Parser } from "@siteimprove/alfa-parser";
import { Thunk } from "@siteimprove/alfa-thunk";

import { Context } from "../context";
import type { Absolute } from "../selector";

import { Complex } from "./complex";
import { Compound } from "./compound";
import { Relative } from "./relative";
import { Selector } from "./selector";
import { Simple } from "./simple";

const { delimited, map, option, pair, right, separatedList, zeroOrMore } =
  Parser;

type Item = Simple | Compound | Complex | Relative;

/**
 * {@link https://drafts.csswg.org/selectors/#selector-list}
 *
 * @public
 */
export class List<T extends Item = Item> extends Selector<"list"> {
  public static of<T extends Item>(...selectors: Array<T>): List<T> {
    return new List(selectors);
  }

  private readonly _selectors: Array<T>;
  private readonly _length: number;

  private constructor(selectors: Array<T>) {
    super("list");
    this._selectors = selectors;
    this._length = selectors.length;
  }

  public get selectors(): Iterable<T> {
    return this._selectors;
  }

  public get length(): number {
    return this._length;
  }

  public matches(element: Element, context?: Context): boolean {
    return this._selectors.some((selector) =>
      selector.matches(element, context),
    );
  }

  public equals(value: List): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof List && Array.equals(value._selectors, this._selectors)
    );
  }

  public *[Symbol.iterator](): Iterator<T> {
    yield* this._selectors;
  }

  public toJSON(): List.JSON<T> {
    return {
      ...super.toJSON(),
      selectors: Array.toJSON(this._selectors),
    };
  }

  public toString(): string {
    return this._selectors.map((selector) => selector.toString()).join(", ");
  }
}

/**
 * @public
 */
export namespace List {
  export interface JSON<T extends Item = Item> extends Selector.JSON<"list"> {
    selectors: Array<Serializable.ToJSON<T>>;
  }

  /**
   * {@link https://drafts.csswg.org/selectors/#typedef-selector-list}
   *
   * @internal
   */
  export const parseList = (parseSelector: Thunk<CSSParser<Absolute>>) =>
    map(
      separatedList(Complex.parseComplex(parseSelector), Comma.parse),
      (result) => List.of(...result),
    );
}

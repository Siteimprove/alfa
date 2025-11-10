import { Array } from "@siteimprove/alfa-array";
import { Comma, type Parser as CSSParser } from "@siteimprove/alfa-css";
import type { Element } from "@siteimprove/alfa-dom";
import type { Iterable } from "@siteimprove/alfa-iterable";
import type { Serializable } from "@siteimprove/alfa-json";
import { Parser } from "@siteimprove/alfa-parser";

import type { Context } from "../context.js";
import { Specificity } from "../specificity.js";

import { Complex } from "./complex.js";
import type { Compound } from "./compound.js";

import type { Absolute, Selector as SelectorType } from "./index.js";
import type { Relative } from "./relative.js";
import { Selector } from "./selector.js";
import type { Simple } from "./simple/index.js";

const { map, separatedList } = Parser;

/**
 * {@link https://drafts.csswg.org/selectors/#selector-list}
 *
 * @public
 */
export class List<T extends List.Item = List.Item> extends Selector<"list"> {
  public static of<T extends List.Item>(...selectors: Array<T>): List<T> {
    return new List(selectors);
  }

  private readonly _selectors: Array<T>;
  private readonly _length: number;

  protected constructor(selectors: Array<T>) {
    super(
      "list",
      Specificity.max(...selectors.map((selector) => selector.specificity)),
    );
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

  /** @internal */
  export type Item = Simple | Compound | Complex | Relative;

  export function isList(value: unknown): value is List {
    return value instanceof List;
  }

  /**
   * {@link https://www.w3.org/TR/selectors/#typedef-selector-list}
   * {@link https://www.w3.org/TR/selectors/#typedef-complex-selector-list}
   * {@link https://www.w3.org/TR/selectors/#typedef-compound-selector-list}
   * {@link https://www.w3.org/TR/selectors/#typedef-simple-selector-list}
   * {@link https://www.w3.org/TR/selectors/#typedef-relative-selector-list}
   */
  function parse<T extends Item>(
    parseSelector: Selector.ComponentParser<T>,
  ): CSSParser<List<T>> {
    return map(separatedList(parseSelector(), Comma.parse), (result) =>
      List.of(...result),
    );
  }

  /**
   * {@link https://www.w3.org/TR/selectors/#typedef-complex-selector-list}
   *
   * @internal
   */
  export const parseComplex = (
    parseSelector: Selector.ComponentParser<Absolute>,
  ) => parse(() => Complex.parseComplex(parseSelector));
}

import { Array } from "@siteimprove/alfa-array";
import { Comma, type Parser as CSSParser, Token } from "@siteimprove/alfa-css";
import type { Element } from "@siteimprove/alfa-dom";
import type { Iterable } from "@siteimprove/alfa-iterable";
import type { Serializable } from "@siteimprove/alfa-json";
import { Parser } from "@siteimprove/alfa-parser";

import type { Context } from "../context.js";
import { Specificity } from "../specificity.js";

import { Complex } from "./complex.js";
import type { Compound } from "./compound.js";

import type { Absolute } from "./index.js";
import { Relative } from "./relative.js";
import { BaseSelector } from "./selector.js";
import type { Simple } from "./simple/index.js";

const { either, end, map, separatedList, skip } = Parser;

/**
 * {@link https://drafts.csswg.org/selectors/#selector-list}
 *
 * @public
 */
export class List<
  T extends List.Item = List.Item,
> extends BaseSelector<"list"> {
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

  /**
   * Returns either the list or its unique item if it contains only one.
   *
   * @internal
   */
  public simplify(): T | this {
    if (this._selectors.length === 1) {
      return this._selectors[0];
    }

    return this;
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
  export interface JSON<T extends Item = Item>
    extends BaseSelector.JSON<"list"> {
    selectors: Array<Serializable.ToJSON<T>>;
  }

  /** @internal */
  export type Item = Simple | Compound | Complex | Relative;

  export function isList(value: unknown): value is List {
    return value instanceof List;
  }

  /**
   * {@link https://drafts.csswg.org/selectors/#typedef-selector-list}
   * {@link https://drafts.csswg.org/selectors/#typedef-complex-selector-list}
   * {@link https://drafts.csswg.org/selectors/#typedef-compound-selector-list}
   * {@link https://drafts.csswg.org/selectors/#typedef-simple-selector-list}
   * {@link https://drafts.csswg.org/selectors/#typedef-relative-selector-list}
   *
   * {@link https://drafts.csswg.org/selectors/#forgiving-selector}
   *
   * @remarks
   * We automatically simplify lists of 1 item as a way to speed up a bit
   * matching. Thus, we do not need to unwrap a 1-item list at every match.
   * List may end up totally empty, in the case of forgiving lists containing
   * only invalid selectors. This is expected by CSS syntax. In that case, we
   * keep the list. It is up to the wrapper to decide whether to match an empty
   * list.
   *
   * Only the top-level list needs to know whether it is forgiving or not. Inner
   * list depend on their contexts.
   * E.g., `:is(###, div)` is valid (forgiving list for `:is`), but
   * `:is(:not(###, div))` is not (non-forgiving list for `:not`, even in a
   * forgiving context).
   */
  function parseList<T extends Item>(
    parseSelector: BaseSelector.ComponentParser<T>,
    options?: BaseSelector.Options,
  ): CSSParser<T | List<T>> {
    const parser =
      (options?.forgiving ?? false)
        ? // In a forgiving context, if the parser errors, we discard all tokens
          // until the next comma (included).
          either(
            parseSelector(),
            Token.skipUntil(
              either(
                Comma.parse,
                end((token) => `Unexpected token ${token}`),
              ),
            ),
          )
        : parseSelector();
    return map(separatedList(parser, Comma.parse), (result) =>
      List.of(...result.filter((result) => result !== undefined)).simplify(),
    );
  }

  /**
   * {@link https://drafts.csswg.org/selectors/#typedef-selector-list}
   * {@link https://drafts.csswg.org/selectors/#typedef-complex-selector-list}
   *
   * @internal
   */
  export const parseComplex = (
    parseSelector: BaseSelector.ComponentParser<Absolute>,
    options?: BaseSelector.Options,
  ) => parseList(() => Complex.parse(parseSelector), options);

  /**
   * {@link https://drafts.csswg.org/selectors/#typedef-relative-selector-list}
   *
   * @internal
   */
  export const parseRelative = (
    parseSelector: BaseSelector.ComponentParser<Absolute>,
    options?: BaseSelector.Options,
  ) => parseList(() => Relative.parse(parseSelector), options);

  /**
   * @internal
   */
  export function parse(
    parseSelector: BaseSelector.ComponentParser<Absolute>,
    options?: BaseSelector.Options & { relative: true },
  ): CSSParser<Relative | List<Relative>>;

  export function parse(
    parseSelector: BaseSelector.ComponentParser<Absolute>,
    options?: BaseSelector.Options & { relative: false },
  ): CSSParser<Absolute>;

  export function parse(
    parseSelector: BaseSelector.ComponentParser<Absolute>,
    options?: BaseSelector.Options,
  ): CSSParser<Absolute>;

  export function parse(
    parseSelector: BaseSelector.ComponentParser<Absolute>,
    options?: BaseSelector.Options,
  ): CSSParser<Item | List<Item>> {
    return (options?.relative ?? false)
      ? parseRelative(parseSelector, options)
      : parseComplex(parseSelector, options);
  }
}

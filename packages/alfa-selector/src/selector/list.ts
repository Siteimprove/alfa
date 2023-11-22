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
  public static of<T extends Item>(left: T, right: T | List<T>): List<T> {
    return new List(left, right);
  }

  private readonly _left: T;
  private readonly _right: T | List<T>;

  private constructor(left: T, right: T | List<T>) {
    super("list");
    this._left = left;
    this._right = right;
  }

  public get left(): T {
    return this._left;
  }

  public get right(): T | List<T> {
    return this._right;
  }

  public matches(element: Element, context?: Context): boolean {
    return (
      this._left.matches(element, context) ||
      this._right.matches(element, context)
    );
  }

  public equals(value: List): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof List &&
      value._left.equals(this._left) &&
      value._right.equals(this._right)
    );
  }

  public *[Symbol.iterator](): Iterator<
    Simple | Compound | Complex | Relative
  > {
    yield this._left;
    yield* this._right;
  }

  public toJSON(): List.JSON<T> {
    return {
      ...super.toJSON(),
      left: this._left.toJSON() as Serializable.ToJSON<T>,
      right: this._right.toJSON() as Serializable.ToJSON<T> | List.JSON<T>,
    };
  }

  public toString(): string {
    return `${this._left}, ${this._right}`;
  }
}

/**
 * @public
 */
export namespace List {
  export interface JSON<T extends Item = Item> extends Selector.JSON<"list"> {
    left: Serializable.ToJSON<T>;
    right: Serializable.ToJSON<T> | JSON<T>;
  }

  /**
   * {@link https://drafts.csswg.org/selectors/#typedef-selector-list}
   *
   * @internal
   */
  export const parseList = (parseSelector: Thunk<CSSParser<Absolute>>) =>
    map(
      separatedList(Complex.parseComplex(parseSelector), Comma.parse),
      (result) => {
        const [left, ...selectors] = Array.from(Iterable.reverse(result));

        return Iterable.reduce(
          selectors,
          (right, left) => List.of(left, right),
          left as
            | Simple
            | Compound
            | Complex
            | List<Simple | Compound | Complex>,
        );
      },
    );
}

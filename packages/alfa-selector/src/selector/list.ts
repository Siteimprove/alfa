import { Token } from "@siteimprove/alfa-css";
import { Element } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Complex } from "./complex";
import { Compound } from "./compound";
import { Context } from "../context";
import { Relative } from "./relative";
import { Selector } from "./selector";
import { Simple } from "./simple";

const { delimited, map, option, pair, right, zeroOrMore } = Parser;

/**
 * {@link https://drafts.csswg.org/selectors/#selector-list}
 */
export class List<
  T extends Simple | Compound | Complex | Relative =
    | Simple
    | Compound
    | Complex
    | Relative,
> extends Selector<"list"> {
  public static of<T extends Simple | Compound | Complex | Relative>(
    left: T,
    right: T | List<T>,
  ): List<T> {
    return new List(left, right);
  }

  private readonly _left: T;
  private readonly _right: T | List<T>;

  private constructor(left: T, right: T | List<T>) {
    super();
    this._left = left;
    this._right = right;
  }

  public get left(): T {
    return this._left;
  }

  public get right(): T | List<T> {
    return this._right;
  }

  public get type(): "list" {
    return "list";
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

  public toJSON(): List.JSON {
    return {
      type: "list",
      left: this._left.toJSON(),
      right: this._right.toJSON(),
    };
  }

  public toString(): string {
    return `${this._left}, ${this._right}`;
  }
}

export namespace List {
  export interface JSON extends Selector.JSON<"list"> {
    left: Simple.JSON | Compound.JSON | Complex.JSON | Relative.JSON;
    right: Simple.JSON | Compound.JSON | Complex.JSON | Relative.JSON | JSON;
  }

  /**
   * {@link https://drafts.csswg.org/selectors/#typedef-selector-list}
   *
   * @internal
   */
  export const parseList = (
    parseSelector: () => Parser<
      Slice<Token>,
      Simple | Compound | Complex | List<Simple | Compound | Complex>,
      string
    >,
  ) =>
    map(
      pair(
        Complex.parseComplex(parseSelector),
        zeroOrMore(
          right(
            delimited(option(Token.parseWhitespace), Token.parseComma),
            Complex.parseComplex(parseSelector),
          ),
        ),
      ),
      (result) => {
        let [left, selectors] = result;

        [left, ...selectors] = [...Iterable.reverse(selectors), left];

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

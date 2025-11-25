import { Element } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import type { Option } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";

import { Context } from "../context.js";
import type { Selector } from "./index.js";
import { Specificity } from "../specificity.js";

import { Combinator } from "./combinator.js";
import { Compound } from "./compound.js";
import { BaseSelector } from "./selector.js";
import type { Class, Id, Simple, Type } from "./simple/index.js";

const { map, pair, zeroOrMore } = Parser;

/**
 * {@link https://drafts.csswg.org/selectors/#complex}
 *
 * @public
 */
export class Complex extends BaseSelector<"complex"> {
  public static of(
    combinator: Combinator,
    left: Simple | Compound | Complex,
    right: Simple | Compound,
  ): Complex {
    return new Complex(combinator, left, right);
  }

  private readonly _combinator: Combinator;
  private readonly _left: Simple | Compound | Complex;
  private readonly _right: Simple | Compound;
  protected readonly _key: Option<Id | Class | Type>;

  protected constructor(
    combinator: Combinator,
    left: Simple | Compound | Complex,
    right: Simple | Compound,
  ) {
    super(
      "complex",
      Specificity.sum(left.specificity, right.specificity),
      left.useContext || right.useContext,
    );
    this._combinator = combinator;
    this._left = left;
    this._right = right;

    this._key = right.key;
  }

  public get combinator(): Combinator {
    return this._combinator;
  }

  public get left(): Simple | Compound | Complex {
    return this._left;
  }

  public get right(): Simple | Compound {
    return this._right;
  }

  public matches(element: Element, context?: Context): boolean {
    return Combinator.matcher(
      this._left,
      this._combinator,
      this._right,
      element,
      context,
    );
  }

  public equals(value: Complex): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof Complex &&
      value._combinator === this._combinator &&
      value._left.equals(this._left) &&
      value._right.equals(this._right)
    );
  }

  public *[Symbol.iterator](): Iterator<Complex> {
    yield this;
  }

  public toJSON(): Complex.JSON {
    return {
      ...super.toJSON(),
      combinator: this._combinator,
      left: this._left.toJSON(),
      right: this._right.toJSON(),
    };
  }

  public toString(): string {
    const combinator =
      this._combinator === Combinator.Descendant
        ? " "
        : ` ${this._combinator} `;

    return `${this._left}${combinator}${this._right}`;
  }
}

/**
 * @public
 */
export namespace Complex {
  export interface JSON extends BaseSelector.JSON<"complex"> {
    combinator: Combinator;
    left: Simple.JSON | Compound.JSON | Complex.JSON;
    right: Simple.JSON | Compound.JSON;
  }

  export function isComplex(value: unknown): value is Complex {
    return value instanceof Complex;
  }

  /**
   * {@link https://drafts.csswg.org/selectors/#typedef-complex-selector}
   *
   * @internal
   */
  export const parse = (parseSelector: Selector.Parser.Component) =>
    map(
      pair(
        Compound.parse(parseSelector),
        zeroOrMore(pair(Combinator.parse, Compound.parse(parseSelector))),
      ),
      (result) => {
        const [left, selectors] = result;

        return Iterable.reduce(
          selectors,
          (left, [combinator, right]) => Complex.of(combinator, left, right),
          left as Simple | Compound | Complex,
        );
      },
    );
}

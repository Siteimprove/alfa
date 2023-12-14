import type { Parser as CSSParser } from "@siteimprove/alfa-css";
import { Element } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Option } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Thunk } from "@siteimprove/alfa-thunk";

import { Context } from "../context";
import type { Absolute } from "../selector";
import { Specificity } from "../specificity";

import { Combinator } from "./combinator";
import { Compound } from "./compound";
import { Selector } from "./selector";
import type { Class, Id, Simple, Type } from "./simple";

const { isElement } = Element;
const { map, pair, zeroOrMore } = Parser;

/**
 * {@link https://drafts.csswg.org/selectors/#complex}
 *
 * @public
 */
export class Complex extends Selector<"complex"> {
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

  private constructor(
    combinator: Combinator,
    left: Simple | Compound | Complex,
    right: Simple | Compound,
  ) {
    super("complex", Specificity.sum(left.specificity, right.specificity));
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
    // First, make sure that the right side of the selector, i.e. the part
    // that relates to the current element, matches.
    if (this._right.matches(element, context)) {
      // If it does, move on to the heavy part of the work: Looking either up
      // the tree for a descendant match or looking to the side of the tree
      // for a sibling match.
      switch (this._combinator) {
        case Combinator.Descendant:
          return element
            .ancestors()
            .filter(isElement)
            .some((element) => this._left.matches(element, context));

        case Combinator.DirectDescendant:
          return element
            .parent()
            .filter(isElement)
            .some((element) => this._left.matches(element, context));

        case Combinator.Sibling:
          return element
            .preceding()
            .filter(isElement)
            .some((element) => this._left.matches(element, context));

        case Combinator.DirectSibling:
          return element
            .preceding()
            .find(isElement)
            .some((element) => this._left.matches(element, context));
      }
    }

    return false;
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
  export interface JSON extends Selector.JSON<"complex"> {
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
  export const parseComplex = (parseSelector: Thunk<CSSParser<Absolute>>) =>
    map(
      pair(
        Compound.parseCompound(parseSelector),
        zeroOrMore(
          pair(
            Combinator.parseCombinator,
            Compound.parseCompound(parseSelector),
          ),
        ),
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

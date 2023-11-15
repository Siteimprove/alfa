import { Token } from "@siteimprove/alfa-css";
import type { Element } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";
import { Complex } from "./complex";

import type { Context } from "../context";
import { List } from "./list";
import { Selector } from "./selector";
import { Simple } from "./simple";

const { map, oneOrMore } = Parser;

/**
 * {@link https://drafts.csswg.org/selectors/#compound}
 */
export class Compound extends Selector<"compound"> {
  public static of(left: Simple, right: Simple | Compound): Compound {
    return new Compound(left, right);
  }

  private readonly _left: Simple;
  private readonly _right: Simple | Compound;

  private constructor(left: Simple, right: Simple | Compound) {
    super("compound");
    this._left = left;
    this._right = right;
  }

  public get left(): Simple {
    return this._left;
  }

  public get right(): Simple | Compound {
    return this._right;
  }

  public matches(element: Element, context?: Context): boolean {
    return (
      this._left.matches(element, context) &&
      this._right.matches(element, context)
    );
  }

  public equals(value: Compound): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof Compound &&
      value._left.equals(this._left) &&
      value._right.equals(this._right)
    );
  }

  public *[Symbol.iterator](): Iterator<Compound> {
    yield this;
  }

  public toJSON(): Compound.JSON {
    return {
      ...super.toJSON(),
      left: this._left.toJSON(),
      right: this._right.toJSON(),
    };
  }

  public toString(): string {
    return `${this._left}${this._right}`;
  }
}

export namespace Compound {
  export interface JSON extends Selector.JSON<"compound"> {
    left: Simple.JSON;
    right: Simple.JSON | JSON;
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
    parseSelector: () => Parser<
      Slice<Token>,
      Simple | Compound | Complex | List<Simple | Compound | Complex>,
      string
    >,
  ) =>
    map(oneOrMore(Simple.parse(parseSelector)), (result) => {
      const [left, ...selectors] = Iterable.reverse(result);

      return Iterable.reduce(
        selectors,
        (right, left) => Compound.of(left, right),
        left as Simple | Compound,
      );
    });
}

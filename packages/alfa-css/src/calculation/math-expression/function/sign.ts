import { Parser } from "@siteimprove/alfa-parser";

import {
  Function as CSSFunction,
  type Parser as CSSParser,
} from "../../../syntax/index.ts";

import { Unit } from "../../../unit/index.ts";

import { Angle, Length, Number, type Numeric } from "../../numeric/index.ts";

import { Expression } from "../expression.ts";
import { Kind } from "../kind.ts";
import { Value } from "../value.ts";

import { Function } from "./function.ts";

const { isAngle } = Angle;
const { isLength } = Length;
const { isNumber } = Number;
const { isValueExpression } = Value;

const { map } = Parser;

/**
 * {@link https://drafts.csswg.org/css-values/#sign-funcs}
 *
 * @public
 */
export class Sign extends Function<"sign", [Expression]> {
  public static of(expression: Expression): Sign {
    // `sign()` always resolves to a `<number>`, regardless of the type of its
    // argument.
    return new Sign([expression], Kind.of());
  }

  protected constructor(args: [Expression], kind: Kind) {
    super("sign", args, kind);
  }

  protected get _arg(): Expression {
    return this._args[0];
  }

  public reduce<
    L extends Unit.Length = Unit.Length.Canonical,
    P extends Numeric = Numeric,
  >(resolver: Expression.Resolver<L, P>): Expression {
    const reduced = this._arg.reduce(resolver);

    if (isValueExpression(reduced)) {
      const value = reduced.value;
      // At this point, the reduced arg should be either:
      // * a number
      // * an angle, in canonical unit (deg)
      // * an absolute length, in canonical unit (px)
      // * a percentage
      // * a relative length, in any unit
      // For the first three we know the sign; percentages aren't reduced
      // because it may end up being a percentage of a negative value.

      if (
        isNumber(value) ||
        (isAngle(value) && value.hasUnit(Unit.Angle.Canonical)) ||
        (isLength(value) && value.hasUnit(Unit.Length.Canonical))
      ) {
        return Value.of(Number.of(Math.sign(value.value)));
      }
      // reduced is a percentage or relative length, we just fall through to the
      // default case.
    }

    // reduced is an unreduced calculation, percentage, or relative length; we
    // keep the `sign()` wrapper.
    return new Sign([reduced], this._kind);
  }

  public toString(): string {
    return `sign(${this._arg})`;
  }
}

/** @public */
export namespace Sign {
  export function isSign(value: unknown): value is Sign {
    return value instanceof Sign;
  }

  export const parse = (parseSum: CSSParser<Expression>) =>
    map(
      CSSFunction.parse("sign", (input) => parseSum(input)),
      ([, expression]) => Sign.of(expression),
    );
}

import { Parser } from "@siteimprove/alfa-parser";

import {
  Function as CSSFunction,
  type Parser as CSSParser,
} from "../../../syntax/index.ts";

import { Unit } from "../../../unit/index.ts";

import { Angle, Length, Number, type Numeric } from "../../numeric/index.ts";

import { Expression } from "../expression.ts";
import type { Kind } from "../kind.ts";
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
export class Abs extends Function<"abs", [Expression]> {
  public static of(expression: Expression): Abs {
    // `abs()` keeps the type of its argument.
    return new Abs([expression], expression.kind);
  }

  protected constructor(args: [Expression], kind: Kind) {
    super("abs", args, kind);
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
      // The first three are reduce-able further; percentages aren't because it
      // may end up being a percentage of a negative value.

      if (isNumber(value)) {
        return Value.of(Number.of(Math.abs(value.value)));
      }

      if (isAngle(value) && value.hasUnit(Unit.Angle.Canonical)) {
        return Value.of(Angle.of(Math.abs(value.value), Unit.Angle.Canonical));
      }

      if (isLength(value) && value.hasUnit(Unit.Length.Canonical)) {
        return Value.of(
          Length.of(Math.abs(value.value), Unit.Length.Canonical),
        );
      }
      // reduced is a percentage or relative length, we just fall through to the
      // default case.
    }

    // reduced is an unreduced calculation, percentage, or relative length; we
    // keep the `abs()` wrapper. Rebuilding through `of` re-derives the kind
    // from the reduced argument, whose kind may differ from the original one
    // (e.g., a resolver substituting a percentage with a length).
    return Abs.of(reduced);
  }

  public toString(): string {
    return `abs(${this._arg})`;
  }
}

/** @public */
export namespace Abs {
  export function isAbs(value: unknown): value is Abs {
    return value instanceof Abs;
  }

  export const parse = (parseSum: CSSParser<Expression>) =>
    map(
      CSSFunction.parse("abs", (input) => parseSum(input)),
      ([, expression]) => Abs.of(expression),
    );
}

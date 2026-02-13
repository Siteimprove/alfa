import { Real } from "@siteimprove/alfa-math";
import { Parser } from "@siteimprove/alfa-parser";
import { Result } from "@siteimprove/alfa-result";
import { Tuple } from "@siteimprove/alfa-tuple";

import {
  Function as CSSFunction,
  type Parser as CSSParser,
  Token,
} from "../../../syntax/index.js";

import { Unit } from "../../../unit/index.js";

import { Angle, Length, Number, type Numeric } from "../../numeric/index.js";

import { Expression } from "../expression.js";
import type { Kind } from "../kind.js";
import { Value } from "../value.js";

import { Function } from "./function.js";

const { isAngle } = Angle;
const { isLength } = Length;
const { isNumber } = Number;
const { isValueExpression } = Value;

const { delimited, mapResult, option, separatedList } = Parser;

/**
 * {@link https://drafts.csswg.org/css-values/#comp-func}
 *
 * @public
 */
export class Clamp extends Function<
  "clamp",
  [Expression, Expression, Expression]
> {
  public static of(
    min: Expression,
    value: Expression,
    max: Expression,
  ): Result<Clamp, string> {
    // {@see https://drafts.csswg.org/css-values/#determine-the-type-of-a-calculation}
    const kind = [min, value, max].reduce(
      (old, cur) => old.flatMap((kind) => kind.add(cur.kind)),
      Result.of<Kind, string>(min.kind),
    );

    return kind.map((kind) => new Clamp(min, value, max, kind));
  }

  protected constructor(
    min: Expression,
    value: Expression,
    max: Expression,
    kind: Kind,
  ) {
    super("clamp", [min, value, max], kind);
  }

  public get min(): Expression {
    return this._args[0];
  }

  public get value(): Expression {
    return this._args[1];
  }

  public get max(): Expression {
    return this._args[2];
  }

  public reduce<
    L extends Unit.Length = Unit.Length.Canonical,
    P extends Numeric = Numeric,
  >(resolver: Expression.Resolver<L, P>): Expression {
    // We know from the guard in Clamp.of that all args have the same kind.

    const reduced = Tuple.map(this._args, (expr) => expr.reduce(resolver));

    if (Tuple.every(reduced, isValueExpression)) {
      const values = reduced.map((expr) => expr.value);
      const [lower, value, upper] = Tuple.map(values, (value) => value.value);
      // At this point, reduced args should be either:
      // * numbers
      // * angle, in canonical unit (deg)
      // * absolute length, in canonical unit (px)
      // * percentages
      // * relative length, in any unit
      // The first three are reduce-able further; percentages aren't because it
      // may end up being percentages of negative values.
      if (values.every(isNumber)) {
        return Value.of(Number.of(Real.clamp(value, lower, upper)));
      }

      if (
        Tuple.every(
          values,
          // The unit test is theoretically not needed since reduced angle values
          // should always be in the canonical unit (no relative angles)
          (value) => isAngle(value) && value.hasUnit(Unit.Angle.Canonical),
        )
      ) {
        return Value.of(
          Angle.of(Real.clamp(value, lower, upper), Unit.Angle.Canonical),
        );
      }

      if (
        Tuple.every(
          values,
          (value) => isLength(value) && value.hasUnit(Unit.Length.Canonical),
        )
      ) {
        return Value.of(
          Length.of(Real.clamp(value, lower, upper), Unit.Length.Canonical),
        );
      }
      // reduced contains percentages or relative lengths, we just fall through
      // to the default case.
    }

    // reduced contains unreduced calculations, we could eagerly compact on the
    // fully reduced ones, but it's easier to just keep everything
    return new Clamp(reduced[0], reduced[1], reduced[2], this._kind);
  }

  public toString(): string {
    return `clamp(${this._args.map((expr) => expr.toString()).join(", ")})`;
  }
}

/** @public */
export namespace Clamp {
  export function isClamp(value: unknown): value is Clamp {
    return value instanceof Clamp;
  }

  export const parse = (parseSum: CSSParser<Expression>) =>
    mapResult(
      CSSFunction.parse("clamp", (input) =>
        separatedList(
          parseSum,
          delimited(option(Token.parseWhitespace), Token.parseComma),
          3,
          3,
        )(input),
      ),
      ([, args]) => Clamp.of(args[0], args[1], args[2]),
    );
}

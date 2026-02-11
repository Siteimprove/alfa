import { Array } from "@siteimprove/alfa-array";
import { Parser } from "@siteimprove/alfa-parser";
import { Result } from "@siteimprove/alfa-result";

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

export class Max extends Function<"max", [Expression, ...Array<Expression>]> {
  public static of(
    first: Expression,
    ...expressions: ReadonlyArray<Expression>
  ): Result<Max, string> {
    // {@see https://drafts.csswg.org/css-values/#determine-the-type-of-a-calculation}
    const kind = expressions.reduce(
      (old, cur) => old.flatMap((kind) => kind.add(cur.kind)),
      Result.of<Kind, string>(first.kind),
    );

    return kind.map((kind) => new Max([first, ...expressions], kind));
  }

  protected constructor(args: [Expression, ...Array<Expression>], kind: Kind) {
    super("max", args, kind);
  }

  public reduce<
    L extends Unit.Length = Unit.Length.Canonical,
    P extends Numeric = Numeric,
  >(resolver: Expression.Resolver<L, P>): Expression {
    // We know from the guard in Max.of that all args have the same kind.

    const reduced = this._args.map((expr) => expr.reduce(resolver));

    if (Array.every(reduced, isValueExpression)) {
      const values = reduced.map((expr) => expr.value);
      // At this point, reduced args should be either:
      // * numbers
      // * angle, in canonical unit (deg)
      // * absolute length, in canonical unit (px)
      // * percentages
      // * relative length, in any unit
      // The first three are reduce-able further; percentages aren't because it
      // may end up being percentages of negative values.

      if (values.every(isNumber)) {
        return Value.of(
          Number.of(Math.max(...values.map((value) => value.value))),
        );
      }

      if (
        values.every(
          // The unit test is theoretically not needed since reduced angle values
          // should always be in the canonical unit (no relative angles)
          (value) => isAngle(value) && value.hasUnit(Unit.Angle.Canonical),
        )
      ) {
        return Value.of(
          Angle.of(
            Math.max(...values.map((value) => value.value)),
            Unit.Angle.Canonical,
          ),
        );
      }

      if (
        values.every(
          (value) => isLength(value) && value.hasUnit(Unit.Length.Canonical),
        )
      ) {
        return Value.of(
          Length.of(
            Math.max(...values.map((value) => value.value)),
            Unit.Length.Canonical,
          ),
        );
      }
      // reduced contains percentages or relative lengths, we just fall through
      // to the default case.
    }

    // reduced contains unreduced calculations, we could eagerly compact on the
    // fully reduced ones, but it's easier to just keep everything
    return new Max(reduced as [Expression, ...Array<Expression>], this._kind);
  }

  public toString(): string {
    return `max(${this._args.map((expr) => expr.toString()).join(", ")})`;
  }
}

export namespace Max {
  export function isMax(value: unknown): value is Max {
    return value instanceof Max;
  }

  export const parse = (parseSum: CSSParser<Expression>) =>
    mapResult(
      CSSFunction.parse("max", (input) =>
        separatedList(
          parseSum,
          delimited(option(Token.parseWhitespace), Token.parseComma),
        )(input),
      ),
      ([, args]) => Max.of(...args),
    );
}

import { Parser } from "@siteimprove/alfa-parser";
import {
  Function as CSSFunction,
  type Parser as CSSParser,
} from "../../../syntax/index.ts";

import { Unit } from "../../../unit/index.ts";

import type { Numeric } from "../../numeric/index.ts";

import { Expression } from "../expression.ts";
import type { Kind } from "../kind.ts";
import { Value } from "../value.ts";

import { Function } from "./function.ts";

const { isValueExpression } = Value;

const { map } = Parser;

/**
 * {@link https://drafts.csswg.org/css-values/#calc-func}
 *
 * @public
 */
export class Calculation extends Function<"calculation", [Expression]> {
  public static of(expression: Expression): Calculation {
    return new Calculation([expression], expression.kind);
  }

  protected constructor(args: [Expression], kind: Kind) {
    super("calculation", args, kind);
  }

  public reduce<
    L extends Unit.Length = Unit.Length.Canonical,
    P extends Numeric = Numeric,
  >(resolver: Expression.Resolver<L, P>): Expression {
    const reduced = this._args[0].reduce(resolver);

    // If the calculation reduces to a value, no need to keep
    // the `calc()` wrapper.
    return isValueExpression(reduced) ? reduced : Calculation.of(reduced);
  }

  public toString(): string {
    return `calc(${this._args[0]})`;
  }
}

/** @public */
export namespace Calculation {
  export function isCalculation(value: unknown): value is Calculation {
    return value instanceof Calculation;
  }

  export const parse = (parseSum: CSSParser<Expression>) =>
    map(
      CSSFunction.parse("calc", (input) => parseSum(input)),
      ([, expression]) => Calculation.of(expression),
    );
}

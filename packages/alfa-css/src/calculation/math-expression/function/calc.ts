import { Parser } from "@siteimprove/alfa-parser";
import {
  Function as CSSFunction,
  type Parser as CSSParser,
} from "../../../syntax/index.js";

import { Unit } from "../../../unit/index.js";

import type { Numeric } from "../../numeric/index.js";

import { Expression } from "../expression.js";
import type { Kind } from "../kind.js";
import { Value } from "../value.js";

import { Function } from "./function.js";

const { isValueExpression } = Value;

const { map } = Parser;

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

import { Parser } from "@siteimprove/alfa-parser";

import { type Parser as CSSParser, Token } from "../../../syntax/index.js";

import { Expression } from "../expression.js";

import { Calculation } from "./calc.js";
import { Clamp } from "./clamp.js";
import { Max } from "./max.js";
import { Min } from "./min.js";

const { exclusive } = Parser;

/** @public */
export type Function = Calculation | Clamp | Max | Min;

/** @public */
export namespace Function {
  export const { isCalculation } = Calculation;

  export const { isMax } = Max;

  export const { isMin } = Min;

  const names = ["calc", "clamp", "max", "min"] as const;
  type Name = (typeof names)[number];

  const parsers: Record<
    Name,
    (parseSum: CSSParser<Expression>) => CSSParser<Function>
  > = {
    calc: Calculation.parse,
    clamp: Clamp.parse,
    max: Max.parse,
    min: Min.parse,
  };

  /**
   * Parses a math function in a calculation.
   *
   * @param parseSum - A parser for the sum production in a calculation.
   */
  export function parse(parseSum: CSSParser<Expression>): CSSParser<Function> {
    return exclusive(Token.parseFunction(names), (fn) =>
      parsers[fn.value](parseSum),
    );
  }
}

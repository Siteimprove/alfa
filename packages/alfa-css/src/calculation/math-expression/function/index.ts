import { Parser } from "@siteimprove/alfa-parser";

import { type Parser as CSSParser, Token } from "../../../syntax/index.js";

import { Expression } from "../expression.js";

import { Calculation } from "./calc.js";
import { Max } from "./max.js";
import { Min } from "./min.js";

const { exclusive } = Parser;

/** @public */
export type Function = Calculation | Max | Min;

/** @public */
export namespace Function {
  export const { isCalculation } = Calculation;

  export const { isMax } = Max;

  export const { isMin } = Min;

  const names = ["calc", "max", "min"] as const;
  type Name = (typeof names)[number];

  const parsers: Record<
    Name,
    (parseSum: CSSParser<Expression>) => CSSParser<Function>
  > = {
    calc: Calculation.parse,
    max: Max.parse,
    min: Min.parse,
  };

  /**
   * Parses a math function in a calculation.
   *
   * @param parseSum - A parser for the sum production in a calculation.
   *
   * @privateRemarks
   * The `either` will repeatedly try to parse the first token. This could be
   * optimized a bit by pre-looking at it and selecting the right parser based
   * on it. This is likely not a hot-path because calculations aren't that
   * common (especially functions other than `calc`), and there are relatively
   * few functions now. So keeping it that way for the sake of simplicity for now.
   */
  export function parse(parseSum: CSSParser<Expression>): CSSParser<Function> {
    return exclusive(Token.parseFunction(names), (fn) =>
      parsers[fn.value](parseSum),
    );
  }
}

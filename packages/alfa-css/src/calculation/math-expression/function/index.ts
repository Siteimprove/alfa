import { Parser } from "@siteimprove/alfa-parser";

import { type Parser as CSSParser, Token } from "../../../syntax/index.ts";

import { Expression } from "../expression.ts";

import { Abs } from "./abs.ts";
import { Calculation } from "./calc.ts";
import { Clamp } from "./clamp.ts";
import { Max } from "./max.ts";
import { Min } from "./min.ts";
import { Sign } from "./sign.ts";

const { exclusive } = Parser;

/** @public */
export type Function = Abs | Calculation | Clamp | Max | Min | Sign;

/** @public */
export namespace Function {
  export const { isAbs } = Abs;

  export const { isCalculation } = Calculation;

  export const { isMax } = Max;

  export const { isMin } = Min;

  export const { isSign } = Sign;

  const names = ["abs", "calc", "clamp", "max", "min", "sign"] as const;
  type Name = (typeof names)[number];

  const parsers: Record<
    Name,
    (parseSum: CSSParser<Expression>) => CSSParser<Function>
  > = {
    abs: Abs.parse,
    calc: Calculation.parse,
    clamp: Clamp.parse,
    max: Max.parse,
    min: Min.parse,
    sign: Sign.parse,
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

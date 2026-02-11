import { Parser } from "@siteimprove/alfa-parser";

import { type Parser as CSSParser } from "../../../syntax/index.js";

import { Expression } from "../expression.js";

import { Calculation } from "./calc.js";
import { Max } from "./max.js";

const { either } = Parser;

/** @public */
export type Function = Calculation | Max;

/** @public */
export namespace Function {
  export const { isCalculation } = Calculation;

  export const { isMax } = Max;

  export function parse(parseSum: CSSParser<Expression>): CSSParser<Function> {
    return either(Calculation.parse(parseSum), Max.parse(parseSum));
  }
}

/**
 * Compound values are unions of CSS values together with convenient helpers
 * (parser and resolver).
 * They are mostly intended to wrap the Math expressions in an abstraction that
 * can easily by used by the individual properties.
 *
 * @internal
 */

import {
  Length as CSSLength,
  Math,
  Number as CSSNumber,
  Percentage,
  type Token,
} from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import type { Slice } from "@siteimprove/alfa-slice";
import { Resolver } from "../../resolver";

import type { Style } from "../../style";

const { either } = Parser;

/**
 * @internal
 */
export namespace LengthPercentage {
  /**
   * {@link https://drafts.csswg.org/css-values/#mixed-percentages}
   */
  export type LengthPercentage =
    | CSSLength
    | Percentage
    | Math<"length-percentage">;

  export function isLengthPercentage(
    value: unknown
  ): value is LengthPercentage {
    return (
      CSSLength.isLength(value) ||
      Percentage.isPercentage(value) ||
      (Math.isCalculation(value) && value.isDimensionPercentage("length"))
    );
  }

  export const parse = either<Slice<Token>, LengthPercentage, string>(
    Percentage.parse,
    CSSLength.parse,
    Math.parseLengthPercentage
  );

  /**
   * Resolve a LengthPercentage into an absolute Length in pixels.
   *
   * @param value the LengthPercentage to resolve
   * @param percentageBase the absolute Length to resolve percentages against
   * @param lengthBase the style whose font-size serves as base for resolving
   * relative lengths (usually the element's own style, or its parent's style).
   */
  export function resolve(
    value: LengthPercentage,
    percentageBase: CSSLength<"px">,
    lengthBase: Style
  ): CSSLength<"px"> {
    const percentage = Resolver.percentage(percentageBase);
    const length = Resolver.length(lengthBase);

    switch (value.type) {
      case "math expression":
        // Since the calculation has been parsed and typed, there should
        // always be something to get.
        return value.resolve({ length, percentage }).getUnsafe();

      case "length":
        return length(value);

      case "percentage": {
        return percentage(value);
      }
    }
  }
}

/**
 * @internal
 */
export namespace Length {
  /**
   * {@link https://drafts.csswg.org/css-values/#lengths}
   */
  export type Length = CSSLength | Math<"length">;

  export function isLength(value: unknown): value is Length {
    return (
      CSSLength.isLength(value) ||
      (Math.isCalculation(value) && value.isDimension("length"))
    );
  }

  export const parse = either(CSSLength.parse, Math.parseLength);

  /**
   * Resolve a Length into an absolute Length in pixels.
   *
   * @param value the LengthPercentage to resolve
   * @param lengthBase the style whose font-size serves as base for resolving
   * relative lengths (usually the element's own style, or its parent's style).
   */
  export function resolve(value: Length, lengthBase: Style): CSSLength<"px"> {
    const length = Resolver.length(lengthBase);

    switch (value.type) {
      case "math expression":
        // Since the calculation has been parsed and typed, there should
        // always be something to get.
        return value.resolve({ length }).getUnsafe();

      case "length":
        return length(value);
    }
  }
}

/**
 * @internal
 */
export namespace Number {
  export type Number = CSSNumber | Math<"number">;

  export function isNumber(value: unknown): value is Number {
    return (
      CSSNumber.isNumber(value) ||
      (Math.isCalculation(value) && value.isNumber())
    );
  }

  export const parse = either(CSSNumber.parse, Math.parseNumber);

  /**
   * Resolve a Number .
   *
   * @param value the Number to resolve
   */
  export function resolve(value: Number): CSSNumber {
    switch (value.type) {
      case "math expression":
        // Since the calculation has been parsed and typed, there should
        // always be something to get.
        return value.resolve().getUnsafe();
      case "number":
        return value;
    }
  }
}

/**
 * Compound values are unions of CSS values together with convenient helpers
 * (parser and resolver).
 * They are mostly intended to wrap the Math expressions in an abstraction that
 * can easily by used by the individual properties.
 *
 * @internal
 */

import { Length, Math, Percentage, type Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Selective } from "@siteimprove/alfa-selective";
import type { Slice } from "@siteimprove/alfa-slice";

import {
  Length as BaseLength,
  Percentage as BasePercentage,
} from "@siteimprove/alfa-css/src/calculation/numeric";

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
    | Length
    | Percentage.Fixed
    | Math<"length-percentage">;

  export function isLengthPercentage(
    value: unknown
  ): value is LengthPercentage {
    return (
      Length.isLength(value) ||
      Percentage.isPercentage(value) ||
      (Math.isCalculation(value) && value.isDimensionPercentage("length"))
    );
  }

  export const parse = either<Slice<Token>, LengthPercentage, string>(
    Percentage.parseBase,
    Length.parse,
    Math.parseLengthPercentage
  );

  /**
   * Resolve a LengthPercentage into an absolute Length in pixels.
   *
   * @param percentageBase the absolute Length to resolve percentages against
   * @param lengthBase the style whose font-size serves as base for resolving
   * relative lengths (usually the element's own style, or its parent's style).
   */
  export function resolve(
    percentageBase: Length.Fixed<"px">,
    lengthBase: Style
  ): (value: LengthPercentage) => Length.Fixed<"px"> {
    return (value) => {
      const percentage: (p: BasePercentage) => BaseLength<"px"> = (p) =>
        BaseLength.of(percentageBase.value, percentageBase.unit).scale(p.value);

      const length: (l: BaseLength) => BaseLength<"px"> = (l) => {
        const resolved = Length.of(l).resolve(Resolver.length(lengthBase));
        return BaseLength.of(resolved.value, resolved.unit);
      };

      return Selective.of(value)
        .if(Length.isLength, (value) =>
          value.resolve(Resolver.length(lengthBase))
        )
        .if(Percentage.isPercentage, (value) =>
          Length.of(percentage(BasePercentage.of(value.value)))
        )
        .else((value) =>
          Length.of(value.resolve2({ length, percentage }).getUnsafe())
        )
        .get();
    };
  }
}

import { Length, Math, Percentage, type Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import type { Slice } from "@siteimprove/alfa-slice";
import { Resolver } from "../../resolver";

import type { Style } from "../../style";

const { either } = Parser;

/**
 * Compound values are unions of CSS values together with convenient helpers
 * (parser and resolver).
 * They are mostly intended to wrap the Math expressions in an abstraction that
 * can easily by used by the individual properties.
 *
 * @internal
 */
export namespace Compound {
  export namespace LengthPercentage {
    /**
     * {@link https://drafts.csswg.org/css-values/#mixed-percentages}
     */
    export type LengthPercentage =
      | Length
      | Percentage
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
      Percentage.parse,
      Length.parse,
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
      percentageBase: Length<"px">,
      lengthBase: Style
    ): Length<"px"> {
      const percentage = Resolver.percentage(percentageBase);
      const length = Resolver.length(lengthBase);

      switch (value.type) {
        case "math expression":
          return (
            value
              .resolve({ length, percentage })
              // Since the calculation has been parsed and typed, there should
              // always be something to get.
              .getUnsafe()
          );

        case "length":
          return length(value);

        case "percentage": {
          return percentage(value);
        }
      }
    }
  }
}

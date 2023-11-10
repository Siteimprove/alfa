import { Real } from "@siteimprove/alfa-math";

import { LengthPercentage } from "../numeric";
import { Value } from "../value";

type Radius = LengthPercentage;

export type Corner = Radius | readonly [Radius, Radius];

/**
 * @internal
 */
export namespace Corner {
  export type Canonical =
    | LengthPercentage.Canonical
    | readonly [LengthPercentage.Canonical, LengthPercentage.Canonical];

  export function hasCalculation(corner: Corner): boolean {
    return LengthPercentage.isLengthPercentage(corner)
      ? Value.hasCalculation(corner)
      : Value.hasCalculation(corner[0] || Value.hasCalculation(corner[1]));
  }

  export function resolve(
    resolver: LengthPercentage.Resolver,
  ): (value: Corner) => Canonical {
    function resolveAndClamp(
      radius: LengthPercentage,
    ): LengthPercentage.Canonical {
      const resolved = LengthPercentage.resolve(resolver)(radius);

      return LengthPercentage.of(
        Real.clamp(resolved.value, 0, Infinity),
        resolved.unit,
      );
    }

    return (value) =>
      LengthPercentage.isLengthPercentage(value)
        ? resolveAndClamp(value)
        : [resolveAndClamp(value[0]), resolveAndClamp(value[1])];
  }

  export type PartiallyResolved =
    | LengthPercentage.PartiallyResolved
    | readonly [
        LengthPercentage.PartiallyResolved,
        LengthPercentage.PartiallyResolved,
      ];

  export function partiallyResolve(
    resolver: LengthPercentage.PartialResolver,
  ): (value: Corner) => PartiallyResolved {
    function resolveAndClamp(
      radius: LengthPercentage,
    ): LengthPercentage.PartiallyResolved {
      const resolved = LengthPercentage.partiallyResolve(resolver)(radius);

      if (resolved.hasCalculation()) {
        return resolved;
      }

      const clamped = Real.clamp(resolved.value, 0, Infinity);

      return LengthPercentage.isPercentage(resolved)
        ? LengthPercentage.of(clamped)
        : LengthPercentage.of(clamped, resolved.unit);
    }

    return (value) =>
      LengthPercentage.isLengthPercentage(value)
        ? resolveAndClamp(value)
        : [resolveAndClamp(value[0]), resolveAndClamp(value[1])];
  }
}

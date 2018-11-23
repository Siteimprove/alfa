import { Units } from "./units";

/**
 * Convertible units are sets of units where each unit within a given set can be
 * converted to another unit within the same set. With the exception of relative
 * lengths, all units defined in CSS are convertible.
 */
type ConvertibleUnit =
  | Units.AbsoluteLength
  | Units.Angle
  | Units.Time
  | Units.Frequency
  | Units.Resolution;

/**
 * Rates are mappings from units within a set of units to how each unit
 * corresponds to the canonical unit within the set of units. For example, given
 * the set of units U:
 *
 * ```
 * type U = "foo" | "bar" | "baz";
 * ```
 *
 * ...where the canonical unit is "foo", we could create a mapping M:
 *
 * ```
 * const M: Rates<U> = {
 *   "foo": 1,
 *   "bar": 0.5,
 *   "baz": 2
 * };
 * ```
 *
 * What these rates tell us is that 1 "bar" corresponds to 0.5 "foo" and that
 * 1 "baz" corresponds to 2 "foo". It also tells us that 1 "baz" corresponds to
 * 2 / 0.5 = 4 "bar", effectively allowing us to convert between all units
 * within the set.
 */
type Rates<U extends ConvertibleUnit> = { readonly [P in U]: number };

/**
 * Given a function that returns a set of rates for a set of units, construct a
 * set of rates for the set of units. This may seem redundant, and it indeed is
 * as it's simply the identity function, but provides us with an easy way of
 * performing rate construction within a closure.
 */
function rates<U extends ConvertibleUnit>(fn: () => Rates<U>): Rates<U> {
  return fn();
}

/**
 * Converters are functions that convert an input value from one unit within a
 * set of units to another unit within the same set of units.
 */
type Converter<U extends ConvertibleUnit> = (
  value: number,
  from: U,
  to: U
) => number;

/**
 * Given a set of rates for a set of units, construct a converter for the set of
 * units.
 */
function converter<U extends ConvertibleUnit>(rates: Rates<U>): Converter<U> {
  return (value, from, to) => value * (rates[from] / rates[to]);
}

export namespace Converters {
  /**
   * @see https://www.w3.org/TR/css-values/#lengths
   */
  export const length: Converter<Units.AbsoluteLength> = converter(
    rates(() => {
      const px = 1;

      const inch = 96;

      const cm = inch / 2.54;
      const mm = cm / 10;
      const Q = cm / 40;

      const pc = inch / 6;
      const pt = inch / 72;

      return {
        cm,
        mm,
        Q,
        in: inch,
        pc,
        pt,
        px
      };
    })
  );
}

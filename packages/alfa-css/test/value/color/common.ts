import type { Mapper } from "@siteimprove/alfa-mapper";
import { Real } from "@siteimprove/alfa-math";
import { RNGFactory } from "@siteimprove/alfa-rng";

import {
  Angle,
  type Number as Num,
  type Percentage,
} from "../../../src/index.js";

/** @internal */
export type Component = [number | "none", "number" | "other"];

/**
 * Generates a random number between 0-1, rounded to 3 decimal places, with
 * (approx) noneChance of being "none".
 *
 * @privateRemarks
 * The chance of being "none" is actually (noneChance) / (1 + noneChance), since
 * it simplifies the mapping of the rest to the [0, 1] range.
 */
function roundOrNone(noneChance: number = 0): (num: number) => number | "none" {
  return (num) => {
    const x = Real.round(num * (1 + noneChance), 3);

    return x > 1 ? "none" : x;
  };
}

const colorRNG = (noneChance?: number, seed?: number) =>
  RNGFactory.of(seed).map(roundOrNone(noneChance)).group(4);

const typeRNG = (numChance: number = 0.5) =>
  RNGFactory.of()
    // "other" may mean percentage or angle, but we group by 4 and at most one
    // is an angle, so we only switch at print-time.
    .map((x) => (x < numChance ? "number" : "other"))
    .group(4);
/**
 * Generates 4 components between 0 and 1, with (approx) noneChance of each of
 * them being "none", and (exactly) numChance of each of them being a "number"
 * (else, "other").
 *
 * @internal
 */
export const rng =
  (componentMapper: Mapper<Array<Component>> = (c) => c) =>
  (noneChance?: number, numChance?: number, seed?: number) =>
    colorRNG(noneChance, seed)
      .zip(typeRNG(numChance))
      .map(componentMapper)
      .create();

/** @internal */
export namespace Component {
  const zeroIsZero = (value: number) =>
    value === 0 /* matches -0 */ ? 0 : value;

  const scaler =
    (kind: "number" | "other") =>
    (min: number, max: number, decimals?: number) =>
    ([value, type]: Component): Component =>
      value === "none"
        ? ["none", type]
        : type === kind
          ? [zeroIsZero(Real.round(value * (max - min) + min, decimals)), type]
          : [value, type];

  export const numberScaler = scaler("number");

  const otherScaler = scaler("other");

  export const allScaler =
    (
      minNumber: number,
      maxNumber: number,
      minOther: number,
      maxOther: number,
      decOther?: number,
    ) =>
    (component: Component): Component =>
      otherScaler(
        minOther,
        maxOther,
        decOther,
      )(numberScaler(minNumber, maxNumber)(component));

  const toNumberPercentageString = ([value, type]: Component) =>
    value === "none"
      ? "none"
      : type === "number"
        ? `${value}`
        : `${Real.round(value * 100, 1)}%`;

  const toAngleNumberString = ([value, type]: Component) =>
    value === "none"
      ? "none"
      : type === "number"
        ? `${Real.round(value * 360)}`
        : `${value}turn`;

  const toPercentageFakePercentageString = ([value, type]: Component) =>
    value === "none"
      ? "none"
      : type === "number"
        ? `${Real.round(value * 100, 1)}`
        : `${Real.round(value * 100, 1)}%`;

  export const toString = toNumberPercentageString;
  export const toHueString = toAngleNumberString;
  export const toSaturationString = toPercentageFakePercentageString;
  export const toLightnessString = toPercentageFakePercentageString;
  export const toWhitenessString = toPercentageFakePercentageString;
  export const toBlacknessString = toPercentageFakePercentageString;

  function toNumberPercentageJSON([value, type]: Component):
    | Num.Fixed.JSON
    | Percentage.Fixed.JSON {
    if (value === "none") {
      return { type: "number", value: 0 };
    }

    return type === "number"
      ? { type: "number", value }
      : { type: "percentage", value: value };
  }

  function toAngleNumberJSON([value, type]: Component):
    | Angle.Fixed.JSON
    | Num.Fixed.JSON {
    if (value === "none") {
      return { type: "number", value: 0 };
    }

    return type === "other"
      ? Angle.of(value, "turn").withUnit("deg").toJSON()
      : { type: "number", value: Real.round(value * 360) };
  }

  function toPercentageFakePercentageJSON([
    value,
  ]: Component): Percentage.Fixed.JSON {
    return {
      type: "percentage",
      value: value === "none" ? 0 : value,
    };
  }

  function toNumberJSON(
    percentageBase: number,
  ): ([value, type]: Component) => Num.Fixed.JSON {
    return ([value, type]) => ({
      type: "number",
      value:
        value === "none"
          ? 0
          : type === "other"
            ? // The actual number of significant digits depends on the base, but
              // should be less than 3 because we round radom numbers to 3 digits.
              // Given that this is only for correcting small floating point drifts
              // 3 digits should not be too much and include the drift.
              Real.round(value * percentageBase, 3)
            : value,
    });
  }

  export const toJSON = toNumberPercentageJSON;
  export const toHueJSON = toAngleNumberJSON;
  export const toSaturationJSON = toPercentageFakePercentageJSON;
  export const toLightnessJSON = toPercentageFakePercentageJSON;
  export const toWhitenessJSON = toPercentageFakePercentageJSON;
  export const toBlacknessJSON = toPercentageFakePercentageJSON;
  export const toLabLightnessJSON = toNumberJSON(100);
  export const toLCHLightnessJSON = toNumberJSON(100);
  export const toLabComponentJSON = toNumberJSON(125);
  export const toLCHChromaJSON = toNumberJSON(150);
  export const toOklabLightnessJSON = toNumberJSON(1);
  export const toOklabComponentJSON = toNumberJSON(0.4);
}

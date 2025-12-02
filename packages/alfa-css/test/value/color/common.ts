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
 * (else, "other"").
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
  const scaler =
    (kind: "number" | "other") =>
    (min: number, max: number) =>
    ([value, type]: Component): Component =>
      value === "none"
        ? ["none", type]
        : type === kind
          ? [Real.round(value * (max - min) + min), type]
          : [value, type];

  export const numberScaler = scaler("number");

  export const toNumberPercentageString = ([value, type]: Component) =>
    value === "none"
      ? "none"
      : type === "number"
        ? `${value}`
        : `${value * 100}%`;

  export const toAngleNumberString = ([value, type]: Component) =>
    value === "none"
      ? "none"
      : type === "number"
        ? `${Real.round(value * 360)}`
        : `${value}turn`;

  export const toPercentageFakePercentageString = ([value, type]: Component) =>
    value === "none"
      ? "none"
      : type === "number"
        ? `${value * 100}`
        : `${value * 100}%`;

  export const toString = toNumberPercentageString;
  export const toHueString = toAngleNumberString;
  export const toSaturationString = toPercentageFakePercentageString;
  export const toLightnessString = toPercentageFakePercentageString;
  export const toWhitenessString = toPercentageFakePercentageString;
  export const toBlacknessString = toPercentageFakePercentageString;

  export function toNumberPercentageJSON([value, type]: Component):
    | Num.Fixed.JSON
    | Percentage.Fixed.JSON {
    if (value === "none") {
      return { type: "number", value: 0 };
    }

    return type === "number"
      ? { type: "number", value }
      : { type: "percentage", value: value };
  }

  export function toAngleNumberJSON([value, type]: Component):
    | Angle.Fixed.JSON
    | Num.Fixed.JSON {
    if (value === "none") {
      return { type: "number", value: 0 };
    }

    return type === "other"
      ? Angle.of(value, "turn").withUnit("deg").toJSON()
      : { type: "number", value: Real.round(value * 360) };
  }

  export function toPercentageFakePercentageJSON([
    value,
  ]: Component): Percentage.Fixed.JSON {
    return {
      type: "percentage",
      value: value === "none" ? 0 : value,
    };
  }

  export const toJSON = toNumberPercentageJSON;
  export const toHueJSON = toAngleNumberJSON;
  export const toSaturationJSON = toPercentageFakePercentageJSON;
  export const toLightnessJSON = toPercentageFakePercentageJSON;
  export const toWhitenessJSON = toPercentageFakePercentageJSON;
  export const toBlacknessJSON = toPercentageFakePercentageJSON;
}

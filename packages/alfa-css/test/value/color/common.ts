import { RNGFactory } from "@siteimprove/alfa-rng";

type Component = [number | "none", "number" | "percentage"];

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
    const x =
      Math.round((num + Number.EPSILON) * (1 + noneChance) * 1000) / 1000;

    return x > 1 ? "none" : x;
  };
}

/** @internal */
export const colorRNG = (noneChance?: number) =>
  RNGFactory.of().map(roundOrNone(noneChance)).group(4);
/** @internal */
export const typeRNG = (numChance: number = 0.5) =>
  RNGFactory.of()
    .map((x) => (x < numChance ? "number" : "percentage"))
    .group(4);
/**
 * Generates 4 component, with (àpprox) noneChance of each of them being "none",
 * and (exactly) numChance of each of them being a number (else, percentage).
 *
 * @internal
 */
export const rng = (noneChance?: number, numChance?: number) =>
  colorRNG(noneChance).zip(typeRNG(numChance)).create();

/** @internal */
export namespace Component {
  export const toString = ([value, type]: Component) =>
    value === "none"
      ? "none"
      : type === "number"
        ? `${value}`
        : `${value * 100}%`;

  export const toJSON = ([value, type]: Component) =>
    value === "none"
      ? { type: "number", value: 0 }
      : {
          type,
          value,
        };
}

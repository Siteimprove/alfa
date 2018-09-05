import { AbsoluteLength, RelativeLength } from "../../types";

export type FontFamily = string | Array<string>;

export type FontSize = Readonly<
  // https://www.w3.org/TR/css-fonts/#absolute-size-value
  | {
      type: "absolute";
      value:
        | "xx-small"
        | "x-small"
        | "small"
        | "medium"
        | "large"
        | "x-large"
        | "xx-large";
    }
  // https://www.w3.org/TR/css-fonts/#relative-size-value
  | { type: "relative"; value: "larger" | "smaller" }
  // https://www.w3.org/TR/css-fonts/#length-percentage-size-value
  | { type: "length"; value: number; unit: AbsoluteLength }
  | { type: "percentage"; value: number; unit?: RelativeLength }
>;

export type FontWeight = number | "bolder" | "lighter";

import { Units } from "./units";

type ConvertibleUnit =
  | Units.AbsoluteLength
  | Units.Angle
  | Units.Time
  | Units.Frequency
  | Units.Resolution;

type Rates<U extends ConvertibleUnit> = { readonly [P in U]: number };

const lengths: Rates<Units.AbsoluteLength> = {
  cm: 96 / 2.54,
  mm: 96 / 2.54 / 10,
  Q: 96 / 2.54 / 40,
  in: 96,
  pc: 96 / 6,
  pt: 96 / 72,
  px: 1
};

export namespace Converters {
  export function length(
    value: number,
    from: Units.AbsoluteLength,
    to: Units.AbsoluteLength
  ): number {
    return value * (lengths[from] / lengths[to]);
  }
}

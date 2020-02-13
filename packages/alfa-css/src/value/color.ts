import { Number } from "./number";
import { Percentage } from "./percentage";

import { Hex } from "./color/hex";
import { RGB } from "./color/rgb";

export namespace Color {
  export function hex(value: number): Hex {
    return Hex.of(value);
  }

  export function rgb<
    C extends Number | Percentage,
    A extends Number | Percentage
  >(red: C, green: C, blue: C, alpha: A): RGB<C, A> {
    return RGB.of(red, green, blue, alpha);
  }
}

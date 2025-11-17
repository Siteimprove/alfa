import { Real } from "@siteimprove/alfa-math";

/**
 * {@link https://drafts.csswg.org/css-color/#hsl-to-rgb}
 *
 * @privateRemarks
 * We store saturation and lightness as percentages in HSL, so there is no need
 * to normalize them.
 *
 * @internal
 */
export function hslToRgb(
  hue: number,
  saturation: number,
  lightness: number,
): [red: number, green: number, blue: number] {
  function f(n: number) {
    let k = (n + hue / 30) % 12;
    let a = saturation * Math.min(lightness, 1 - lightness);
    return lightness - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  }

  return [f(0), f(8), f(4)];
}

/**
 * {@link https://drafts.csswg.org/css-color/#hwb-to-rgb}
 *
 * @internal
 */
export function hwbToRgb(
  hue: number,
  whiteness: number,
  blackness: number,
): [red: number, green: number, blue: number] {
  if (whiteness + blackness >= 1) {
    let gray = whiteness / (whiteness + blackness);
    return [gray, gray, gray];
  }
  let rgb = hslToRgb(hue, 100, 50);
  for (let i = 0; i < 3; i++) {
    rgb[i] *= 1 - whiteness - blackness;
    rgb[i] += whiteness;
  }
  return rgb;
}

/**
 * {@link https://drafts.csswg.org/css-color/#hsl-to-rgb}
 */
function hueToRgb(t1: number, t2: number, hue: number): number {
  if (hue < 1) {
    return t1 + (t2 - t1) * hue;
  }

  if (hue < 3) {
    return t2;
  }

  if (hue < 4) {
    return t1 + (t2 - t1) * (4 - hue);
  }

  return t1;
}

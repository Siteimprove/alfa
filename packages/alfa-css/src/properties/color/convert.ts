/**
 * @copyright Copyright © 2016 W3C® (MIT, ERCIM, Keio, Beihang). W3C liability,
 * trademark and document use rules apply.
 * @license https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
 */
export function hslToRgb(
  hue: number,
  saturation: number,
  lightness: number
): [number, number, number] {
  let t2;
  if (lightness <= 0.5) {
    t2 = lightness * (saturation + 1);
  } else {
    t2 = lightness + saturation - lightness * saturation;
  }
  const t1 = lightness * 2 - t2;
  const r = hueToRgb(t1, t2, hue + 2);
  const g = hueToRgb(t1, t2, hue);
  const b = hueToRgb(t1, t2, hue - 2);
  return [r, g, b];
}

/**
 * @copyright Copyright © 2016 W3C® (MIT, ERCIM, Keio, Beihang). W3C liability,
 * trademark and document use rules apply.
 * @license https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
 */
function hueToRgb(t1: number, t2: number, hue: number): number {
  if (hue < 0) {
    hue += 6;
  }
  if (hue >= 6) {
    hue -= 6;
  }

  if (hue < 1) {
    return (t2 - t1) * hue + t1;
  } else if (hue < 3) {
    return t2;
  } else if (hue < 4) {
    return (t2 - t1) * (4 - hue) + t1;
  } else {
    return t1;
  }
}

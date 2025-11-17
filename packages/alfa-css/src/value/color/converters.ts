/**
 * {@link https://drafts.csswg.org/css-color/#hsl-to-rgb}
 *
 * @param hue - The hue component, in degrees, as a number between 0 and 360.
 * @param saturation - The saturation component, as a number between 0 and 1.
 * @param lightness - The lightness component, as a number between 0 and 1.
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
 * @param hue - The hue component, in degrees, as a number between 0 and 360.
 * @param whiteness - The whiteness component, as a number between 0 and 1.
 * @param blackness - The blackness component, as a number between 0 and 1.
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
  let rgb = hslToRgb(hue, 1, 0.5);
  for (let i = 0; i < 3; i++) {
    rgb[i] *= 1 - whiteness - blackness;
    rgb[i] += whiteness;
  }
  return rgb;
}

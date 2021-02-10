import { RGB } from "@siteimprove/alfa-css";

const { min, max, round } = Math;

/**
 * @see https://w3c.github.io/wcag/guidelines/#dfn-relative-luminance
 */
function luminance(color: RGB): number {
  const [red, green, blue] = [color.red, color.green, color.blue].map((c) => {
    const component = c.type === "number" ? c.value / 0xff : c.value;

    return component <= 0.03928
      ? component / 12.92
      : Math.pow((component + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

/**
 * @see https://w3c.github.io/wcag/guidelines/#dfn-contrast-ratio
 */
export function contrast(foreground: RGB, background: RGB): number {
  const lf = luminance(foreground);
  const lb = luminance(background);

  const contrast = (max(lf, lb) + 0.05) / (min(lf, lb) + 0.05);

  return round(contrast * 100) / 100;
}

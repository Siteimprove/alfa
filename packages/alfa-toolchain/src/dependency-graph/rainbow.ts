import type { Color } from "ts-graphviz";

/**
 * @internal
 */
export namespace Rainbow {
  /**
   * Return a color x% along the rainbow spectrum.
   * {@link http://blog.adamcole.ca/2011/11/simple-javascript-rainbow-color.html}
   *
   * @remarks
   * Colors tend to be too bright making some with poor contrast on white
   * background, which is the use case. We should tweak that (maybe generating
   * HSL colors instead) to ensure the contrast is at least 3:1 with white,
   * preferably 4.5:1.
   */
  function rainbowStop(percentage: number): Color.RGB_RGBA {
    const f: (n: number, k?: number) => number = (
      n,
      k = (n + percentage * 12) % 12,
    ) => 0.5 - 0.5 * Math.max(Math.min(k - 3, 9 - k, 1), -1);

    return rgb2hex(f(0), f(8), f(4));
  }

  /**
   * Return a set of n colors evenly spaced along the rainbow spectrum.
   */
  export function rainbow(n: number): Array<Color.RGB_RGBA> {
    let result: Array<Color.RGB_RGBA> = [];

    for (let i = 0; i < n; i++) {
      result.push(rainbowStop(i / n));
    }

    return result;
  }

  function rgb2hex(r: number, g: number, b: number): Color.RGB_RGBA {
    return ("#" +
      [r, g, b]
        .map((x) =>
          Math.round(x * 255)
            .toString(16)
            .padStart(2, "0"),
        )
        .join("")) as Color.RGB_RGBA;
  }
}

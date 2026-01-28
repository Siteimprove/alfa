import { Color, Keyword, Percentage } from "@siteimprove/alfa-css";

export const rgb = (r: number, g: number, b: number, a: number = 1) =>
  Color.rgb(
    Percentage.of(r),
    Percentage.of(g),
    Percentage.of(b),
    Percentage.of(a),
  );

export const black = rgb(0, 0, 0);
export const white = rgb(1, 1, 1);

export const gray = (n: number) => rgb(n, n, n);

import { Values } from "../../values";

export type GenericFontFamily = Values.Keyword<
  "serif" | "sans-serif" | "cursive" | "fantasy" | "monospace"
>;

export type FontFamily = Values.List<GenericFontFamily | Values.String>;

export type AbsoluteFontSize = Values.Keyword<
  "xx-small" | "x-small" | "small" | "medium" | "large" | "x-large" | "xx-large"
>;

export type RelativeFontSize = Values.Keyword<"larger" | "smaller">;

export type FontSize =
  | AbsoluteFontSize
  | RelativeFontSize
  | Values.Length
  | Values.Percentage;

export type AsboluteFontWeight = Values.Keyword<"normal" | "bold">;

export type RelativeFontWeight = Values.Keyword<"bolder" | "lighter">;

export type FontWeight =
  | AsboluteFontWeight
  | RelativeFontWeight
  | Values.Number;
